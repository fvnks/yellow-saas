# Informe — Verificación exhaustiva del Módulo RRHH / Sueldos (Yellow ERP)

> Auditoría del módulo de Recursos Humanos y Remuneraciones: páginas, APIs, hooks, esquema de nómina, motor de cálculo chileno y liquidaciones.
> Método: lectura directa del código (motor de nómina, rutas, páginas, migraciones) contrastando contra el esquema real.
> **Escala: 2 páginas principales (`/hr`, `/dashboard/payroll`), 6 tabs HR (Attendance/Contracts/Evaluations/Onboarding/Training + Vacaciones), 2 motores de cálculo (`lib/payroll/index.ts` + `liquidation.ts`), ~16 endpoints, tests presentes en `api/lib/__tests__/*.test.ts`.**
> Hallazgos ordenados **de más crítico a menos crítico**.

---

## 0. Contexto clave: el esquema de nómina vive FUERA de las migraciones

El CRM/front funciona, pero **todo el esquema real de nómina se crea en runtime**, repartido en dos endpoints ad-hoc:
1. `apps/web/src/app/api/migrate/route.ts` (bootstrap) → crea `employees`, `payroll_runs`, `payroll_items` (versión mínima), `hr_contracts`, `hr_attendance`, `hr_evaluations`, `hr_training`, `hr_onboarding`.
2. `apps/web/src/app/api/payroll/migrate/route.ts` (POST manual) → agrega ~25 columnas a `employees`, 8 a `payroll_runs`, 6 a `payroll_items`, y crea `vacation_balances` + `vacation_requests`.

Las migraciones versionadas (`packages/db/supabase/migrations/001`) sólo tienen la versión **mínima** de estas tablas (sin `rut`, sin `afp_fund`, sin `gross_amount`, sin `code/category` en items, sin tablas de vacaciones).

---

## 🔴 CRÍTICO — La nómina NO funciona sin un paso manual

### C1. Todo el módulo depende de `/api/payroll/migrate` (que nadie documenta ni automatiza)
Las rutas **escriben/leen columnas** que sólo existen si alguien ejecutó manualmente `POST /api/payroll/migrate`:

- `payroll/calculate/route.ts` INSERT en `payroll_items` las columnas **`code, quantity, unit_value, is_employer, category`** y UPDATE en `payroll_runs` **`employee_count, gross_amount, total_deductions, total_employer, total_tax, net_amount`**.
- El esquema versionado (`001:504-529`) **no tiene ninguna** de esas columnas. Sólo las agrega `payroll/migrate/route.ts:50-77`.
- `hr/attendance` usa `e.rut`, `vacation-requests` usa `vacation_balances.days_available`, `employees` front usa `rut`, `afp_fund`, `health_type`, `mutual_type`, `apv_amount`, `image_url`, etc. — todo depende de `payroll/migrate`.

**Resultado**: sin ejecutar el endpoint manual, **calcular nómina devuelve 500**, **vacaciones 500**, **asistencia 500**, **el card de empleado no muestra datos**. No hay seed/auto-migrate que lo garantice.
**Fix**: mover TODAS estas columnas/tablas a migraciones versionadas (`094`+), eliminar el endpoint ad-hoc, y documentar el bootstrap.

### C2. `payroll/calculate` NO es atómico
`payroll/calculate/route.ts:92-150`: `DELETE payroll_items` → loop de `INSERT` por ítem → `UPDATE payroll_runs`, todo con `query()` separados (cada uno abre/cierra una conexión). Si falla a mitad, queda una corrida con ítems parciales y totales desincronizados.
**Fix**: envolver en `transaction(async client => …)`.

### C3. `payroll/liquidation` usa `params.id` (sin validar tenant)
`payroll/liquidation/route.ts:11` hace `const companyId = params.id` **directamente del path**, sin `getCompanyId` ni verificación de pertenencia (a diferencia de `calculate` que sí usa `getCompanyId`). Cross-tenant: un usuario autenticado puede calcular el finiquito de un empleado de otra empresa.
**Fix**: usar `getCompanyId(request)` + validar que el empleado pertenece a la empresa (ya lo hace `calculateTermination` en la query, pero el `company_id` de entrada viene de la URL manipulable).

---

## 🟠 ALTO — Errores legales / fiscales chilenos

### A1. Gratificación (Art. 47) mal calculada — en DOS lugares
- `lib/payroll/index.ts:146-171`: `gratificación = salary*12/12*months` tope `4.75 × UF × months`. **La gratificación legal es el 25% de lo devengado con tope 4.75 Ingresos Mínimos Mensuales (IMM), no UF.** `_ufValue=38500` ≈ $386,000 actualmente, pero 4.75 IMM ≈ 4.75 × $500.000 = $2.375.000 → el tope usado es ~6× menor al legal.
- `lib/payroll/liquidation.ts:147-149`: `monthlySalary * 0.25 * (months/12)` cap `4.75 × getUFValue()`. Mismo error de unidad (UF vs IMM).
**Impacto**: liquidaciones subestiman la gratificación.

### A2. `_ufValue` hardcodeado + estado global mutable
- `index.ts:8` `_ufValue = 38500`; `setUFValue` muta una **variable global de módulo**. En serverless/Next.js, ese estado puede sangrar entre requests concurrentes (no es thread-safe), y el valor está desactualizado (no consulta la UF real diaria; hay `lib/indicators.ts` que sí lo hace).
- El front también inicializa `ufValue = 38500` (payroll page línea 61) como fallback.

### A3. Tramo de 2ª categoría desactualizado y en unidades confusas
`index.ts:53-61` declara "2024" con tramos en UF y "deduction" (rebaja) en UF; la tabla SII se reajusta anualmente (UTM/UF). Los valores están estáticos. Además `calculateImpuestoUnico` aplica la rebaja como UF, que es correcto para esa tabla, pero **no hay índice por UTM ni actualización anual**.

### A4. Indemnización años de servicio: tope 45 UF incorrecto en muchos casos
`liquidation.ts`: cap indemnización `45 × UF` y máximo 11 meses. El tope real (Art. 163/ transitorio, y para contratos indefinidos post-1981) es **90 UF** en varios casos, y con la reforma (Ley 21.xxx) los topes cambiaron. Conviene revisar el caso de uso real (hubiera 330 días / 90 UF). Además `mutuo_acuerdo` aplica 50% del Art.161 lo cual es correcto sólo por convenio.

### A5. Horas extras: división inconsistente
`index.ts:244` `hourlyRate = monthlySalary / 30 / 8`. Usa 30 días y 8 h/día. Para trabajo en jornada legal de 44h/semana el divisor correcto depende de la jornada. Menor, pero puede sub/sobrevalorar.

---

## 🟡 MEDIO — Correctitud y robustez

### M1. `contract_type` con dos vocabularios en conflicto
- `001` y `migrate/route.ts` (bootstrap): `CHECK (contract_type IN ('indefinite','fixed_term','seasonal','part_time'))`, default `'indefinite'`.
- `payroll/migrate/route.ts:15,45`: agrega columna con default `'indefinido'` y **reescribe el CHECK** a `('indefinido','plazo_fijo','part_time','temporada','boleta_7a')`.
- `employees/route.ts` (POST) inserta `contract_type || 'indefinite'` (inglés), pero el front y la UI muestran `indefinido/plazo_fijo` (español). **Drift total**: según qué migración se haya ejecutado, un INSERT con `'indefinite'` vs `'indefinido'` pasa o falla.

### M2. `calculateEmployeePayroll` asume campos que el `Employee` de la query no garantiza
`payroll/calculate` mapea `SELECT * FROM employees` directamente a tipo `Employee` (que exige `rut, afp_fund, afp_rate, health_amount, mutual_type, apv_amount, hire_date`). Si `payroll/migrate` no corrió, estos campos son `undefined` → el motor calcula AFP con fallback pero `employee.health_amount > 0`/`apv_amount > 0` lanzan `NaN` o comportamiento errático.

### M3. Vacaciones: cálculo de días hábiles simplificado
`vacation-requests/route.ts:82-90` cuenta días hábiles excluyendo solo sáb/dom, **sin feriados chilenos**. Un permiso a través de un feriado descuenta saldo de más.

### M4. `hr/*` (attendance/contracts/evaluations/onboarding/training) sin CRUD completo
- `hr/attendance`: sólo GET/POST (sin PUT/DELETE por registro).
- `hr/contracts`: GET/POST + `[contractId]` (PUT/DELETE parcial).
- `hr/evaluations`, `hr/onboarding`, `hr/training`: sólo GET/POST, sin edición/borrado.
- Las tablas `hr_*` viven en `migrate/route.ts` (bootstrap), no en migraciones versionadas → mismo problema que C1.

### M5. RLS decorativo
Las políticas de payroll/vacaciones usan `current_company_id()` (función que la app `pg` no define/setea); mismo patrón que el resto del ERP: RLS no protege, el aislamiento es 100% `WHERE company_id` en app.

### M6. `api/payroll/previred/route.ts` existe
Confirmar si es stub o integración real (previred = nómina electrónica). Por patrón del resto del repo (SII/honorarios/f29 son stubs), es probable que también sea stub. Verificar antes de prometer funcionalidad Previred.

---

## 🟢 MENOR — Deuda y mejora

- **L1**: `payroll/page.tsx` hace `api.getUFValue()` con fallback `38500`; y el motor usa otro `_ufValue` global: **dos fuentes de UF distintas** que pueden divergir.
- **L2**: hay tests (`api/lib/__tests__/payroll.test.ts`, `format.test.ts`, `helpers.test.ts`, `invoices.test.ts`, `auth.test.ts`) — **bien**, pero no cubren `liquidation.ts` ni las rutas de `payroll/calculate`/`vacation` (sólo el motor puro).
- **L3**: duplicación `[locale]/hr` vs `/hr` (falla sistémica del repo).
- **L4**: `payroll_items` inserta `employee_id_ref` (columna fantasma en `payroll/migrate:72`) que no se usa en ninguna query → columna huérfana.
- **L5**: el `Employee` del motor y el `Employee` de la DB difieren (`position` vs `rut`), obligando a `any` en varios puntos.

---

## Resumen ejecutivo (crítico → menor)

| Prioridad | Hallazgo | Impacto |
|-----------|----------|---------|
| 🔴 C1 | Esquema de nómina fuera de migraciones (depende de `POST /api/payroll/migrate` manual) | Nómina/vacaciones/asistencia rotas en un deploy limpio |
| 🔴 C2 | `payroll/calculate` no atómico | Ítems/totales inconsistentes ante fallo |
| 🔴 C3 | `payroll/liquidation` usa `params.id` sin validar tenant | Fuga cross-tenant |
| 🟠 A1 | Gratificación con tope en UF en vez de IMM (Art. 47) | Liquidaciones infravaloradas |
| 🟠 A2 | UF hardcodeada + estado global mutable | Valores obsoletos / race en serverless |
| 🟠 A3–A5 | Tramos 2ª categoría estáticos, tope indemnización 45 UF, horas extras divisor fijo | Inexactitud fiscal |
| 🟡 M1 | `contract_type` con vocabulario dual (inglés/español) | INSERTs que fallan según migración ejecutada |
| 🟡 M2–M6 | Campos no garantizados, feriados no considerados, CRUD incompleto HR, RLS decorativo, previred sin verificar | Robustez / integridad |
| 🟢 L1–L5 | Dos fuentes de UF, tests parciales, duplicación `[locale]`, columna huérfana | Deuda |

## Plan de arreglo (orden)

1. **Consolidar esquema en migraciones versionadas**: mover todo `payroll/migrate` (columnas de `employees`/`payroll_runs`/`payroll_items` + tablas `vacation_balances`/`vacation_requests` + `hr_*`) a `migrations/*.sql` idempotentes; eliminar el endpoint manual.
2. **Atómicas**: `payroll/calculate` (DELETE+INSERT+UPDATE) y la reserva/descuento de vacaciones (`vacation-requests` POST: INSERT + UPDATE balance) en `transaction()`.
3. **`payroll/liquidation`**: usar `getCompanyId` + validar pertenencia del empleado.
4. **Corregir gratificación** (Art. 47=25% tope 4.75 IMM, no UF) en `index.ts` y `liquidation.ts`.
5. **UF dinámica real** (usar `lib/indicators.ts`/DB, no `38500` fijo) y quitar estado global `setUFValue`.
6. **Unificar `contract_type`** a un solo vocabulario (recomendado español) en migraciones, motor y UI.
7. **Actualizar tramos 2ª categoría** (indexar por UTM/UF anual) y revisar topes de indemnización (90 UF según caso).
8. **Vacaciones con feriados chilenos** (librería o tabla de feriados).
9. **Completar CRUD** de `hr/*` (evaluaciones/onboarding/training edición+borrado).
10. Verificar/nombrar `previred` (stub vs real), centralizar fuente de UF, ampliar tests a `liquidation.ts` y rutas.

---

*Verificado leyendo directamente: `lib/payroll/index.ts` (582 líneas), `lib/payroll/liquidation.ts` (265), `api/payroll/{calculate,liquidation,migrate,previred}`, `api/payroll/runs*`, `api/employees*`, `api/vacation*`, `api/hr/*`, `dashboard/payroll/page.tsx`, `migrate/route.ts` (bootstrap) y `migrations/001`.*
# Informe — Verificación exhaustiva del Módulo "Mi Condominio" (Yellow ERP)

> Auditoría del módulo de administración de condominios y gastos comunes (Ley 21.442 de Copropiedad Inmobiliaria).
> Método: lectura directa de páginas, 2 backends API, migración 072 y bootstrap `api/migrate/route.ts`.
> **Escala: 10 páginas, 10 rutas `/api/condominio/*` + 11 rutas `/api/companies/[id]/condos/*`, migración 072 (195 líneas) + tablas extra en bootstrap.**
> Hallazgos ordenados **de más crítico a menos crítico**.

---

## 🔴 CRÍTICO — Arquitectura sin multi-tenant y backends duplicados

### C1. El módulo NO es multi-tenant: usa `company_id` from query/body con default hardcodeado
**Todas** las rutas `/api/condominio/*` (las que usa la UI) hacen:
```js
const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';
```
- **No hay autenticación JWT ni verificación de pertenencia.** Cualquier persona (incluso sin login) puede consultar/modificar datos del condominio "demo" o pasar cualquier `company_id` por URL/body.
- El default `'00000000-...-0001'` hace que **todos apunten a un único condominio demo**; no hay aislamiento por empresa real.
- Contrasta con **AGENTS.md (regla 3: siempre `company_id` scope + RLS)** y con el patrón correcto del resto del ERP (que usa `getCompanyId(request)` + JWT).

### C2. Dos backends paralelos e inconsistentes
- `/api/condominio/*` (usa la UI, **no** multi-tenant, `company_id` por query/body, default hardcodeado).
- `/api/companies/[id]/condos/*` (multi-tenant correcto, `getCompanyId` + JWT, usa transacciones) **pero NINGUNA página lo consume**.

Así hay **dos implementaciones divergentes** de la misma lógica (prorrata, colillas, pagos). La activa es la insegura.

### C3. Tablas referenciadas que NO existen en migraciones versionadas
Las siguientes tablas sólo se crean en el bootstrap runtime (`api/migrate/route.ts`), NO en `packages/db/supabase/migrations/*`:
- `condos_assemblies`, `condos_assembly_proxies`, `condos_assembly_topics`, `condos_assembly_votes`
- `condos_utility_meters`, `condos_meter_readings`
- `condos_violations`, `condos_insurance_policies`

Sin ejecutar `/api/migrate`, las páginas de **Asambleas, Medidores y Multas/Seguros** rompen con "relation does not exist".

### C4. Tablas que NO existen en NINGÚN lado
- `condos_common_areas` (espacios comunes), `condos_reservations`, `condos_visitors` — **no existen en migraciones ni en bootstrap**. Sin embargo la página "Espacios" (`/condominio/espacios`) maneja reservas y visitas de estacionamiento.
- Resultado: la página **Espacios es 100% cliente** (`localStorage` + `INITIAL_*`), **sin backend, sin persistencia** en BD, por lo que se pierde al recargar/salir.

### C5. Seed automático viola el CHECK de `type`
`/api/condominio/route.ts` se embebe unidades con `type` = `'departamento'`, `'bodega'`, `'estacionamiento'`, pero el `CHECK` de `condos_units.type` (migración 072) es `('apartment','house','commercial','parking','storage')`. El auto-seed **fallará** (DataError 23514) en un deploy limpio.

---

## 🟠 ALTO — Datos falsos y columnas fantasma

### A1. Valores "placeholder" hardcodeados devueltos a la UI
`/api/condominio/route.ts` devuelve:
- `ownerRut: '12.345.678-9'` (RUT falso para TODOS los copropietarios).
- `areaM2: 65` (metros² fijos).
- `supplierName: 'Proveedor Servicio'`, `documentNumber: 'FAC-001'`, `referenceNumber: 'TR-001'`, `bankReconciled: true` (datos de pago/gasto inventados).

Esto es un **stub**: la UI muestra datos que no vienen de la base, engañando al usuario.

### A2. `condos_expense_items.amount_uf` insertada pero inexistente en migración
`/api/condominio/expenses/route.ts` INSERT en `amount_uf`; migración 072 sólo define `amount` y `amount_clp`. La columna `amount_uf` sólo la agrega el bootstrap (línea 574). Otro caso de drift (igual que C3). Si no corrió el bootstrap, **crear un gasto falla**.

### A3. El **modelo del cliente no coincide con la BD**
`lib/condominio-client.ts` define tipos con nombres en español y campos que no existen en BD:
- `type: 'departamento'|'casa'|'parcela'|'bodega'|'estacionamiento'` → BD: `apartment|house|commercial|parking|storage`.
- `areaM2`, `sectorId`/`sectorName`, `CondoSector` → **no hay columna `area_m2`** ni tabla de sectores en BD (los sectores son un array estático `[{ id:'s1', name:'Torre Central' }]`).

### A4. Cálculo no-atómico en el backend "companies"
`/api/companies/[id]/condos/[propertyId]/periods/[periodId]/calculate/route.ts` hace `DELETE condos_unit_statements` → loop `INSERT` → `UPDATE period` **sin transacción** (a diferencia del backend `/api/condominio/periods` que sí usa `transaction`). Un fallo a mitad deja colillas parciales.

### A5. Sin RLS en ninguna tabla de condominio
Migración 072 **no aplica `ENABLE ROW LEVEL SECURITY`** ni políticas, a diferencia del resto del ERP. Combinado con C1, no hay ni capa-aplicación ni capa-DB de aislamiento.

---

## 🟡 MEDIO — Correctitud y robustez

### M1. CRUD incompleto
- **Asambleas**: hay GET/POST (crear asamblea, agregar tema, votar), pero **no hay** PUT/cierre de asamblea, ni edición/borrado de temas, ni registro de asistencia/quórum por unidad (Ley 21.442 exige quórum y libro de actas).
- **Multas/Seguros**: POST crea pero **no hay** edición ni anulación; el importe en UF (`fine_amount_uf`) no se reajusta.
- **Medidores**: POST registra lectura, pero **no hay** edición/borrado de lectura ni medidor.
- **Unidades/Copietarios**: tienes `/api/condominio/units`, pero el detalle de copropietarios (RUT, email, teléfono) se guarda en `resident_name/resident_email/resident_phone`, **sin RUT real** (ver A1).

### M2. Sin prorrata mixta por categoría en el cálculo básico
El cálculo usa solo el coeficiente `'general'`. La Ley y la práctica chilena distinguen **gastos comunes ordinarios vs. gastos de mantención/ascensor por prorrata según tipo de unidad** (ej. primer piso no paga ascensor). El backend `/api/condominio/periods` sí considera `coefficient_category` en la tabla, pero el cálculo principal sólo usa `'general'`.

### M3. Interés por mora simplificado
`late_interest_clp = deuda × (interés_mensual%)` — es un único mes, sin cálculo por días de atraso ni tasa reajustable. La práctica chilena suele aplicar interés penal diario/mensual sobre el saldo; conviene confirmar la política del condominio.

### M4. Sin UF dinámica
El fondo de reserva y las multas se manejan en CLP o con UF estática (no integra `lib/indicators.ts` ni tablas `uf_values`). No hay revalorización automática UF→CLP del día de pago.

### M5. Portal de residentes sin autenticación
`/condominio/portal` lee `/api/condominio` (sin login): cualquier persona vería el panel de copropietarios (sin token, como en veterinaria se usaba `portal_tokens`). No hay mecanismo de acceso por token/rol de copropietario.

---

## 🟢 MENOR — Deuda / mejora

- **L1**: Duplicación `[locale]/condominio` vs `/condominio` (misma falla sistémica).
- **L2**: `INITIAL_SECTORS/UNITS/PERIODS/PAYMENTS` están vacíos (`[]`) pero las páginas los usan como fallback → las páginas quedan vacías si la API falla (antes tenían data demo).
- **L3**: `bankReconciled: true` fijo (no hay conciliación bancaria real de pagos de gastos comunes).
- **L4**: `importar` page existe pero no hay backend específico (probablemente depende de `/api/condominio`).
- **L5**: El módulo se registra en `module_catalog` (precio $14.990/mes) pero el sidebar "Herramientas → Mi Condominio" no valida activación de módulo (a diferencia de los módulos con `requiredModule`).

---

## Cumplimiento Ley 21.442 (Copropiedad Inmobiliaria) — resumen

| Requisito | Estado |
|-----------|--------|
| Gastos comunes con prorrata por coeficientes | ⚠️ Parcial (solo categoría `general`) |
| Fondo de reserva (%) | ✅ (`reserve_fund_pct`) |
| Interés por mora | ⚠️ Simplificado (1 mes, sin días) |
| Asambleas con quórum y votación ponderada por % | ✅ Bases (`condos_assemblies` + votos con alícuota) pero sin cierre/acta |
| Actas y libro de asambleas | ⚠️ Campo `minutes_text`, sin generación de acta |
| Representación por poder (proxies) | ⚠️ Tabla `condos_assembly_proxies` existe, sin UI/API |
| Reglamento de copropiedad | ❌ No existe |
| Multas/amonestaciones | ⚠️ POST crea, sin notificación al copropietario ni reajuste UF |
| Seguros (incendio/terremoto obligatorio) | ✅ (`condos_insurance_policies`) |
| RUT válido de copropietarios | ❌ RUT falso `12.345.678-9` |
| Administrador/comité | ❌ No modelado |

---

## Resumen ejecutivo (crítico → menor)

| Prioridad | Hallazgo | Impacto |
|-----------|----------|---------|
| 🔴 C1 | Backend `/api/condominio/*` sin multi-tenant ni auth (company_id por URL con default fijo) | Fuga de datos / sin aislamiento |
| 🔴 C2 | Dos backends paralelos (activo es el inseguro) | Divergencia, doble mantenimiento |
| 🔴 C3 | Tablas (asambleas/medidores/multas/seguros) sólo en bootstrap, no en migraciones | Páginas rotas en deploy limpio |
| 🔴 C4 | Tablas de espacios/reservas/visitas NO existen → página "Espacios" 100% cliente | Datos no persistidos |
| 🔴 C5 | Seed viola CHECK de `type` (departamento vs apartment) | Auto-seed falla |
| 🟠 A1 | RUT/área/proveedor/documento fake hardcodeados | Datos falsos al usuario |
| 🟠 A2 | `amount_uf` inexistente en migración | Crear gasto falla sin bootstrap |
| 🟠 A3 | Modelo cliente (camelCase/español) ≠ BD (snake_case/inglés) | Desalineación |
| 🟠 A4 | Cálculo del backend companies no-atómico | Colillas parciales |
| 🟠 A5 | Sin RLS en tablas de condominio | Sin aislamiento DB |
| 🟡 M1–M5 | CRUD incompleto, prorrata mixta, mora, UF, portal sin auth | Completitud / cumplimiento |
| 🟢 L1–L5 | Deuda | Calidad |

---

*Verificado leyendo: migración 072, bootstrap `api/migrate/route.ts` (líneas 570-728), `/api/condominio/{route,assemblies,meters,violations,expenses,periods,payments,units}.ts`, `/api/companies/[id]/condos/*`, `lib/condominio-client.ts`, y las 10 páginas del módulo.*
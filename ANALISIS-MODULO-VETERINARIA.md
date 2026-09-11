# Análisis exhaustivo del Módulo de Veterinaria — Yellow ERP

> Auditoría técnica completa del módulo de Veterinaria/Clínica. Basada en lectura directa de código, esquema SQL y endpoints.
> Ruta raíz: `apps/web/src/app/veterinaria/*` (+ duplicado `[locale]/veterinaria/*`) y `apps/web/src/app/api/companies/[id]/veterinary/*`.

---

## 0. Mapa del módulo (qué existe)

### Páginas (24 páginas)
`dashboard`, `agenda`, `consultas`, `clinical evolutions`, `cola` (sala de espera), `pacientes` (+ detalle `[id]`), `clientes`, `vacunas`, `cirugias`, `recetas`, `farmacia`, `laboratorio`, `hospitalizacion`, `presupuestos`, `pagos`, `recordatorios`, `profesionales`, `rooms` (boxes), `configuracion/especies`, `configuracion/servicios`, `portal-tokens`, `reportes`.

### API (≈ 60 archivos de ruta)
CRUD completo por entidad: `species`, `clients`, `patients`, `professionals`, `services`, `rooms`, `appointments`, `consultations`, `vaccinations`, `dewormings`, `prescriptions`, `surgeries`, `hospitalizations` (+ `hospitalization-logs`), `evolutions`, `reminders`, `auto-reminders`, `estimates`, `payments`, `lab-panels`, `lab-tests`, `lab-orders`, `lab-results`, `pharmacy stock`, `pharmacy dispense`, `portal-tokens`, `queue`, `dashboard`, `notifications/{whatsapp,email,sms,prescription-pdf,estimate-pdf,lab-result-pdf,vaccination-carnet}`.

### Hooks (24 `use-*`)
Cubren todas las entidades (clientes, pacientes, profesionales, servicios, rooms, citas, consultas, evoluciones, vacunas, desparasitaciones, recetas, cirugías, hospitalizaciones, laboratorio, estimaciones, recordatorios, farmacia, portal tokens, cola, pagos, especies).

### Tablas BD
Migración **074** (17 tablas clínicas) + **093** (portal tokens + farmacia stock + dispensaciones) + especies en 074.

---

## 1. BUGS CRÍTICOS (rompen funcionalidad)

### 🔴 1.1 `auth.uid()` en SQL plano → INSERT falla
Los endpoints llaman `auth.uid()` (función de Supabase) sobre PostgreSQL plano:

- `api/companies/[id]/veterinary/portal-tokens/route.ts:58` → `VALUES (…, auth.uid())`
- `api/companies/[id]/veterinary/pharmacy/dispense/route.ts:82` → `VALUES (…, auth.uid())`

**Resultado**: crear un token de portal o dispensar un medicamento **lanza `function auth.uid() does not exist`** y devuelve 500. La DB de Railway es Postgres puro (NO Supabase), así que estas dos acciones están **rotas**.

**Fix**: reemplazar `auth.uid()` por un valor derivado del JWT (extraer `id` del payload vía middleware/helper) o `NULL`.

### 🔴 1.2 Migración 093 y 074 referencian `auth.users(id)`
- `074: veterinary_professionals.user_id REFERENCES auth.users(id)`
- `093: veterinary_portal_tokens.created_by REFERENCES auth.users(id)`
- `093: veterinary_pharmacy_dispenses.dispensed_by REFERENCES auth.users(id)`

El esquema `auth`/tabla `auth.users` **sólo existe bajo Supabase**. Como el deploy usa `scripts/migrate.js` con `pg` directo, estas migraciones **pueden fallar al ejecutarse** (o si se aplicaron en un entorno Supabase antes, en Railway no). Conviene verificar el estado real de esas columnas en producción.

**Fix**: cambiar a `profiles(id)` (que sí existe) o quitar el FK y usar `TEXT`/`UUID` nullable.

### 🔴 1.3 Dashboard con "shape" desincronizado → vacío
- API `veterinary/dashboard/route.ts` devuelve: `appointments_today` (int), `appointments_by_status`, `active_patients` (int), `active_hospitalizations` (int), `pending_reminders` (int), `recent_consultations`, `upcoming_appointments`, `overdue_vaccinations`.
- Pero `veterinaria/page.tsx` consume: `result.data?.appointments`, `…patients`, `…hospitalizations`, `…reminders` (arrays), e itera `apt.appointmentTime`, `apt.patientName`, etc.

**Resultado**: los KPIs muestran `0` y las listas vacías; `apt.appointmentTime` es `undefined`. El dashboard queda **prácticamente inutilizado** aunque no lanza error.

**Fix**: alinear el cliente al contrato del endpoint (o el endpoint al cliente). Elegir un contrato único.

### 🟠 1.4 `veterinary_prescription_items` sin `company_id`
- Tabla en migración 074 **no tiene** `company_id`, a diferencia de todas las demás.
- Además se le hace `ENABLE ROW LEVEL SECURITY` **sin** crearle política → si RLS se activara, bloquearía todo acceso; y rompe el patrón multi-tenant.
- El `POST /prescriptions` inserta items correctamente vía transacción, pero no puede filtrar por tenant de forma directa (depende del `prescription_id` padre).

**Fix**: añadir `company_id UUID NOT NULL REFERENCES companies(id)`, backfill, y política RLS consistente.

---

## 2. Seguridad y multi-tenant

### 🟠 2.1 Sin verificación JWT en los handlers (dependen del middleware)
Todos los endpoints usan `getCompanyId(request)` que **lee el `company_id` de la URL**, sin re-validar contra el JWT. El middleware cubre `/api/companies/*` (compara URL vs token), así que la ruta veterinaria está nominalmente protegida. Pero:
- Si la ruta se invoca por paths excluidos del matcher del middleware (el matcher excluye `admin`, `auto-talleres`, `ayuda`, `portal`, `view`), podría quedar sin guardia.
- **Recomendación**: validar `company_id` desde el JWT en `getCompanyId` (o un helper `getAuthCompanyId`) en lugar de confiar en la URL.

### 🟠 2.2 RLS decorativo (misma falla sistémica)
Las 20+ políticas RLS de veterinaria usan:
- `company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid())` → `auth.uid()` no existe en Postgres plano.
- La app usa `pg` directo y **nunca** activa el contexto RLS (`auth.uid()`/`app.current_company_id`).

**Resultado**: RLS no aporta protección real; el aislamiento depende 100% de las cláusulas `WHERE company_id = $1` en cada query (que en su mayoría están bien).

### 🟡 2.3 `portal-tokens` pública sin límite de expiración por defecto
- `expires_at` es `nullable` y el `POST` lo acepta como opcional; un token sin `expires_at` **nunca expira**.
- El token se genera con `crypto.randomBytes(32)` (64 hex, seguro).
- Falta validar que `patient_id`/`client_id` pertenezcan al mismo `company_id` antes de crear el token (posible cross-tenant si se envía un ID de otra empresa).

**Fix**: obligar `expires_at` o default razonable (30 días), y validar pertenencia del paciente/cliente.

### 🟡 2.4 Sin autorización por rol dentro de Veterinaria
No hay verificación de que el usuario tenga permiso sobre el módulo `veterinaria` (el sistema de Roles & Permisos del ERP no se aplica aquí). Cualquier usuario autenticado de la empresa puede leer/escribir todo el módulo.

---

## 3. Esquema de datos (migraciones 074 y 093)

### Correcto 👍
- Todas las tablas clínicas con `company_id NOT NULL … ON DELETE CASCADE`.
- Índices por `company_id` en las tablas calientes (citas, pacientes, recordatorios, laboratorio, pagos).
- Enums `CHECK` coherentes (status de citas, prioridad hospitalización, flags lab).
- `veterinary_pharmacy_stock.quantity >= 0` y `dispense.quantity > 0`.
- Presupuestos con `UNIQUE(company_id, estimate_number)`, `iva_pct`, moneda CLP/UF.

### Problemas ⚠️
- **`veterinary_prescription_items` sin `company_id`** (ya descrito).
- **`veterinary_pharmacy_dispenses`** creada en 093 **no se le aplica RLS** (a diferencia del resto) y su stock se descuenta sin transacción atómica con el INSERT del dispense (ver 4.x).
- `veterinary_evolutions.consultation_id` apunta a consultas con `ON DELETE SET NULL`, correcto, pero el campo diagnóstico es `VARCHAR(500)` plano (no FK a una lista de CIE/SNOMED).
- No hay tabla de **imágenes/estudios de imagenología** pese a que el store define `ImagingStudy` y el enum de servicios incluye `imagenologia` (feature no implementada).
- No hay tabla para **pesaje/historial de peso** (sólo `current_weight_kg` en pacientes y `weight_kg` en consultas/evoluciones).

### Migraciones faltantes en el rango del módulo
- **Faltan `077–080` y `087–089`** en la secuencia global (no son de veterinaria específicamente, pero conviene reconciliar para evitar drift).

---

## 4. API / lógica de negocio

### Correcto 👍
- Patrón consistente de `getCompanyId` + `parseSearchParams` + `paginatedResponse`.
- **Sanitización de `sort`/`order`** mediante listas blancas (`allowedSort`) en clientes, vacunas, consultas, citas. **Bien** (evita SQLi por ORDER BY).
- Filtros `search` con `ILIKE` parametrizado.
- Validación de datos obligatorios en `POST` (ej. consulta exige `patient_id`, `client_id`, `professional_id`, `reason_for_visit`).
- `POST /prescriptions` usa **transacción** para cabecera + items. Bien.
- `POST /patients/:id` valida `gender` y existencia de `client_id` del mismo tenant. Bien.
- Dashboard usa `Promise.all` (8 queries paralelas). Bien para performance.

### Problemas / faltantes ⚠️
1. **Dispensación sin transacción**: `dispense` INSERT + UPDATE de stock **no** son atómicos. Si falla el UPDATE, queda un dispense registrado sin descuento de stock (o viceversa). Usar `transaction`.
2. **Carrera de stock**: dos dispensaciones concurrentes pueden leer el mismo `quantity` y sobre-vender. Conviene `UPDATE … WHERE quantity >= $n RETURNING` atómico.
3. **`auth.uid()`** en dispense y portal-tokens (bug 1.1).
4. **No hay validación cruzada de tenant** en `POST` de vacunas/desparasitaciones/presupuestos/pagos/lab-orders (se confía en que `patient_id`, `professional_id`, etc. del body pertenezcan a la empresa). Si el middleware sólo valida URL, un cliente podría referenciar IDs de otra empresa. Recomendable verificar pertenencia.
5. **`body_condition`** se acepta como texto libre (el store dice `'1/5' … '5/5'`) sin CHECK en BD ni validación en API.
6. **Notificaciones (whatsapp/email/sms)** existen como endpoints, pero hay que verificar si son stubs (como el SII) o integraciones reales.

---

## 5. UX / UI / consistencia

### Correcto 👍
- sigue el design system Sun-Slate (`#0F172A` sidebar, `#FACC15` acentos, `#F8FAFC` fondo, `rounded-2xl`).
- `formatCLP` con `es-CL` y RUT en presupuestos/pagos.
- Sidebar propia con branding de módulo y breadcrumbs.

### Problemas ⚠️
1. **Nav duplicada completa `[locale]/veterinaria/*` vs `veterinaria/*`** (misma duplicación sistémica). Doble mantenimiento y posible divergencia. Elegir `[locale]` y eliminar la otra.
2. **Hardcoded**: en `veterinaria/page.tsx:166` dice textual `1 paciente prioridad alta` (valor fijo, no calculado). Debe calcularse con `hospitalizations.filter(h => h.priority === 'alta' || 'critica')`.
3. **KPIs mezclan semántica**: "Pacientes Activos" cuenta `patients.length` pero abajo dice "X esterilizados con chip" usando `p.isSterilized` (campos distintos). Menor, pero confuso.
4. **"Hospitalizados UCI"** etiqueta engaña: cuenta todas las hospitalizaciones activas, no sólo UCI/prioridad alta.
5. **Faltan páginas vs sidebar**: el sidebar lista "Evolución & Notas SOAP", "Sala de Espera", "Reportes"… que sí existen; pero **faltan en sidebar**: recetas tie, laboratorio, etc. Verificar que cada `path` del sidebar tenga su `page.tsx` y viceversa. Revisar `reportes` (existe) y `cola` (existe) — OK, pero confirmar `rooms` vs `configuracion` naming (hay `rooms/page.tsx` y `configuracion/servicios|especies` — coherente).
6. **`print-modal.tsx`** tiene `text-white bg-[#FACC15] text-slate-950` (doble color de texto) — inconsistencia visual menor.

---

## 6. Qué FALTA (features ausentes o incompletas)

| Funcionalidad | Estado | Nota |
|---------------|--------|------|
| Imagenología / estudios | ❌ Solo tipos de TS (`ImagingStudy`), sin tabla, API ni página | `service.category='imagenologia'` existe pero no hay dónde registrar estudios |
| Historial de peso | ⚠️ Parcial | Sólo peso actual en paciente + peso por consulta/evolución |
| Ficha clínica unificada 360° | ⚠️ Parcial | `pacientes/[id]` muestra algunos datos; falta integrar vacunas+lab+recetas+cirugías en una sola vista |
| Firma digital de consentimientos | ⚠️ Parcial | `informed-consent-modal` genera texto, no firma electrónica real |
| Notificaciones reales (WhatsApp/Email/SMS) | ❓ Verificar stub vs real | Endpoints existen |
| Integración DTE SII desde presupuesto → boleta/factura | ⚠️ Parcial | Había `VeterinaryInvoiceEstimate` en store; verificar flujo completo |
| Estados de stock en UMs (no enteros) | ⚠️ | `quantity INT` limita a unidades enteras (píldoras, ml) |
| Recordatorios automáticos (auto-reminders) | ⚠️ | Existe endpoint `auto-reminders`; verificar si hay cron/job que lo dispare |
| Tests / coverage | ❌ 0 tests propios | Ver §7 |

---

## 7. Calidad / mantenibilidad

- **0 tests** para veterinaria (ni unitarios ni e2e). Para un módulo clínico-financiero, es riesgo alto. Sugerir al menos: `pharmacy dispense` (stock), `dte`/presupuesto, `auth.uid` fixes.
- **Hooks `use-*` duplicados** en `[locale]/veterinaria/hooks` (misma estructura que `veterinaria/hooks`). Consolidar.
- **`veterinary-store.ts` duplicado** en ambos árboles, con tipos que no coinciden 1:1 con el esquema (store usa camelCase + `ImagingStudy`, BD usa snake_case). Riesgo de drift entre front y back.
- **Migraciones con `uuid_generate_v4()` (074) vs `gen_random_uuid()` (093)** — inconsistencia de generador de UUID; asegurar que la extensión `uuid-ossp` esté disponible en Railway.

---

## 8. Resumen: bien vs mal

### ✅ Bien implementado
- Cobertura de entidades muy completa (clínica, finanzas, farmacia, laboratorio, portal).
- Multi-tenant correcto en cláusulas `WHERE company_id` de casi todas las queries.
- Sanitización de `sort/order` (anti-SQLi) y queries parametrizadas.
- Transacción en creación de recetas.
- Enums/CHECK de estado coherentes.
- UI alineada al design system Sun-Slate y formatos CLP/RUT.

### ❌ Está mal (para arreglar ya)
1. `auth.uid()` en `portal-tokens` y `pharmacy/dispense` (INSERT roto).
2. `auth.users(id)` FK en migraciones 074/093 (riesgo de fallo de migración en Railway).
3. Dashboard desincronizado (shape del endpoint vs consumo).
4. `veterinary_prescription_items` sin `company_id` + RLS sin política.
5. KPIs con valores hardcodeados/etiquetas engañosas.
6. Dispensación no atómica + race de stock.
7. `print-modal` con colores de texto contradictorios.

### ⚠️ Falta / mejorar
- Imagenología (tipos sin implementación).
- Ficha 360° unificada y firma digital real.
- Validación cross-tenant en POST de entidades hijas.
- `expires_at` obligatorio en portal-tokens.
- Verificación de notificaciones (stub vs real) y de auto-reminders.
- Tests y consolidación de la duplicación `[locale]`.

---

## 9. Plan de arreglo sugerido (orden de prioridad)

1. **Roturar `auth.uid()`** (2 archivos) → restaurar portal-tokens y dispensación.
2. **Corregir FKs `auth.users` → `profiles`** (migración nueva o fix idempotente).
3. **Alinear contrato del dashboard** (endpoint o cliente).
4. **Añadir `company_id` a `veterinary_prescription_items`** + política RLS.
5. **Hacer atómica y race-safe la dispensación** (transacción + `UPDATE … WHERE quantity>=n`).
6. **Validación cross-tenant** en POST de vacunas/desparasitaciones/presupuestos/pagos/lab-orders.
7. **Corregir KPIs hardcodeados** y etiquetas.
8. **Portal-tokens**: exigir `expires_at` y validar pertenencia paciente/cliente.
9. **Consolidar duplicación `[locale]/veterinaria`** y `veterinary-store.ts`/hooks.
10. **Añadir tests** para dispensación, presupuesto y portal-tokens.

*Informe generado por lectura directa: migraciones 074 y 093, layout, store, sidebar-items, api-client (getVet*), routes de clients/patients/consultations/vaccinations/prescriptions/portal-tokens/pharmacy-dispense/dashboard, y page.tsx/reportes del módulo.*
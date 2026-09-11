# Verificación intensa del Módulo de Veterinaria — Informe final

> Segunda pasada de auditoría, de verificación exhaustiva sobre el estado **actual** del código.
> Comprobación cruzada: páginas ↔ API endpoints ↔ hooks ↔ sidebar ↔ migraciones ↔ cliente `ApiClient`.
> Fecha: sesión actual. Basado en lectura directa de archivos (migraciones 074, 093, 094–097; rutas API; páginas; hooks; api-client).

---

## 0. Inventario exacto (verificado)

| Capa | Cantidad | Detalle |
|------|----------|---------|
| Páginas `page.tsx` | 24 | dashboard, agenda, consultas, evoluciones, cola, pacientes (+`[id]`), clientes, vacunas, cirugias, recetas, farmacia, laboratorio, hospitalizacion, presupuestos, pagos, recordatorios, profesionales, rooms, configuracion/especies, configuracion/servicios, portal-tokens, reportes, **imagenologia** |
| Endpoints API (route.ts) | 60 | CRUD + notifications + imaging + dashboard + queue + auto-reminders + pharmacy |
| Hooks `use-*` | 22 | (ver listado) |
| Sidebar items | 24 | agrupados en 5 grupos |
| Migraciones del módulo | 074, 093, **094, 095, 096, 097** | (097 = imaging; 096 = fix auth.uid + prescription_items) |
| Métodos en `ApiClient` (Vet) | ~75 | get/create/update/delete por entidad + notificaciones + imaging + pharmacy + queue |

---

## 1. Correcciones importantes respecto a la auditoría anterior

Varios bugs que se detectaron en la pasada anterior **ya fueron corregidos** en migraciones/rutas posteriores. Aclaración para no re-trabajar lo ya resuelto:

| Issue anterior | Estado actual | Evidencia |
|----------------|---------------|-----------|
| `auth.uid()` en `portal-tokens` y `dispense` | ✅ **Corregido** (usa `jwtVerify` + `getUserId`) | `portal-tokens/route.ts`, `dispense/route.ts` |
| FK `auth.users(id)` en 074/093 | ✅ **Corregido** (DROP CONSTRAINT en 096) | `096_fix_auth_uid_and_prescription_items.sql` |
| Dispensación sin transacción / race de stock | ✅ **Corregido** (transacción + `FOR UPDATE`) | `dispense/route.ts:82-116` |
| `veterinary_prescription_items` sin `company_id` | ✅ **Corregido en BD** (columna + backfill + RLS en 096) | `096:17-39` |
| RLS sin política en prescription_items | ✅ **Corregido** (política en 096) | `096:41-51` |
| Tabla de imagenología inexistente | ✅ **Existe** (migración 097) | `097_veterinary_imaging_studies.sql` |

⚠️ **Nota crítica**: la corrección de `company_id` en `veterinary_prescription_items` **introdujo una regresión** en los endpoints de recetas (ver §2.1). El esquema quedó como `NOT NULL` pero los INSERT de items **no** envían `company_id`.

---

## 2. BUGS CRÍTICOS (rompen funcionalidad, estado actual)

### 🔴 2.1 Recetas: INSERT de items sin `company_id` (regresión)
Tras la migración 096, `veterinary_prescription_items.company_id` es `NOT NULL`. Pero ambos endpoints insertan items **sin** `company_id`:
- `prescriptions/route.ts:114` (POST crear receta con items)
- `prescriptions/[prescriptionId]/route.ts:95` (PUT reemplaza items)

**Resultado**: **crear o editar una receta con ítems falla** con violación `NOT NULL` en `company_id`.
**Fix**: añadir `company_id` en ambos `INSERT INTO veterinary_prescription_items` (usar `companyId` ya disponible), y en el `DELETE` de items incluir `AND company_id = $n`.

Además, el `DELETE FROM veterinary_prescription_items WHERE prescription_id = $1` (línea 89) borra sin filtro de tenant (menor, pero conviene alinear).

### 🔴 2.2 Cola de espera: consulta a columnas inexistentes
`queue/route.ts:10-25` selecciona `a.patient_name`, `a.species`, `a.client_name`, `a.client_phone`, `a.service_name`, `a.professional_name`, `a.room_name` **directamente de `veterinary_appointments`**, pero esas columnas no existen (son FKs `patient_id`, `client_id`, etc. sin JOIN).

**Resultado**: el endpoint `/veterinary/queue` lanza `column a.patient_name does not exist` → **la página "Sala de Espera" (`/veterinaria/cola`) devuelve 500**.
**Fix**: añadir los `JOIN` a `veterinary_patients`, `veterinary_clients`, `veterinary_services`, `veterinary_professionals`, `veterinary_rooms` (o usar subselects como en `dashboard` y `appointments`).

---

## 3. Bugs / inconsistencias MEDIOS

### 🟠 3.1 Dashboard desincronizado (shape endpoint vs consumo)
- API `dashboard/route.ts` devuelve: `appointments_today`, `appointments_by_status`, `active_patients`, `active_hospitalizations`, `pending_reminders`, `recent_consultations`, `upcoming_appointments`, `overdue_vaccinations`.
- Página `veterinaria/page.tsx` consume: `result.data?.appointments`, `…patients`, `…hospitalizations`, `…reminders` (arrays) e itera `apt.appointmentTime`, `apt.patientName`, etc.

**Resultado**: KPIs en cero y listas vacías; el dashboard queda **visualmente roto aun sin error** (campos `undefined`).
**Fix**: unificar contrato. Recomendación: hacer que la página consuma `appointments_today`/`active_patients`/etc. o bien que el endpoint devuelva los arrays que la vista espera.

### 🟠 3.2 KPIs con datos fijos / engañosos (`veterinaria/page.tsx`)
- Línea ~166: literal `1 paciente prioridad alta` (hardcodeado).
- "Pacientes Activos" muestra `patients.length` pero el subtexto habla de esterilizados (`p.isSterilized`); semántica cruzada.
- "Hospitalizados UCI" cuenta todas las hospitalizaciones activas, no sólo UCI/prioridad alta.

### 🟠 3.3 Falta validación cross-tenant en POST de entidades hijas (parcial)
Algunos POST validan bien (imagenología, consultas, citas, recetas, cirugías, hospitalizaciones, lab-orders, dewormings, evolutions): verifican que `patient_id`/`client_id`/`professional_id` sean de la empresa.
Pero **no** validan pertenencia:
- `vaccinations/route.ts` (POST): inserta sin verificar `patient_id`, `professional_id`, `consultation_id` (sólo pide que vengan).
- `payments/route.ts` (POST): verifica patient/client pero no `estimate_id` (si se envía un presupuesto de otra empresa).
- `reminders/route.ts` (POST): no verifica `patient_id`/`client_id`.
- `lab-results` y `lab-panels` tests: verificar `panel_id`/`order_id` cross-tenant.

**Riesgo**: referencia cruzada a registros de otro tenant si el front manda IDs ajenos (el middleware sólo valida el `company_id` de la URL).

### 🟠 3.4 Portal-tokens: `expires_at` opcional
`portal-tokens/route.ts` acepta `expires_at || null`. Un token sin expiración **nunca caduca**. Además no valida que `patient_id`/`client_id` pertenezcan a la misma `company_id` antes de crearlo.

---

## 4. APIs faltantes / acciones ausentes (gap de CRUD)

### 4.1 Imagenología: sin DELETE y sin UPDATE por id en path
- Endpoint `imaging` sólo expone `GET` (lista), `POST`, `PATCH` (por body, sin `[id]`).
- El cliente `ApiClient` tiene `getVetImaging`, `createVetImaging`, `updateVetImaging` — **pero no hay `deleteVetImaging`** ni ruta `DELETE`.
- La página `imagenologia/page.tsx` **no ofrece acción de eliminar ni editar** (sólo ver detalle en modal). Feature incompleta frente al resto del módulo.

### 4.2 Falta `getVetDeworming(id)` / detalle individual
- `ApiClient` tiene `getVetDewormings` (lista) + create/update/delete, pero **no hay `getVetDeworming(id)`**; sin endpoint de detalle. Menor (la lista trae datos), pero rompe el patrón de las demás entidades (clientes, pacientes, profesionales, citas, consultas, recetas, cirugías, hospitalizaciones, lab-orders, estimados **sí** tienen get-by-id).

### 4.3 Desbalance en `slug` vs `path` del cliente
Verificar que todos los métodos del cliente tengan su ruta real. Cruce detectado:
- `updateVetImaging(data)` usa `PATCH /veterinary/imaging` (sin id en path) — coherente con el endpoint, pero rompe el convenio REST del resto.

### 4.4 Notificaciones = stubs (no envían nada)
- `notifications/whatsapp/route.ts` declara explícito `// STUB` y devuelve un `wa.me` deep-link (no envía).
- `notifications/email` y `notifications/sms` generan HTML/URL pero **no** integran proveedor real (SendGrid/Resend/Twilio). El comentario dice "frontend sends via…" pero no hay envío server-side.
- Considerar si es aceptable (envío manual por el operador) o si falta integración real.

---

## 5. Cross-check sidebar ↔ páginas ↔ endpoints

### Sidebar items (24) vs páginas existentes
| Sidebar path | Página | Endpoint | Estado |
|--------------|--------|----------|--------|
| /veterinaria | ✅ | dashboard (⚠️ desincronizado) | ⚠️ |
| /veterinaria/agenda | ✅ | appointments | ✅ |
| /veterinaria/consultas | ✅ | consultations | ✅ |
| /veterinaria/cola | ✅ | queue (**🐞 roto**) | 🔴 |
| /veterinaria/evoluciones | ✅ | evolutions | ✅ |
| /veterinaria/pacientes | ✅ (+[id]) | patients | ✅ |
| /veterinaria/clientes | ✅ | clients | ✅ |
| /veterinaria/vacunas | ✅ | vaccinations | ⚠️ sin validación |
| /veterinaria/hospitalizacion | ✅ | hospitalizations + logs | ✅ |
| /veterinaria/cirugias | ✅ | surgeries | ✅ |
| /veterinaria/recetas | ✅ | prescriptions | 🔴 items sin company_id |
| /veterinaria/farmacia | ✅ | pharmacy stock+dispense | ✅ (arreglado) |
| /veterinaria/laboratorio | ✅ | lab-* | ✅ |
| /veterinaria/presupuestos | ✅ | estimates | ✅ |
| /veterinaria/pagos | ✅ | payments | ⚠️ |
| /veterinaria/configuracion/especies | ✅ | species | ✅ |
| /veterinaria/configuracion/servicios | ✅ | services | ✅ |
| /veterinaria/profesionales | ✅ | professionals | ✅ |
| /veterinaria/recordatorios | ✅ | reminders + auto-reminders | ⚠️ |
| /veterinaria/rooms | ✅ | rooms | ✅ |
| /veterinaria/portal-tokens | ✅ | portal-tokens | ⚠️ expires_at |
| /veterinaria/reportes | ✅ | reportes (usa getVet* múltiples) | ✅ |

### Páginas SIN entrada en sidebar (accesibles pero "huérfanas" del menú)
- `/veterinaria/imagenologia` — **existe página y endpoint, pero NO está en el sidebar** (`veterinary-sidebar-items.tsx` no la lista). El usuario no descubre Imagenología desde el menú.

### Endpoints SIN página dedicada (o sub-explotados)
- `notifications/whatsapp|email|sms|prescription-pdf|estimate-pdf|lab-result-pdf|vaccination-carnet` — existen como endpoints; verificar cuáles páginas los invocan (recetas→pdf, presupuestos→pdf, vacunas→carnet, laboratorio→pdf; whatsapp/email/sms desde recordatorios/presupuestos). Confirmar en UI.

---

## 6. Esquema de datos (migraciones 074→097)

### Correcto 👍
- Todas las tablas clínicas con `company_id NOT NULL … ON DELETE CASCADE`.
- Índices por `company_id` + índices únicos de numeración (`study_number`, `estimate_number`, `order_number`).
- `CHECK` de enums coherentes.
- Migración 096 bien hecha (idempotente, backfill, RLS), 097 correcta.
- Migraciones 094/095 añaden catálogo de módulos (verificar que veterinaria quede activable).

### Problemas ⚠️
1. **Regresión prescription_items** (2.1): esquema `NOT NULL` vs inserts sin `company_id`.
2. **Faltan migraciones 077–080 y 087–089** en la secuencia global (no son de veterinaria, pero conviene reconciliar el runner de migraciones).
3. RLS sigue siendo "decorativo" (usa `current_setting('app.current_company_id')` / `auth.uid()` que bajo `pg` directo no se setea; la app filtra por `WHERE company_id`). Aislar correctamente a nivel app, pero RLS no protege si alguien se salta un filtro.

---

## 7. Resumen ejecutivo: qué arreglar

### 🔴 Crítico (rompe funciones)
1. **Recetas**: añadir `company_id` a INSERT/DELETE de `veterinary_prescription_items` (2 archivos: `prescriptions/route.ts`, `prescriptions/[prescriptionId]/route.ts`).
2. **Cola**: corregir `queue/route.ts` añadiendo JOINs (o subselects) para `patient_name`, `client_name`, `service_name`, `professional_name`, `room_name`.

### 🟠 Alto (funciona mal)
3. **Dashboard**: unificar contrato endpoint ↔ página (hoy vacío).
4. **Validación cross-tenant** en POST de `vaccinations`, `payments` (estimate_id), `reminders`.
5. **Portal-tokens**: `expires_at` obligatorio por defecto + validar pertenencia paciente/cliente.
6. **Imagenología**: añadir DELETE (endpoint + método cliente + acción UI) y PUT por `[id]`.

### 🟡 Medio (mejora)
7. KPIs hardcodeados en `veterinaria/page.tsx` (quitar "1 paciente prioridad alta", unificar semántica).
8. Añadir `imagenologia` al sidebar (hoy inaccesible desde menú).
9. Notificaciones: decidir stub vs integración real (WhatsApp/Email/SMS) y documentarlo.
10. Añadir `getVetDeworming(id)` si se requiere detalle; y normalizar `updateVetImaging` al convenio REST con `[id]`.
11. Tests unitarios para: dispensación (transacción/race), recetas (items + company_id), cola (joins), dashboard.

### ✅ Ya corregido (no re-trabajar)
- `auth.uid()` → `jwtVerify` en portal-tokens y dispense.
- FK `auth.users` → eliminados (096).
- Dispensación → transacción + `FOR UPDATE`.
- `prescription_items` → columna `company_id` + RLS (pero ver regresión 2.1).
- Tabla imagenología → migración 097.

---

*Verificación realizada con lectura directa de: migraciones 074/093/094/095/096/097, rutas API (60 archivos), páginas (24), hooks (22), `navigation/sidebar/veterinary-sidebar-items.tsx`, y `lib/api-client.ts` (métodos Vet).*
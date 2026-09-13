# Informe — Verificación del Sistema de Usuarios, Permisos y Roles (Yellow ERP)

> Auditoría del subsistema de identidad y autorización: esquema (migraciones 004/055 + tablas en 001), APIs, y enforcement en UI/middleware.
> **Escala: 5 tablas (roles, permissions, role_permissions, user_roles, user_companies) + invitations (001) + profiles.role; APIs: users, roles, permissions, user-roles, roles/[roleId], roles/[roleId]/permissions.**
> Hallazgos ordenados **de más crítico a menos crítico**.

---

## 0. Diagnóstico de fondo: hay **DOS sistemas de permisos en paralelo y desincronizados**

El ERP intenta mezclar dos modelos incompatibles:

1. **Roles granulares** (`roles` / `permissions` / `role_permissions` / `user_roles`, migración 004) → "9 módulos × 4 acciones".
2. **Rol plano en `profiles.role` + `user_companies.role`** (enum `owner/admin/manager/member/viewer`) → el clásico rol de 5 niveles.

El front (`sidebar-items.tsx`) usa **nombres de módulo en español** (`inventario`, `ventas`, `compras`, `finanzas`, `gastos`, `herramientas`, `costos`, `servicios`, `sistema`, `documentos_recibidos`), pero el **catálogo de permisos** (migración 004 y `permissions/route.ts`) usa **nombres en inglés** (`inventory`, `sales_orders`, `payroll`, `accounting`, `projects`, …). Esto es la raíz del bug principal (ver C1).

---

## 🔴 CRÍTICO

### C1. Los nombres de permiso del sidebar NO matchean con el catálogo → usuarios no-owner ven el menú vacío/incompleto
- `sidebar-items.tsx` exige `requiredPermission: { module: "inventario" | "ventas" | "compras" | "finanzas" | "gastos" | "herramientas" | "costos" | "servicios" | "sistema" | "documentos_recibidos", action: … }`.
- El catálogo real en `permissions.module` usa: `inventory, warehouses, sales_orders, delivery_guides, invoices, pos, purchase_orders, quotations, customers, suppliers, crm, price_lists, payroll, accounting, projects, reports, audit, settings, users, roles` (todos en inglés, migración 004 líneas 64-155, idéntico en `permissions/route.ts`).
- **Ninguno coincide** (`"inventario" != "inventory"`, `"ventas" != "sales_orders"`, etc.).

**Resultado**: en `sidebar-navigation.tsx`, `hasPermission("inventario","read")` **nunca** es `true` para ningún permiso del catálogo → **todo usuario que no sea owner/admin ve el sidebar vacío** (o sin los ítems con `requiredPermission`). El único motivo por el que "funciona" hoy es el short-circuit `if (loading) return true` + `if (isOwner) return true`.

**Fix urgente**: unificar un único vocabulario de módulos (recomendado: inglés del catálogo, o español consistente en ambos lados) y mapear el sidebar a ese vocabulario.

### C2. El enforcement de permisos es **solo cliente** (cosmético, no es seguridad real)
- `usePermissions()`/`hasPermission()` vive en `lib/permissions.tsx` (`'use client'`) y solo se aplica en `sidebar-navigation.tsx` para **ocultar/mostrar ítems de menú**.
- **Ninguna ruta API verifica permisos**: todas las rutas `/api/companies/[id]/*` sólo validan `company_id` (y el middleware  sólo valida JWT + tenant), pero **nadie chequea `requiredPermission` ni `profiles.role`** en backend.
- **Resultado**: un usuario con rol `viewer` puede llamar `POST /api/companies/{id}/products`, `DELETE`, `calculate`, etc. directamente (todo lo que autoriza el middleware). La autorización por permiso es **decorativa**.

**Fix**: añadir un middleware/helper de permisos en el backend que valide `module:action` por ruta (o al menos `role` mínimo por verbo), con el mismo vocabulario unificado de C1.

### C3. `getPermissions()` devuelve **todos** los permisos, no los del rol del usuario
`permissions/route.ts` GET y `lib/permissions.tsx` `load()` cargan `SELECT * FROM permissions` (catálogo global). `hasPermission` luego hace `permissions.some(p => p.module===X && p.action===Y)` sobre el **catálogo completo** → **todo usuario con permisos "ve" TODOS los permisos**, no los de sus roles (`user_roles`/`role_permissions`).

- La carga correcta debería ser: `user_roles` → `role_permissions` → permisos del usuario. Hoy eso NO se hace.
- **Resultado**: si se corrigiera C1, aun así un miembro tendría acceso a todos los módulos, no a su subconjunto.

**Fix**: implementar endpoint "mis permisos" (join `user_roles → role_permissions → permissions` filtrado por `user_id`) y que `PermissionsProvider` consuma ese endpoint.

---

## 🟠 ALTO

### A1. Roles de usuario asignados sin validar pertenencia (cross-tenant)
- `user-roles/route.ts` POST inserta `user_id` + `role_id` **sin verificar que el `role_id` pertenezca a la misma `companyId`**, ni que el `user_id` pertenezca a la empresa.
- `roles/[roleId]/permissions/route.ts` PUT asigna `permission_ids` sin validar que sean permisos válidos del catálogo.
- **Resultado**: se puede asignar a un usuario un rol de otra empresa (fuga semántica de autorización), o permisos inexistentes.

**Fix**: validar `role_id` ∈ roles(company_id), `user_id` ∈ profiles(company_id), y `permission_id` ∈ permissions.

### A2. `users` POST no usa el flujo de invitaciones; contraseña aleatoria que nadie recibe
- Migración 001 define `invitations` (token, expires_at, accepted_at), pero **no existe `/api/invitations/*`** (grep = 0 rutas).
- `users/route.ts` POST crea el perfil con `status='invited'` y una `tempPassword` aleatoria (`Math.random()…`) que **nunca se entrega ni se usa** para setear contraseña.
- **Resultado**: el usuario invitado no puede iniciar sesión (no tiene token de invitación, no recibe la contraseña, no hay endpoint para "aceptar" la invitación). El modelo de invitación está **a medio implementar**.

**Fix**: implementar `/api/invitations` (crear con token+vencimiento, enviar email, y aceptar→set password), y quitar la creación de usuario directo con temp password.

### A3. `roles/[roleId]` y `roles/[roleId]/permissions` usan `params.id` directo
- Ambas rutas leen `companyId = params.id` (URL) en vez de `getCompanyId(request)` (que re-deriva/valida). Menos defensivo; si el middleware no cubre el path, es manipulable.
- (Nota: el resto de rutas users/roles/permissions sí usan `getCompanyId` correctamente.)

### A4. `hasPermission` devuelve `true` mientras carga
`lib/permissions.tsx` `if (loading) return true` → durante el primer render/hidratación **todo está permitido** (menú completo), y recién al terminar de cargar se restringe. Es un "flash" de permisos y además inseguro si el loading nunca resuelve.

---

## 🟡 MEDIO

### M1. `permissions/route.ts` tiene un array `ALL_PERMISSIONS` muerto (duplicado)
Las líneas 5-78 definen `ALL_PERMISSIONS` (70+ objetos) que **nunca se usa** (el GET lee de la DB). Riesgo de que la "fuente de verdad" se divida entre DB y esta constante (de hecho ya diverge: migración 072 amplió `action` a `calculate/manage/view_portal/export`, pero la constante sólo conoce `create/read/update/delete`).

### M2. `permissions.action` tiene dos CHECK contradictorios
- Migración 004: `CHECK (action IN ('create','read','update','delete'))`.
- Migración 072: `DROP CONSTRAINT permissions_action_check` + `CHECK (action IN ('create','read','update','delete','calculate','manage','view_portal','export'))`.
- Depende del orden de migraciones; el catálogo de permisos expuesto (y el sidebar) no incluye las acciones nuevas (calculate/export), por lo que **los permisos de "calcular gastos comunes" no son asignables desde la UI**.

### M3. `users` DELETE protege al `owner`, pero no al último owner
`users/route.ts` DELETE bloquea `role != 'owner'`, pero no impide borrar/suspender al **único** owner de la empresa (dejar la empresa sin administrador). Menor, pero riesgoso.

### M4. Roles "del sistema" no se crean automáticamente
Migración 004 comenta "crearemos roles por API al crear la empresa", pero el `companies`/`register` no crea roles por defecto (owner/admin). Un usuario no-owner sin roles asignados queda sin ningún permiso (agravado por C1/C3).

### M5. `role_permissions` sin `company_id` (integridad multi-tenant)
`role_permissions` sólo tiene `role_id`/`permission_id` (sin `company_id`). El aislamiento depende del `role_id`→`roles.company_id`, lo cual es correcto en joins, pero rompe el patrón "toda tabla de negocio tiene company_id" (regla 3 AGENTS.md).

---

## 🟢 MENOR

- **L1**: `user_roles`/`role_permissions` RLS con `current_company_id()` y `auth.uid()` (decorativo, igual que el resto del ERP).
- **L2**: `users` GET/POST/PUT comparten la lógica con `super-admin/users` (dos sistemas de usuarios distintos: empresa vs plataforma).
- **L3**: `profiles.role` vs `user_companies.role` vs `user_roles` → **tres** lugares que definen el rol de un usuario, sin sincronización garantizada.
- **L4**: No hay endpoint para listar los permisos efectivos de un usuario individual (sólo `getPermissions` global).

---

## Resumen ejecutivo (crítico → menor)

| Prioridad | Hallazgo | Estado |
|-----------|----------|--------|
| 🔴 C1 | Nombres de módulo sidebar (español) ≠ catálogo (inglés) | ✅ RESUELTO — sidebar-items.tsx actualizado a module names del catálogo (inventory, sales_orders, purchase_orders, accounting, payroll, expenses, work_orders, crm, reports, audit, settings). Módulos faltantes (expenses, work_orders) añadidos vía migración 108. |
| 🔴 C2 | Enforcement sólo cliente (cosmético) | ⚠️ PENDIENTE — requiere middleware/ helper server-side por ruta |
| 🔴 C3 | `getPermissions()` devuelve el catálogo global, no los del usuario | ✅ RESUELTO — endpoint `?mine=true` devuelve permisos efectivos vía `user_roles→role_permissions→permissions`. PermissionsProvider lo consume. |
| 🟠 A1 | Roles/permisos asignados sin validar pertenencia | ✅ RESUELTO — user-roles POST valida role_id y user_id contra company_id. roles/[roleId]/permissions PUT valida permission_ids contra catálogo. |
| 🟠 A2 | Invitaciones sin API; temp password que nadie recibe | ⚠️ PENDIENTE |
| 🟠 A3 | `roles/[roleId]` con `params.id` directo | ✅ RESUELTO — ambas rutas usan `getCompanyId(request)` |
| 🟠 A4 | `hasPermission` `true` mientras carga | ✅ RESUELTO — retorna `false` durante loading |
| 🟡 M1 | Dead code `ALL_PERMISSIONS` array | ✅ RESUELTO — eliminado de permissions/route.ts |
| 🟡 M2 | CHECK dual en permissions.action | ⚠️ PENDIENTE — requiere migración DDL |
| 🟡 M3 | Users DELETE no protege último owner | ⚠️ PENDIENTE |
| 🟡 M4 | Roles del sistema no se crean automáticamente | ✅ RESUELTO — super-admin companies POST crea owner/admin/member/viewer con is_system=true y asigna owner al usuario creador |
| 🟡 M5 | role_permissions sin company_id | ⚠️ PENDIENTE — requiere migración DDL |
| 🟢 L1–L4 | Deuda | ⚠️ PENDIENTE |

## Plan de arreglo (orden)

1. **Unificar vocabulario de módulos** (un solo set de nombres) entre `permissions` (BD+route) y `sidebar-items.tsx`.
2. **Implementar "mis permisos"** (endpoint que devuelva permisos efectivos por usuario vía `user_roles→role_permissions`) y hacer que `PermissionsProvider` lo consuma.
3. **Enforcing server-side**: helper de permisos en backend (middleware o por-ruta) que valide `module:action` / `role`.
4. **Validar pertenencia** en `user-roles` POST y `roles/[roleId]/permissions` PUT.
5. **Completar flujo de invitaciones** (crear token, email, accept→set password); quitar temp-password del POST users.
6. Corregir `params.id` → `getCompanyId` en `roles/[roleId]` y `roles/[roleId]/permissions`.
7. Quitar `if (loading) return true` (o devolver `false`/estado explícito).
8. Unificar `ALL_PERMISSIONS` muerto; decidir qué acciones soporta (incluir calculate/export/… si aplica); revisar 3 fuentes de rol.

---

*Verificado leyendo: migraciones 004/055/072 + 001 (invitations, role_permissions, user_roles, profiles.role), `api/companies/[id]/{users,roles,permissions,user-roles,roles/[roleId],roles/[roleId]/permissions}.ts`, `lib/permissions.tsx`, `lib/api-client.ts` (getPermissions), `navigation/sidebar/sidebar-items.tsx`, y `dashboard/components/sidebar/sidebar-navigation.tsx`.*
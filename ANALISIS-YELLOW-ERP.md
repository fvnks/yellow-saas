# Análisis integral de Yellow ERP

> Auditoría técnica del monorepo `yellow-house` — generada por análisis directo del código.
> Fecha de análisis: sesión actual. Basado en evidencia leída en archivos (no en la documentación, que está desactualizada).

---

## 1. Resumen ejecutivo

Yellow ERP es un ERP SaaS multi-tenant chileno real y de gran alcance (~1.500 archivos fuente, ~505 páginas, ~483 endpoints API, ~93 migraciones SQL y 6 verticales de negocio). Está funcionalmente maduro, pero presenta **tres problemas estructurales serios** que deben resolverse antes de escalar en producción:

1. **Fuga potencial de datos multi-tenant** por confianza excesiva en `company_id` derivado del cliente/localStorage y RLS "decorativo" que nunca se activa.
2. **Documentación de diseño contradictoria y desincronizada** (3 specs de diseño distintas; `CONTEXT.md`/`PRODUCT.md` desactualizados vs. el código real).
3. **Duplicación masiva de rutas** (`src/app/*` vs `src/app/[locale]/*`) que hace muy difícil mantener, probar y auditar el sistema.

---

## 2. Arquitectura y stack

| Capa | Realidad verificada |
|------|---------------------|
| Frontend | Next.js **14.2.35** (App Router), React 18, Tailwind v3, `next-intl` (es/en) |
| Backend | Next.js API Routes (serverless), `pg` directo (NO Supabase client) |
| DB | PostgreSQL en Railway; ~93 migraciones (faltan `077–080`, `087–089`) |
| Auth | JWT con **`jose`** (middleware, sign) + **`jsonwebtoken`** (packages/auth, packages/api) — **dos librerías coexisten** |
| Monorepo | Turborepo + npm workspaces (`apps/*`, `packages/*`) |
| Deploy | Railway + Coolify/Traefik (docker-compose). Output `standalone`. |

### Puntos de atención de arquitectura

- **Dos capas de acceso a DB duplicadas**: `packages/db/src/client.ts` y `apps/web/src/app/api/lib/db.ts`. El paquete `@yellow-erp/db` usa `pool.on('error', … process.exit(-1))` (crasea el proceso), el helper de la app no.
- **`packages/api` casi muerto**: sólo `auth.ts` y `response.ts`; el `register` de ese paquete usa `jsonwebtoken` y `gen_random_uuid()` sin extender, mientras la app usa `jose`. Superficie inconsistente.
- **`packages/ui` en doble estado**: `Button`/`Sidebar`/`Header`/`Layout` usan la paleta **CONTEXT (slate-900, sidebar blanca)**, mientras la app real usa una sidebar **navy `#0F172A`** con shadcn/ui (`components/ui/sidebar`). El `packages/ui` Sidebar apunta a rutas `/inventory`, `/sales` (sin `/dashboard/`, sin `/es/`) que **no existen**.

---

## 3. Duplicación de rutas (hallazgo principal)

Coexisten **dos árboles de rutas completos**:

```
src/app/dashboard/…            (sin locale)
src/app/admin/…, /hr, /recetas, /projects, /mi-cuenta, /restaurant, /veterinaria, /condominio, /auto-talleres, /ayuda
src/app/[locale]/dashboard/…   (con next-intl)
src/app/[locale]/…             (mismos módulos duplicados)
```

- El glob reporta **505 páginas** `page.tsx`. Cada vertical (dashboard, hr, recetas, restaurante, veterinaria, condo, auto-talleres) existe en **ambas** formas (`/x` y `/[locale]/x`).
- `next.config.js` usa `createNextIntlPlugin`, y el middleware aplica `next-intl` a rutas no-API. Por tanto **`[locale]` es la ruta canónica**; el árbol sin `[locale]` es **código muerto/residual** (muchos archivos idénticos, p. ej. `dashboard/layout.tsx` ≡ `[locale]/dashboard/layout.tsx`).
- Riesgo: doble mantenimiento, divergencia silenciosa, doble superficie de ataque, builds inflados.

**Recomendación**: elegir `[locale]` como canónico, borrar/redirigir los árboles sin locale, y consolidar helpers duplicados (`lib/utils.ts` en `dashboard`, `auto-talleres`, etc.).

---

## 4. Seguridad y multi-tenant

### 4.1 Secretos expuestos (CRÍTICO)

- **`.env.local` versionado** contiene credenciales **reales de producción**:
  - `DATABASE_URL=postgresql://postgres:Utdjuje…@148.113.196.87:5432/postgres` (host + password reales).
  - `JWT_SECRET=dummy-jwt-secret-for-local-build-at-least-32-chars` → en producción debe usar otro, pero confirma que el secreto real **no** está en `.env.local`; sin embargo el **password de Postgres sí**.
- `.env.example` versiona un `JWT_SECRET` de 64 hex (apariencia real) y `ADMIN_PASSWORD=admin123`.
- Seed de super-admin hardcodeado: `superadmin@yellow.cl` / `SuperAdmin123!` (en `api/migrate/route.ts` línea 278 y en `CONTEXT.md`).

**Acción inmediata**: rotar la password de Postgres, eliminar `.env.local` del repo, añadir a `.gitignore` y verificar histórico de git (la password ya está expuesta).

### 4.2 Multi-tenancy (ALTO)

- El **middleware** (`src/middleware.ts`) **sí** valida JWT y compara `urlCompanyId` vs `token.company_id` para rutas `/api/companies/*`. Bien.
- **Pero** ~250+ sitios en el frontend usan `localStorage.getItem('company_id')` para construir URLs (`/api/companies/${localStorage.getItem('company_id')}/…`). El guardia real es el middleware, pero:
  - Hay módulos (**`admin`, `auto-talleres`, `ayuda`, `portal`, `view`**) que el `matcher` del middleware **excluye explícitamente** (`?!…admin|auto-talleres|ayuda|portal|view…`), por lo que sus páginas no pasan por la verificación de ruta. Dependen del control interno de cada página.
  - `getCompanyId()` en `api/lib/helpers.ts` **extrae el `company_id` directamente de la URL**, y muchos route handlers lo usan sin re-validar contra el JWT (el middleware cubre `/api/companies/*`, pero conviene confirmar cada handler).
  - `packages/auth/src/client.ts` ejecuta `jwt.verify` **en el cliente** para leer la sesión → el `JWT_SECRET` se expone al bundle de cliente (sólo se usa para decodificar, no es una clave secreta efectiva en ese contexto, pero es mala práctica y aumenta superficie).

### 4.3 RLS "decorativo" (ALTO)

- Las migraciones declaran `ENABLE ROW LEVEL SECURITY` + `CREATE POLICY … USING (company_id = current_setting('app.current_company_id')::uuid)` o `current_company_id()` o `auth.uid()` (Supabase).
- **El código de la app usa `pg` directo** (Pool), **no** Supabase, y **nunca** ejecuta `SET app.current_company_id`. Además `auth.uid()` sólo existe en contexto Supabase.
- Conclusión: **RLS está deshabilitado de facto o rotas las políticas** si se activaran. El aislamiento real es 100% capa-aplicación (cláusula `WHERE company_id = $n`). Eso es aceptable **sólo** si no hay ninguna query que omita el filtro.

### 4.4 SQL injection (MEDIO)

- Casi todas las queries están **parametrizadas** (`$1`, `$2`, …) — bien.
- **Dinamización de columnas/cláusulas por whitelist**: múltiples rutas construyen `UPDATE … SET ${updates.join(', ')}` o `WHERE ${where}`. En su mayoría provienen de listas blancas internas (keys de un objeto validado), por lo que el riesgo es bajo, **pero** hay que auditar `sync-offline-action/route.ts` línea 284 (`DELETE FROM ${tableName}` con `tableName` desde un `switch` — seguro) y `reset-password/route.ts` (`FROM ${table}` con `table` de una lista fija — verificar).
- No se detectó interpolación directa de input de usuario crudo en columnas. El patrón dominante es seguro.

### 4.5 Auth (MEDIO)

- Doble stack `jose`/`jsonwebtoken` (inconsistencia, duplicación).
- Token en cookie `auth-token` (httpOnly no garantizado; se lee vía `document.cookie` en cliente) + support para `Authorization: Bearer`.
- Existe **login-as** (impersonación) correctamente restringido a super-admin con `verifySuperAdmin`.
- Rate limiting en `/api/auth/*` vía `lib/rate-limiter.ts`.
- Headers de seguridad + CSP presentes en middleware (bien), aunque `script-src 'unsafe-eval' 'unsafe-inline'` debilita el CSP (necesario para Next dev, revisar en prod).

---

## 5. Sistema de diseño y UI

### 5.1 Tres specs contradictorias

| Fuente | Primario | Fondo | Sidebar | Radio |
|--------|----------|--------|---------|-------|
| **AGENTS.md** (workspace instruction) | `#FACC15` amarillo | `#F8FAFC` | `#0F172A` navy | 2xl/xl |
| **CONTEXT.md** | `bg-slate-900` | `bg-slate-50` | `bg-white` | xl/lg |
| **PRODUCT.md** | `#1814F3` BankDash | `#F5F7FA` | — | — |

### 5.2 Lo que realmente está implementado

- **Se cumple AGENTS.md** en `apps/web/src/app/globals.css`: tokens Sun-Slate (`--primary: 47 96% 53%` amarillo, `--accent: 222 47% 11%` navy, sidebar navy). El dashboard usa `bg-[#F8FAFC]`, botones `bg-[#FACC15]` y sidebar `bg-[#0F172A]`.
- `tailwind.config.js` define `brand.yellow`, `brand.blue`, etc. (herencia BankDash) pero la mayoría usa los nuevos tokens `hsl(var(--…))`.
- **Inconsistencia residual**: `packages/ui` (Button/Sidebar/Header/Layout) aún usa la paleta slate-900/blanca (CONTEXT). Estos componentes, aunque importados por `@yellow-erp/ui` en 174 sitios, **coexisten** con una implementación shadcn/ui local (`components/ui/*`) que es la que el dashboard realmente renderiza.
- `PRODUCT.md` y `CONTEXT.md` están **obsoletos** (BankDash y slate-900 ya no son la fuente de verdad).

**Recomendación**: adoptar AGENTS.md como única fuente, actualizar `packages/ui` a la paleta Sun-Slate o deprecarlo, y borrar/actualizar `CONTEXT.md` y `PRODUCT.md`.

### 5.3 Localización chilena (bien cubierta)

- **CLP**: `Intl.NumberFormat('es-CL', { currency: 'CLP', maximumFractionDigits: 0 })` y `toLocaleString('es-CL')` extendidos (~1.474 usos). Correcto.
- **RUT**: validación de dígito verificador implementada (`dte-validator.ts` `isValidRut`, módulo 11) y formateo `formatRUT` en varios módulos. Correcto.
- **UF/UTM**: header pill consume `findic.cl` vía `lib/indicators.ts` (UF, USD, UTM, EUR) con cache 10 min y fallback. `packages/db/…/090` define tablas `uf_values`, `utm_values`, `exchange_rates`.
- **DTE/SII**: tipos `33/34/39/52/56/61/110/111/112` validados; tracking `sii_status` en `invoices/credit/debit/guides` (migración 062). **PERO** la integración real SII es un **stub** (ver §6).
- **Payroll chileno**: motor real con AFP (tasas 2024), FONASA 7%, SIS 1.53%, mutual, AFC (cesantía), tramos de Impuesto Único de 2ª categoría y calculadora de finiquito (Arts. 159–172). Es el componente de dominio chileno más completo.

---

## 6. Cumplimiento chileno: qué es real vs. stub

| Funcionalidad | Estado | Evidencia |
|---------------|--------|-----------|
| Formato CLP / RUT / fechas es-CL | ✅ Real | extendido |
| DTE validación (tipos, RUT, folio, receptor) | ✅ Real | `lib/dte-validator.ts` |
| XML DTE parseo | ✅ Real | `lib/dte-xml-parser.ts`, `fast-xml-parser` |
| **Envío a SII** | ⚠️ **Stub** | `sii/submit/route.ts` genera `track_id`​ artificial (`SII-${Date.now()}`) sin contactar SII; `sii/dte/route.ts` similar |
| UF/UTM en vivo | ✅ Real (findic.cl) | `lib/indicators.ts` |
| Tablas históricas UF/UTM/tipo-cambio | ✅ Real (esquema) | migración 090 |
| F29 / impuestos mensuales | ⚠️ Esquema+parcial | migración 091; UI `accounting/f29` |
| Libro de compras/ventas SII | ⚠️ Partial | `accounting/sales-book`, `bodega/sii-book` |
| Payroll AFP/ISAPRE/liquidación | ✅ Real y completo | `lib/payroll/*` |
| Honorarios | ✅ Real | `accounting/honorarios`, `payroll/boleta_7a` |

**Asimetría clave**: la lógica de envío SII **no está conectada** a la API real del SII. Los estados "Aceptado/Rechazado SII" son simulados. Para un ERP que promete facturación electrónica tributaria, esto es un **gap crítico de producto**.

---

## 7. Base de datos

- **93 migraciones** (`001`–`093`), faltan `077–080` y `087–089` (probablemente renumeradas o borradas; conviene reconciliar).
- **Duplicados/sobrescritos**: `021_project_audit_log.sql` y `084_project_audit_log.sql` (el segundo crea `project_activity_log`). Riesgo de drift.
- **Despliegue**: `scripts/migrate.js`, `scripts/run-migrations-fixed.js`, `scripts/run-railway-migrations.js`, y endpoint `/api/migrate` (protegido por `body.secret === JWT_SECRET` — un "secret" reutilizado del JWT, no ideal) y `/api/migrate-fix`.
- **`company_id` coverage**: todas las tablas de negocio revisadas lo incluyen con `REFERENCES companies(id) ON DELETE CASCADE`. Buena disciplina.
- `packages/db/src/client.ts` usa `gen_random_uuid()` implícitamente en inserts de `packages/api` sin `CREATE EXTENSION pgcrypto` garantizado en ese path (la migración principal sí lo agrega).

---

## 8. Calidad y mantenibilidad

- **Sin tests de proyecto**: `glob **/*.{test,spec}.{ts,tsx,js}` sólo devuelve `node_modules`. **0 tests unitarios/e2e propios.** Riesgo alto para un ERP financiero.
- **Sin lint strict evidente** aunque `eslint-config-next` está declarado; `turbo typecheck` existe por paquete (hay logs `.turbo/typecheck.log`).
- Se detectaron artefactos de build versionados o presentes: `build-output.txt` (199 KB), `apps/*-stdout/stderr.log`, `sites.json`, `remaining-sites.json`, `unique-files.json`, `.freebuff/*.db`.
- **Helpers duplicados**: `formatCLP/formatRUT` reimplementados en `lib/utils.ts`, `auto-talleres/lib/utils.ts`, y en múltiples pages inline.
- Multi-idioma: `next-intl` con `es`/`en` y namespace `header`, `common`. Bien cableado (routing `as-needed`, default `es`).

---

## 9. Métricas rápidas

| Indicador | Valor |
|-----------|-------|
| Archivos fuente (app web) | ~1.507 (`tsx` 932, `ts` 574) |
| Páginas `page.tsx` | ~505 |
| Endpoints `route.ts` | ~483 |
| Migraciones SQL | 93 (faltan 7 números) |
| Verticals | erp, recetas, hr, projects, mi-cuenta, restaurant, veterinaria, condominio, auto-talleres, pwa, portal |
| Tests propios | 0 |

---

## 10. Prioridades de remediación

### 🔴 Crítico (ahora)
1. **Rotar credenciales expuestas**: password Postgres en `.env.local` (host `148.113.196.87`), eliminar `.env.local`/`.env.example` del control de versiones, purgar del histórico git.
2. **Confirmar aislamiento multi-tenant** en rutas excluidas del middleware (`admin`, `auto-talleres`, `ayuda`, `portal`, `view`) y en todo handler que use `getCompanyId` desde URL sin re-validar JWT.
3. **Decidir y documentar el secreto/RLS**: o activar RLS correctamente (setear `app.current_company_id` por request) o eliminar las políticas para no dar falsa seguridad.

### 🟠 Alto (siguiente ciclo)
4. **Eliminar duplicación de rutas**: consolidar en `[locale]`, borrar árboles legacy, redirigir 301.
5. **Conectar el envío SII real** o marcar la funcionalidad como "simulada" explícitamente en UI y roadmap.
6. **Unificar auth** en `jose` (retirar `jsonwebtoken`), quitar `jwt.verify` del bundle cliente (leer claims vía endpoint o cookie httpOnly).

### 🟡 Medio (planificar)
7. **Añadir tests** (al menos: `dte-validator`, `payroll/liquidation`, `rate-limiter`, `api/lib/helpers`) y un smoke test de multi-tenant.
8. **Alinear design system**: una sola fuente (AGENTS.md), actualizar `packages/ui` o deprecarlo, sincronizar `CONTEXT.md`/`PRODUCT.md`.
9. **Reconciliar migraciones** (faltantes/duplicadas) y limpiar artefactos versionados (`build-output.txt`, logs, `.freebuff/*.db`, `*.json` de sitios).

---

*Informe generado a partir de lectura directa de archivos: middleware, auth (jose/jsonwebtoken), db/client, api/lib/{db,helpers}, api/migrate, api/sii/submit, payroll/*, dte-validator, indicators, globals.css, tailwind.config, next.config, migraciones 062/090 y layouts.*
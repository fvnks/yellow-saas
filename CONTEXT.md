# Yellow ERP - Contexto del Proyecto

## Visión General

Yellow ERP es un sistema ERP SaaS multi-tenant para PyMEs chilenas. Arquitectura monorepo con Turborepo, Next.js 14, React 18, Tailwind v3, PostgreSQL.

## Arquitectura

```
yellow-house/
├── apps/web/                    # Next.js 14.1.0 (frontend + API routes)
│   ├── src/app/                 # App Router
│   │   ├── api/                 # API routes (serverless)
│   │   │   ├── auth/            # Login, register, switch-company
│   │   │   ├── companies/[id]/  # CRUD por módulo
│   │   │   └── super-admin/     # Panel super admin
│   │   ├── dashboard/           # ERP (sidebar + header)
│   │   ├── recetas/             # Fórmulas/Producción (layout independiente)
│   │   ├── hr/                  # RRHH (layout independiente)
│   │   ├── projects/            # Proyectos (layout independiente)
│   │   ├── mi-cuenta/           # Mi Cuenta (layout independiente)
│   │   ├── admin/               # Super admin panel
│   │   ├── select/              # Selector de módulos
│   │   └── login/               # Login unificado
│   └── src/lib/                 # Utilidades, API client, constants
├── packages/db/                 # Migraciones SQL (000-068)
└── packages/ui/                 # Componentes compartidos
```

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14.1.0, React 18, Tailwind CSS v3 |
| Backend | Next.js API Routes (serverless) |
| Base de datos | PostgreSQL |
| Auth | JWT + bcryptjs (custom, NO Supabase Auth) |
| JWT lib | `jose` (migrado desde `jsonwebtoken`) |
| Íconos | Lucide React (exclusivamente) |
| Monorepo | Turborepo |
| Deploy | VPS Propio |
| URL prod | (Propio) |
| Git | https://github.com/fvnks/yellow-saas.git |

## Multi-Tenancy

- Todas las tablas tienen `company_id UUID REFERENCES companies(id)`
- JWT incluye `company_id` y `role_type` (company/super_admin)
- Middleware verifica JWT + company_id en todas las rutas `/api/companies/[id]/*`
- Company switcher: tabla `user_companies`, dropdown en sidebar

## Autenticación

- **Login unificado**: `/login` — API checks `super_admins` luego `profiles`
- **JWT**: `jose` library (migrado de `jsonwebtoken` en 5 rutas)
- **Hook compartido**: `useAuthToken` en `hooks/use-auth-token.ts`
- **Super admin default**: `superadmin@yellow.cl` / `SuperAdmin123!`
- **Roles**: `profiles.role` enum: owner/admin/manager/member/viewer
- **Role type**: `profiles.role_type`: company/super_admin

## Módulos del ERP

### Dashboard (`/dashboard`)
Sidebar con KPIs, widgets, métricas reales de DB.

### Inventario (`/dashboard/inventory`)
Productos, categorías, stock, movimientos, transferencias, conteos cíclicos, lotes, seriales, variantes, etiquetas, valorización.

### Almacenes (`/dashboard/warehouses`)
Gestión de almacenes, stock levels.

### Ventas (`/dashboard/sales`)
Órdenes, cotizaciones, guías de despacho, notas de crédito/débito, documentos unificados con semáforo SII.

### Compras (`/dashboard/purchases`)
Órdenes, cotizaciones, facturas de compra, notas de crédito/débito, guías de despacho, libro de compras SII.

### Clientes (`/dashboard/customers`)
CRUD completo, contactos, direcciones, categorías, segmentos. Campo `rubro_id` FK a `company_rubros`.

### Proveedores (`/dashboard/suppliers`)
CRUD con contactos, direcciones, calificaciones.

### CRM (`/dashboard/crm`)
Leads, actividades, pipeline.

### Contabilidad (`/dashboard/accounting`)
Plan de cuentas, asientos diario, centro de costos.

### Nómina (`/dashboard/payroll`)
Empleados, corridas de nómina, vacaciones.

### Herramientas (`/dashboard/tools`)
Utilidades varias.

### Configuración (`/dashboard/settings`)
Categorías expandibles:
- **General**: Empresa, Rubros, Centros de Costo
- **Webhooks**: Gestión de webhooks
- **Roles & Permisos**: 9 módulos × 4 acciones = 36 permisos
- **Integraciones**: SII, Stripe, Mach, Email (SMTP)

## Módulos Independientes (fuera del sidebar ERP)

### Recetas / Fórmulas (`/recetas`)
- **Fórmulas**: CRUD con ingredientes, rendimiento, márgenes
- **Inventario**: 2 tabs — Ingredientes + Producción
- **Producir**: Flujo de producción con deducción de stock
- **Historial**: Registro de producciones
- **Stock**: Entradas de stock multi-producto
- **Gastos**: Gastos operacionales de receta
- **Configuración**: Mínimos de stock por producto
- **POS Recetas**: Punto de venta independiente

### RRHH (`/hr`)
Empleados, nómina, vacaciones.

### Proyectos (`/projects`)
Resumen, tareas, miembros.

### Mi Cuenta (`/mi-cuenta`)
Facturación, pagos, activación de módulos.

## Super Admin Panel (`/admin`)

- **Dashboard**: Métricas reales (dbStatus, dbLatency)
- **Empresas**: CRUD + crear con módulos + activar/desactivar módulos
- **Usuarios**: Gestión de usuarios
- **Super Admins**: Crear, editar, eliminar
- **Permisos**: Asignación de permisos
- **Tickets**: Soporte con asignación
- **Audit Log**: Registro con filtros
- **Notificaciones**: Lectura/no leídas
- **Billing**: Facturación
- **Settings**: Configuración del panel

## Sistema de Módulos (Activación)

```sql
-- Tabla module_activations
module_name TEXT  -- 'erp', 'hr', 'projects', 'recetas', 'mi-cuenta'
company_id UUID
is_active BOOLEAN
UNIQUE(company_id, module_name)
```

- Select page muestra SOLO módulos activados
- Dashboard sidebar filtra por `requiredModule`
- Super admin crea empresas con `modules[]` array
- Mi Cuenta siempre accesible

## Fórmulas / Recetas

### Tablas
- `formulas` — Fórmulas con `output_product_id`, `yield_quantity`, `yield_unit`, `min_margin_pct`, `max_margin_pct`
- `formula_ingredients` — Ingredientes por fórmula
- `formula_productions` — Registro de producciones
- `recipe_products` — Productos aislados (NO usa `products` table)
- `recipe_stock_entries` — Movimientos de stock
- `recipe_expenses` — Gastos operacionales

### Flujo de Producción
1. Crear ingredientes en Inventario → Producción
2. Crear fórmula con ingredientes + producto de salida
3. Producir → descuenta de `recipe_products.stock`
4. Vender producto de salida en POS → stock se reduce al facturar

### POS Recetas
- Solo muestra productos con `sellable=true` (producto de salida de fórmulas activas)
- Stock badge en cada card
- Card deshabilitada si stock = 0
- Flujo de tarjeta: preguntar N° transacción DESPUÉS del pago

## Datos del Cliente (Chile)

- **RUT**: Identificador tributario chileno
- **Rubros**: `company_rubros` — Código de Actividad Económica (ACTEO)
- **SII**: Servicio de Impuestos Internos — integración para documentos tributarios
- **Representante Legal**: Datos del representante legal de la empresa

## Design System (AGENTS.md)

| Elemento | Estilo |
|----------|--------|
| Background | `bg-slate-50` |
| Card | `bg-white border border-slate-200 shadow-sm rounded-xl` |
| Primary button | `bg-slate-900 hover:bg-black text-white rounded-lg` |
| Table header | `text-[9px] font-semibold uppercase tracking-wider text-slate-500` |
| Badge | `text-[9px] font-semibold rounded-full` |
| Iconos | Lucide React (w-4 h-4 inline, w-5 h-5 botones, w-6 h-6 KPIs) |
| Sidebar | `w-64 bg-white border-r border-slate-200 h-screen fixed` |
| Header | `h-16 bg-white border-b border-slate-200 fixed` |

### Paleta de Colores

| Token | Valor |
|-------|-------|
| Primary | `bg-slate-900` |
| Success | `bg-emerald-600` |
| Warning | `bg-amber-500` |
| Danger | `bg-rose-600` |
| Info | `bg-blue-500` |

## Base de Datos

- **68+ migraciones** en `packages/db/supabase/migrations/`
- **Ejecución**: Script Node.js con `pg` (NO Supabase CLI)
- **Conexión**: Vía `DATABASE_URL` (VPS)
- **Env vars**: `DATABASE_URL` y `JWT_SECRET` en `apps/web/.env.local`
- **RLS**: Deshabilitado (migraciones usan SQL directo)
- **Prefijo de tablas**: `module_tablename`

## Convenciones de API

```
GET    /api/companies/:id/module        → Listar
GET    /api/companies/:id/module/:id    → Detalle
POST   /api/companies/:id/module        → Crear
PUT    /api/companies/:id/module/:id    → Actualizar
DELETE /api/companies/:id/module/:id    → Eliminar
```

Todos los endpoints verifican JWT + company_id en middleware.

## Permisos

9 módulos × 4 acciones = 36 permisos:

| Módulo | Acciones |
|--------|----------|
| inventario | view, create, edit, delete |
| ventas | view, create, edit, delete |
| compras | view, create, edit, delete |
| finanzas | view, create, edit, delete |
| herramientas | view, create, edit, delete |
| recetas | view, create, edit, delete |
| costos | view, create, edit, delete |
| rrhh | view, create, edit, delete |
| sistema | view, create, edit, delete |

Owner/admin bypasean todos los permisos.

## Estado Actual

### Completado
- Landing page con navbar, hero, módulos, pricing, FAQ, footer
- Dashboard admin con sidebar, header, KPIs
- Dark mode (~800+ instancias, 160 archivos)
- Sistema de impresión (PDF)
- Super admin completo (fase 1-7)
- Auth unificada (jose)
- HR, Compras, Ventas, Inventario reestructurados
- Proyectos completo
- Select page con activación de módulos
- Multi-company con company switcher
- Role badges en sidebar
- Mi Cuenta completo
- Sistema de fórmulas/recetas completo
- POS recetas independiente
- Integraciones (SII, Stripe, Mach, SMTP)
- Settings reestructurado (categorías expandibles)
- Rubros (ACTEO) con CRUD
- Empresa page (datos, representante legal, SII/ACTEO)
- Permisos simplificados a nivel módulo
- Formato de cantidades por unidad de medida
- Tab "Producción" en Inventario de Recetas (field reference corregido, datos en DB verificados)

### Pendiente
- (ninguno)

## Comandos Útiles

```bash
# Dev
npm run dev

# Build
npm run build

# Lint
npm run lint

# Typecheck
npm run typecheck

# Migraciones DB
node scripts/migrate.js
```

## Notas Importantes

- **NO usar colores fuera de la paleta**
- **NO usar iconos que no sean Lucide**
- **NO hardcodear company_id** — siempre filtrar por JWT
- **NO exponer service role key al frontend**
- **Recetas NO está en el sidebar del ERP** — solo accesible vía select page
- **NavSubItem soporta 3 niveles** de anidación
- **`formatQuantity`** muestra decimales para KG, LT, MT, etc.; enteros para UN
- **Producción usa dos llamadas API** paralelas (getRecipeProducts + getFormulas) para cruzar `output_product_id`

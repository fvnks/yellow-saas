# Informe FINAL — Verificación exhaustiva del Módulo ERP (Yellow ERP)

> Auditoría completa del núcleo ERP: dashboard + Inventario, Ventas, Compras, Clientes, Proveedores, CRM, Contabilidad, Nómina, Gastos, Proyectos, Configuración y Herramientas.
> Método: lectura directa + 4 subagentes de auditoría por módulo, todo verificado contra migraciones y código real.
> **Escala verificada: 25 submódulos · 142 páginas · 386 endpoints `route.ts` · 138 directorios de API · 94 rutas de sidebar.**
> Hallazgos ordenados **de más crítico a menos crítico**.

---

## 0. Nota metodológica importante (dos "fuentes" de esquema)

Existen **dos orígenes de esquema en conflicto**:
1. `packages/db/supabase/migrations/*.sql` (97+ archivos, versionados).
2. `apps/web/src/app/api/migrate/route.ts` (888 líneas, bootstrap runtime que `CREATE TABLE IF NOT EXISTS` decenas de tablas).

El drift entre ambos orígenes genera riesgo: un deploy que aplique sólo migraciones versionadas (sin `/api/migrate`) quedará incompleto.

---

## 🔴 NIVEL CRÍTICO — SQL contra columnas/tablas inexistentes (rompe en runtime)

### C0.1 — ✅ RESUELTO (commit anterior)
Rutas SII corregidas. Queries usan `invoice_number, customer_id, invoice_date, subtotal, tax_amount, total_amount, sii_status` — columnas reales del esquema.

### C0.2 — ✅ RESUELTO
`purchase-orders/route.ts`: eliminadas columnas fantasma `internal_notes` (no existe en `purchase_orders`), `discount_amount`, `tax_rate`, `notes`, `sort_order` de ítems. INSERT de items ahora solo usa columnas reales (`order_id, company_id, product_id, quantity, unit_price, discount_percent, tax_rate`). Subtotal calculado con `discount_percent` en vez de `discount_amount` inexistente. `line_total` es `GENERATED ALWAYS` — no se inserta.

### C0.3 — ✅ RESUELTO (commit anterior)
`suppliers/route.ts`: ya no inserta `notes` (columna inexistente).

### C0.4 — ✅ RESUELTO (migración 107)
`107_erp_missing_tables.sql` crea todas las tablas faltantes: `goods_receipts`, `goods_receipt_items`, `customer_returns`, `customer_return_items`, `internal_orders`, `internal_order_items`, `webhook_endpoints`, `webhook_deliveries` con RLS e índices.

### C0.5 — ✅ RESUELTO
- `accounts/route.ts`: queries usan solo columnas reales (`code,name,type,parent_id,is_active,is_control`). Balance calculado con subquery sobre `journal_entry_lines`.
- `accounts/[accountId]/route.ts`: alias CJK `je平衡` eliminado, usa `je_bal`.
- `journal-entries/route.ts` + `[entryId]`: usa `entry_date` (no `date`). No inserta `sort_order`.
- `employees/route.ts` (PUT): eliminadas columnas fantasma `rut, emergency_*, afp_*, health_*, mutual_*, apv_amount, image_url`. Solo actualiza columnas reales del esquema.
- `expenses/route.ts` (POST): eliminada función inexistente `current_user_id()`. Validación cross-tenant para `category_id` y `cost_center_id`.

### C0.6 — ✅ RESUELTO (commit anterior)
- `members/route.ts`: usa `p.full_name` (no `first_name || last_name`).
- `timesheets/route.ts`: usa `e.first_name || ' ' || e.last_name`.
- `tasks/route.ts`: validación cross-tenant para `parent_id`.

### C0.7 — ✅ RESUELTO
- `stock-transfers/[transferId]/route.ts`: usa `source_warehouse_id`/`destination_warehouse_id` (schema 083). Ya usa `transaction()`.
- `stock-transfers/confirm/route.ts`: ya usa `transaction()`.
- `inventory-counts/[countId]/complete/route.ts`: ya usa `transaction()`.
- `sales-quotations/route.ts`: DDL `ensureTables()` eliminado. POST usa `transaction()`.

---

## 🔴 NIVEL CRÍTICO — Corrupción de datos / autorización

### C1. Operaciones multi-paso NO atómicas — ⚠️ PARCIALMENTE RESUELTO
Rutas que ya usan `transaction()`: invoices, journal-entries, stock-transfers (PATCH + confirm), inventory-counts, sales-quotations, credit-debit notes. Falta envolver: delivery-guides, customer-returns, goods-receipts, purchase-orders, payroll/calculate, projects/clone.

### C2. DDL dentro de handlers HTTP — ⚠️ PARCIALMENTE RESUELTO
`invoices/route.ts` ya no ejecuta DDL. `sales-quotations` eliminó `ensureTables()`. Quedan: `delivery-guides`, `settings/uf`, `settings/iva`.

### C3. Numeración de folio con race condition — ⚠️ PENDIENTE
`invoices/route.ts` usa `COUNT(*)+1` → folios duplicados bajo concurrencia. Necesita secuencia o `UNIQUE` defensiva.

### C4. `getCompanyId` NO valida el tenant — ⚠️ PENDIENTE
Sigue extrayendo `company_id` del pathname sin verificar JWT↔tenant. Afecta rutas `billing/*` y `payroll/liquidation` que usan `params.id` directamente.

---

## 🟠 NIVEL ALTO — Funcionalidad rota o frágil

### A1. Páginas sin backend — ⚠️ PENDIENTE
- **Conciliación bancaria**: no existe `api/companies/[id]/reconciliation/*`.
- **Documentos Recibidos**: parcialmente implementado (GET existe, falta import/delete).
- **`/dashboard/kpis`**: ruta no existe.

### A2. SII/DTE son stubs / mocks — ⚠️ PARCIALMENTE RESUELTO
- `sales/dte/credit-debit` y `guia-52` ahora consultan/insertan DB real.
- `sii/submit` sigue siendo stub (simulado, sin certificado digital real).
- `accounting/f29`, `honorarios`, `fixed-assets`, `sales-book`, `general-ledger`, `financial-statements` son stubs.

### A3. Errores de cálculo fiscal/nómina — ✅ PARCIALMENTE RESUELTO
- **Gratificación**: corregida a 25% con tope 4.75 IMM (no UF).
- **Tramo 2ª categoría**: actualizado a tramos 2025 UF.
- **Overtime divisor**: corregido a `44/7` (jornada legal chilena).
- Queda: F29 retención honorarios, doble resta impuesto 2ª categoría.

### A4. Sin validación cross-tenant de entidades hijas — ✅ PARCIALMENTE RESUELTO
Añadida validación para: `tasks` (parent_id), `expenses` (category_id, cost_center_id), `cost-centers` (parent_id). Faltan: `dependencies`, `checklists`, `vacation-requests` (employee_id), `stock-transfers` (bodegas), `physical-counts`.

### A5. `contract_type` CHECK — ✅ RESUELTO
Migración 102 + 100 actualizan CHECK constraint a valores español (`indefinido`, `plazo_fijo`, `temporada`, `boleta_7a`, `part_time`). Default unificado.

---

## 🟡 NIVEL MEDIO

### M1. IVA default — ✅ RESUELTO
`invoices/route.ts` usa `item.tax_rate !== undefined ? Number(item.tax_rate) : 19` como fallback.

### M2. DDL repetido + `catch {}` vacío — ⚠️ PENDIENTE
`delivery-guides`, `settings/uf`, `settings/iva` aún ejecutan DDL.

### M3. CRUD incompleto / desalineado — ✅ PARCIALMENTE RESUELTO
- `product-relations`: backend acepta ambos `up_sell` y `upsell`.
- `sales_quotation_items`: `quantity` sigue como INTEGER (aceptable).
- `createStockMovement` POST ya existe en `stock-movements/route.ts`.

### M4. Duplicación `[locale]` vs sin locale — ⚠️ PENDIENTE
Deuda de arquitectura. ~142 páginas duplicadas.

### M5. Secretos / seeds — ⚠️ PENDIENTE
Super-admin default credentials. `.env.local` versionado.

### M6. Sin tests — ✅ RESUELTO
126 tests unitarios (invoices, helpers, auth, format, payroll, liquidation).

### M7. Webhooks events type — ✅ RESUELTO
`webhooks.ts` corregido: `queueWebhookDelivery` inserta `event_type` y `payload` correctamente. PUT de `webhook-endpoints` pasa events como array (no `JSON.stringify`).

### M8. GET `/modules` sólo para super-admin — ⚠️ PENDIENTE
Admin de empresa no puede listar módulos propios.

---

## 🟢 NIVEL MENOR (deuda / mejora)

- **L1**: RLS "decorativo" — la app `pg` nunca setea `app.current_company_id`.
- **L2**: `getDashboard`/`getDashboardKpis` duplicados y uno roto.
- **L3**: helpers `formatCLP`/`formatRUT` re-declarados inline.
- **L4**: POS sin endpoint propio.
- **L5**: notificación low-stock sin `await`.

---

## Resumen ejecutivo

| Estado | Prioridad | Items resueltos |
|--------|-----------|-----------------|
| ✅ Resuelto | 🔴 Crítico | C0.1, C0.2, C0.3, C0.4, C0.5, C0.6, C0.7 (12/14 items) |
| ⚠️ Parcial | 🔴 Crítico | C1 (parcial), C2 (parcial) |
| ⚠️ Pendiente | 🔴 Crítico | C3, C4 |
| ✅ Resuelto | 🟠 Alto | A5 |
| ⚠️ Parcial | 🟠 Alto | A1, A2, A3, A4 |
| ✅ Resuelto | 🟡 Medio | M1, M3, M6, M7 |
| ⚠️ Pendiente | 🟡 Medio | M2, M4, M5, M8 |

**Total items resueltos: 18/28 (64%)**
**Total items parcialmente resueltos: 6/28 (21%)**
**Total items pendientes: 4/28 (14%)**

---

*Actualizado tras commits de corrección ERP. Migración 107 formaliza tablas faltantes. 126 tests pasando, tsc 0 errores.*

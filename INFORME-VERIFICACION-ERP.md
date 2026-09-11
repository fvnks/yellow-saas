# Informe FINAL — Verificación exhaustiva del Módulo ERP (Yellow ERP)

> Auditoría completa del núcleo ERP: dashboard + Inventario, Ventas, Compras, Clientes, Proveedores, CRM, Contabilidad, Nómina, Gastos, Proyectos, Configuración y Herramientas.
> Método: lectura directa + 4 subagentes de auditoría por módulo, todo verificado contra migraciones y código real.
> **Escala verificada: 25 submódulos · 142 páginas · 386 endpoints `route.ts` · 138 directorios de API · 94 rutas de sidebar.**
> Hallazgos ordenados **de más crítico a menos crítico**.

---

## 0. Nota metodológica importante (dos "fuentes" de esquema)

Existen **dos orígenes de esquema en conflicto**:
1. `packages/db/supabase/migrations/*.sql` (97 archivos, versionados).
2. `apps/web/src/app/api/migrate/route.ts` (888 líneas, bootstrap runtime que `CREATE TABLE IF NOT EXISTS` decenas de tablas, incluidas `taxes`, `units_of_measure`, `product_batches`, `product_variants`, `stock_reservations`, `product_boms`, `label_templates`, `adjustment_reasons`, `product_tags`, `product_relations`, `product_price_history`, `inventory_valuation_methods/runs`, `valuation_layers`, etc.).

Por tanto, **muchas tablas "faltan" en las migraciones versionadas pero SÍ se crean al correr `/api/migrate`**. El riesgo real es: (a) drift entre ambos orígenes, (b) un deploy que aplique sólo migraciones versionadas (sin `/api/migrate`) quedará **a medias**. Hay tablas que NO están en ninguno de los dos orígenes (ver C0.4), éstas sí rompen en runtime.

---

## 🔴 NIVEL CRÍTICO — SQL contra columnas/tablas inexistentes (rompe en runtime)

### C0.1 — Rutas SII consultan columnas fantasma en `invoices`
`api/companies/[id]/sii/submit/route.ts` y `sii/dte/route.ts` consultan `invoices.type, folio, fecha_emision, seller_id, buyer_id, descuento, monto_net, iva, monto_total`. El esquema real (`001:266-285` + `062`) define `invoice_number, customer_id, invoice_date, subtotal, tax_amount, total_amount, paid_amount, sii_*`. **Ninguna** de esas columnas existe → toda emisión SII lanza error 42703. Además `sii/dte:38-41` consulta el cliente con `invoice.seller_id` (inexistente) en vez de `buyer_id`.

### C0.2 — `purchase-orders` usa columnas fantasma
`purchase-orders/route.ts`: ordena por `po.number` (real: `order_number`) y los ítems insertan/leen `discount_amount, tax_amount, notes, sort_order` e intentan insertar `line_total` (que es `GENERATED ALWAYS`) → crear/actualizar OC falla.

### C0.3 — `suppliers` POST inserta `notes` inexistente
`suppliers/route.ts` inserta `notes`; `suppliers` (`001:308-332`) **no tiene `notes`** → crear proveedor falla (42703).

### C0.4 — Tablas ENTERAS sin crear en ningún origen (42P01 undefined_table)
Verificado con grep en migraciones **y** en `api/migrate/route.ts`: no existen en ninguno.
- `goods_receipts` / `goods_receipt_items` → **"Recepción de Artículos"** rota.
- `customer_returns` / `customer_return_items` → **"Devoluciones"** rota (la ruta captura `err.code==='42P01'`).
- `internal_orders` → **"Pedidos"** (`/dashboard/sales/pedidos`) rota.
- `webhook_endpoints` / `webhook_deliveries` → **Webhooks al 100% roto** (`api/lib/webhooks.ts` + `webhook-endpoints/*`). Además `queueWebhookDelivery` hace `INSERT (6 columnas) VALUES (5 valores)` y omite insertar `payload`.
- `sales_quotations` / `sales_quotation_items` → se crean en runtime con `ensureTables()` (no migración); `quantity INTEGER`, sin RLS, sin `UNIQUE`.

### C0.5 — Contabilidad: SQL corrupto / columnas fantasma
- `accounts/route.ts` (GET): selecciona `a.level, a.description, a.currency, a.is_system, a.balance` → **ninguna existe** en `accounts` (`001:536-548` sólo `code,name,type,parent_id,is_active,is_control`).
- `accounts/[accountId]/route.ts`: alias de tabla **corrupto con caracteres CJK** `je平衡` (línea 14,19) → SQL inválido.
- `journal-entries/route.ts` + `[entryId]`: usa `je.date` (real: `entry_date`) e inserta `jel.sort_order` que **no existe** en `journal_entry_lines` → crear/leer asientos falla.
- `employees/route.ts` (POST/PUT): inserta `rut, emergency_contact, emergency_phone, afp_fund, afp_rate, afp_commission, health_type, health_amount, mutual_type, mutual_rate, apv_amount, image_url` → **no existen** en `employees` (`001:474-501`). Además `contract_type='indefinido'` viola el CHECK (`indefinite|fixed_term|seasonal|part_time`).
- `expenses/route.ts` (POST): inserta `created_by = current_user_id()` → **la función SQL no existe** → **todo gasto devuelve 500**.

### C0.6 — Proyectos: JOIN a columnas inexistentes
- `projects/[projectId]/members/route.ts` usa `profiles.first_name || ' ' || profiles.last_name` → `profiles` sólo tiene `full_name` → GET miembros = 500.
- `projects/[projectId]/timesheets/route.ts` usa `employees.name` → `employees` tiene `first_name/last_name` → GET timesheets = 500.

### C0.7 — Inventario: conflicto de schema `stock_transfers` + columnas fantasma
- Migración `034` (product_id/from_warehouse_id/to_warehouse_id/quantity) vs `083` (source_warehouse_id/destination_warehouse_id + tabla `stock_transfer_items`) definen la **misma tabla** incompatible; `083` usa `CREATE TABLE stock_transfers` **sin** `IF NOT EXISTS`.
- `stock-transfers/[transferId]/route.ts` (PATCH) lee `transfer.quantity, product_id, from_warehouse_id, to_warehouse_id` → no existen en el schema final.
- `products/[productId]/route.ts` usa `image_url` → columna que **no existe** en `products`.

---

## 🔴 NIVEL CRÍTICO — Corrupción de datos / autorización

### C1. Operaciones multi-paso NO atómicas (sistémico)
Solo **8 de 386** rutas usan `transaction` (7 son de Veterinaria). Todos estos flujos son no-atómicos (fallo a mitad ⇒ datos inconsistentes):
- `invoices` (factura+ítems), `journal-entries` (asiento+líneas), `delivery-guides` (guía+ítems+descuento stock), `credit-notes`/`debit-notes` (nota+items+update paid_amount), `customer-returns`, `goods-receipts`, `purchase-orders`, `payroll/calculate` (borra items + loop insert), `projects/clone`.
- **Bug adicional**: `stock-transfers/confirm` e `inventory-counts/complete` llaman `query('BEGIN')`/`COMMIT`/`ROLLBACK` **sobre conexiones distintas** (el helper `db.query()` abre y cierra un cliente por llamada) → el "BEGIN/COMMIT" no agrupa nada; no son atómicos de verdad. Deben usar `transaction(async client => …)`.

### C2. DDL (`ALTER/CREATE TABLE`) dentro de handlers HTTP
`invoices` (DROP NOT NULL + ADD COLUMN en cada POST), `delivery-guides`, `sales-quotations`, `settings/uf`, `settings/iva` ejecutan DDL en el hot path con `catch {}` vacío que traga errores. Esquema mutable por request, locks, y no versionado.

### C3. Numeración de folio con race condition
`invoices/route.ts:116-121` genera `FE-000001`/`BF-000001` con `COUNT(*)+1` → folios duplicados en concurrencia, sin `UNIQUE`.

### C4. **`getCompanyId` NO valida el tenant (agujero multi-tenant sistémico)**
`api/lib/helpers.ts:4-10` extrae `company_id` **del pathname de la URL**, nunca del JWT, y no consulta `user_companies`. Cualquier usuario autenticado puede leer/escribir datos de otra empresa cambiando el UUID. Afecta a casi todas las rutas `/api/companies/[id]/*`. Las 4 rutas de `billing/*` y `payroll/liquidation` usan `params.id` **directamente**, aún menos defensivas. Las únicas rutas que validan son `modules` y `modules/activate`.

---

## 🟠 NIVEL ALTO — Funcionalidad rota o frágil

### A1. Páginas completas sin backend (página "muerta")
- **Conciliación bancaria** (`/dashboard/accounting/reconciliation`): llama 7 métodos del ApiClient (`getReconciliationSessions`, `createReconciliationSession`, `autoMatch`, etc.) → **no existe** `api/companies/[id]/reconciliation/*`.
- **Documentos Recibidos** (`/dashboard/received-documents`): ApiClient apunta a `/received-documents/*` que no tiene ruta (la migración 092 crea las tablas pero no hay API). *(Nota: en una verificación posterior detecté que sí existe `received-documents/route.ts` para GET; confirmar el resto de métodos import/delete.)*
- **`/dashboard/kpis`**: `getDashboardKpis()` (api-client.ts:779) apunta a una ruta que **no existe**.

### A2. SII/DTE son stubs / mocks (sin facturación electrónica real)
- `sii/submit` genera `track_id` falso (`SII-${Date.now()}-${random}`) sin contactar al SII.
- `sales/dte/credit-debit` y `sales/dte/guia-52` devuelven arrays **mock hardcodeados** (`sii_status:'aceptado'`, fechas 2026 fijas, `company_id` default hardcodeado), sin tocar DB.
- `accounting/f29`, `honorarios`, `fixed-assets`, `sales-book`, `general-ledger`, `financial-statements` son todos **stubs/mocks** con montos inventados.

### A3. Errores de cálculo fiscal/nómina
- **Impuesto 2ª categoría restado 2 veces** (`lib/payroll/index.ts:536-539`): `IMP-2C` entra en `deductions` y además en `totalTax`, y luego `netPay = earnings − deductions − totalTax` → neto subestimado.
- **Gratificación mal**: `lib/payroll/liquidation.ts:147-148` usa `4.75 × UF` y `1%/mes`; la ley (Art. 47) es 25% de lo devengado con tope 4.75 **ingresos mínimos**, no UF.
- Tramo 2ª categoría y `_ufValue=38500` **hardcodeados/desactualizados** (no indexados por UTM/UF).
- F29 usa retención honorarios `13.75%` (lo estándar es distinto) y códigos SII placeholder.

### A4. Sin validación cross-tenant de entidades hijas en POST
`tasks` (parent_id), `dependencies`, `checklists`, `vacation-requests` (employee_id), `expenses` (category_id/cost_center_id), `cost-centers` (parent_id), `stock-transfers` (bodegas), `physical-counts`: insertan IDs del body sin verificar pertenencia a la misma empresa.

### A5. Empresas creadas con `contract_type` que viola CHECK (drift)
`employee` se crea como `'indefinido'` pero el CHECK de `001` es `indefinite|fixed_term|seasonal|part_time` (sólo `/api/payroll/migrate` ad-hoc lo cambia). Depende de ejecutar un endpoint manual para que la tabla acepte datos.

---

## 🟡 NIVEL MEDIO

### M1. IVA default no aplicado al facturar
`invoices/route.ts` usa `(item.tax_rate || 0)` → si el front no envía tasa, la factura queda sin IVA (no usa 19% default); totales dependen del front.

### M2. DDL repetido + `catch {}` vacío
Cada POST de factura ejecuta `ALTER TABLE ... DROP NOT NULL` / `ADD COLUMN`; los `catch { /* already exists */ }` ocultan errores reales de esquema/permissions.

### M3. CRUD incompleto / desalineado
- `createStockMovement` (api-client) hace POST `/stock-movements`, pero esa ruta **sólo define GET** → 405.
- `getStockMovements({product})` envía `product` pero el route lee `product_id` → filtro ignorado.
- `product-relations` front envía `relation_type: 'up_sell'|'substitute'|'component'` pero el backend valida `['upsell','cross_sell','accessory','alternative','bundle']` → rechazados en runtime.
- `sales_quotation_items.quantity INTEGER` (no permite decimales, inconsistente con el resto que usa DECIMAL).
- `getVet*` / `getStock*` algunos sin get-by-id que el resto sí tienen (ver nota de imagenología previa).

### M4. Duplicación masiva de rutas `[locale]` vs sin locale
~142 páginas + componentes + helpers `formatCLP/RUT` duplicados en `src/app/dashboard/*` y `src/app/[locale]/dashboard/*` (falla sistémica del repo).

### M5. Secretos / seeds
Super-admin por defecto `superadmin@yellow.cl / SuperAdmin123!` (seed); `.env.local` versionado con credenciales reales (ver informe general del repo).

### M6. Sin tests
0 tests propios en todo el ERP.

### M7. Webhooks: tipo inconsistente de columna `events`
POST guarda `events` como array, PUT como `JSON.stringify(events)` (string) → `sendWebhook` rompe al filtrar `ANY(events)`.

### M8. GET `/modules` sólo para super-admin
`modules/route.ts` usa `verifySuperAdmin`, mientras `modules/activate` permite owner/admin de empresa → un admin no puede listar los módulos de su propia empresa por esa ruta.

---

## 🟢 NIVEL MENOR (deuda / mejora)

- **L1**: RLS "decorativo" (políticas con `current_setting('app.current_company_id')`/`auth.uid()` que la app `pg` nunca setea).
- **L2**: `getDashboard`/`getDashboardKpis` duplicados y uno roto.
- **L3**: helpers `formatCLP`/`formatRUT`/`clpFormatter` re-declarados inline en decenas de páginas.
- **L4**: POS sin endpoint propio (arma el flujo con `createInvoice`, que arrastra C1/C2/C3).
- **L5**: notificación low-stock en `stock-transfers/confirm` es fire-and-forget (sin `await`).

---

## Resumen ejecutivo

| Prioridad | Clave | Impacto |
|-----------|-------|---------|
| 🔴 Crítico | C0 (SQL a columnas/tablas inexistentes), C1 (no-atomicidad), C2 (DDL en rutas), C3 (race folio), C4 (getCompanyId sin validar tenant) | 500s, datos corruptos, fuga entre tenants |
| 🟠 Alto | A1 (páginas sin backend), A2 (SII/fiscal = stubs), A3 (errores de cálculo nómina), A4 (sin validación hijos), A5 (drift contract_type) | Funciones muertas / fiscal incorrecto |
| 🟡 Medio | M1–M8 (IVA, CRUD gaps, duplicación, secretos, webhooks) | Correctitud y mantenibilidad |
| 🟢 Menor | L1–L5 | Calidad / deuda |

## Plan de arreglo (orden de prioridad)

1. **Migraciones para tablas que no existen en ningún origen**: `goods_receipts(+items)`, `customer_returns(+items)`, `internal_orders`, `webhook_endpoints`+`webhook_deliveries`; formalizar `sales_quotations`.
2. **Corregir queries a columnas fantasma**: SII (`submit`/`dte`), `purchase-orders`, `suppliers` (notes), `accounts` (level/description/currency/is_system), alias CJK `je平衡`, `journal-entries` (`date→entry_date`, quitar `sort_order`), `employees` (columnas), `expenses` (`current_user_id()`), `members` (full_name), `timesheets` (first/last_name), `image_url`, `stock-transfers` (conflicto 034/083).
3. **Cerrar multi-tenant**: `getCompanyId` debe validar JWT↔tenant; quitar `params.id` directo en `billing/*` y `payroll/liquidation`.
4. **Transacciones**: envolver facturas, asientos, guías, notas, devoluciones, recepciones, nómina, clone; y arreglar `BEGIN/COMMIT` sobre pool (usar `transaction()`).
5. **Sacar DDL de rutas** a migraciones; quitar `catch {}` vacíos; arreglar INSERT desbalanceado de webhooks.
6. **Folio con secuencia/UNIQUE**.
7. **Implementar o retirar** backends de `reconciliation`, `received-documents` (import/delete), `/dashboard/kpis`.
8. **Arreglar cálculos fiscales**: impuesto 2ª categoría (doble resta), gratificación/aviso, retención honorarios; decidir SII real vs marcar "simulado".
9. **Validación cross-tenant de hijos** + **IVA default** + **contract_type** consistente.
10. Consolidar `[locale]`, centralizar `formatCLP/RUT`, añadir tests críticos.

---

*Consolidado de 4 subagentes de auditoría (Inventario, Ventas/Compras, Finanzas/Nómina, CRM/Proyectos/Settings) + verificación directa de archivos clave. Todas las afirmaciones de columnas/tablas inexistentes fueron contrastadas contra `packages/db/supabase/migrations/*.sql` y `apps/web/src/app/api/migrate/route.ts`.*
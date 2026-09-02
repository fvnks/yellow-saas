# Investigación: Módulo Talleres Automotrices para Yellow ERP

## Resumen Ejecutivo

Este documento resume la investigación realizada para desarrollar el módulo **Talleres Automotrices** de Yellow ERP, un sistema ERP multi-tenant diseñado específicamente para PYMEs chilenas.

---

## 1. Benchmark de Software del Sector

### 1.1 Shopmonkey (EE.UU.)
- **Enfoque**: Gestión integral de talleres desde check-in hasta entrega
- **Características clave**:
  - Check-in digital con fotos 360° del vehículo
  - Workflow de órdenes de trabajo con estados personalizados
  - Gestión de bays/postos en tiempo real
  - Citas online con integración de calendario
  - Pedidos de repuestos a proveedores con tracking
  - Comunicación con clientes vía SMS/email
  - Reportes de rendimiento de técnicos
  - Integración con DTE (equivalente estadounidense: e-invoicing)

### 1.2 RepairShopr (EE.UU.)
- **Enfoque**: Automatización de servicios automotrices
- **Características clave**:
  - Estimados digitales con aprobación online del cliente
  - Gestión de inventario de repuestos
  - Seguimiento de tiempos de técnico (time tracking)
  - Recordatorios automáticos de mantenimiento
  - Portal de cliente para ver estado de su vehículo
  - Facturación electrónica integrada

### 1.3 AutoFluent / TABS (Chile/Latam)
- **Enfoque**: Taller Automotriz Bilingüe Software
- **Características clave específicas para Chile**:
  - Gestión de Revista Técnica (Ley chilena)
  - Control de placa (patente) con tipos: normal, verde, negra
  - Facturación electrónica SII (DTE)
  - RUT de clientes y vehículos
  - Clima tributario chileno (IVA 19%)

---

## 2. Regulaciones Chilenas Específicas

### 2.1 Documentación Vehicular
- **Patente**: Formato chileno (ABCD12, EFGH34) con tipos:
  - Normal (blanca)
  - Verde (vehículos clásicos)
  - Negra (ejecutivos)
  - Diplomática
  - Defensa Nacional
  - Temporal
- **VIN (Chasis)**: Identificador único internacional
- **Revista Técnica**: Obligatorio cada 2 años (vehículos >4 años)

### 2.2 Facturación Electrónica (DTE SII)
- Todos los servicios deben emitirse como DTE
- Tipos de DTE aplicables:
  - Factura electrónica (33)
  - Nota de crédito (56)
  - Nota de débito (61)
  - Guía de despacho (52)
- IVA 19% estándar
- RUT del cliente requerido

### 2.3 Obligaciones Tributarias
- Libros de compra y venta obligatorios
- F29 mensual (declaración IVA)
- F22 anual (impuesto global)
- Retenciones en servicios (10% si aplica)

---

## 3. Flujo Operativo del Taller

### 3.1 Check-in (Recepción)
1. Registro del vehículo (patente, marca, modelo, año)
2. Inspección visual inicial (fotos, estado exterior/interior)
3. Anotación de queja del cliente
4. Medición de kilometraje y nivel de combustible
5. Generación de orden de trabajo con número único
6. Asignación de bay y técnico

### 3.2 Diagnóstico
1. Evaluación técnica del problema
2. Generación de estimado con items detallados:
   - Mano de obra (horas × tarifa)
   - Repuestos (precio × cantidad)
   - Servicios adicionales
3. Aprobación del cliente (firma digital o física)
4. Confirmación de disponibilidad de repuestos

### 3.3 Ejecución
1. Asignación a técnico y bay
2. Registro de tiempo trabajad o (time logs)
3. Uso de repuestos del inventario
4. Actualización de estado en tiempo real
5. Foto de reparación completada

### 3.4 Control de Calidad
1. Verificación de funcionamiento
2. Prueba de ruta (si aplica)
3. Limpieza del vehículo
4. Aprobación del supervisor

### 3.5 Entrega
1. Notificación al cliente
2. Explicación de trabajos realizados
3. Entrega de documentación (DTE, garantía)
4. Cobro y cierre de orden
5. Actualización de histor del vehículo

---

## 4. Modelo de Datos Propuesto

### Tablas Principales

| Tabla | Propósito | Key Fields |
|-------|-----------|------------|
| `auto_vehicles` | Registro de vehículos | patente, brand, model, year, vin, client_id |
| `auto_work_orders` | Órdenes de trabajo | order_number, status, priority, total, vehicle_id |
| `auto_work_order_items` | Items de OT | item_type (labor/part/service), quantity, unit_price |
| `auto_technicians` | Técnicos | full_name, specialization, hourly_rate, status |
| `auto_bays` | Bays/postos | number, type, status, capacity |
| `auto_estimates` | Estimados | estimate_number, status, total, valid_until |
| `auto_estimate_items` | Items de estimado | item_type, quantity, unit_price |
| `auto_inspections` | Inspecciones visuales | inspection_type, fuel_level, damage_notes |
| `auto_parts_orders` | Pedidos a proveedores | order_number, status, total_cost |
| `auto_appointments` | Citas/agenda | appointment_date, start_time, end_time |
| `auto_time_logs` | Registro de tiempo | start_time, end_time, total_minutes |
| `auto_services` | Catálogo de servicios | name, category, estimated_hours, base_price |

### Estados de Orden de Trabajo
```
checkin → diagnostic → estimated → approved → waiting_parts 
       → in_progress → quality_check → ready → delivered → invoiced
```

### Estados de Estimado
```
borrador → pendiente_aprobacion → aprobado → rechazado → expirado → convertido_a_ot
```

### Estados de Pedido de Repuestos
```
solicitado → pedido → en_transito → recibido → cancelado → devuelto
```

---

## 5. Integración con Yellow ERP Existente

### 5.1 Tablas Compartidas
- `companies` → company_id (multi-tenant)
- `customers` → client_id (referenciado por vehículos y órdenes)
- `products` → part_id (repuestos del inventario general)
- `suppliers` → supplier_id (para pedidos de repuestos)
- `dtes` → dte_id (facturación electrónica)

### 5.2 Módulos Relacionados
- **Inventario**: Control de repuestos y stock
- **Compras**: Pedidos a proveedores
- **Ventas**: DTE y facturación
- **Contabilidad**: Asientos automáticos por órdenes completadas

---

## 6. KPIs del Taller

### Operativos
- **ARO** (Average Repair Order): Revenue promedio por orden
- **Tasa de conversión**: Estimados → Órdenes
- **Tiempo promedio de reparación**: Check-in → Entrega
- **Ocupación de bays**: % de bays ocupados vs disponibles
- **Productividad por técnico**: Órdenes completadas por día

### Financieros
- **Revenue mensual**: Suma de órdenes facturadas
- **Margen por servicio**: Revenue - Costo de repuestos - Mano de obra
- **Cuentas por cobrar**: Órdenes entregadas no facturadas

### Calidad
- **Tasa de retry**: Órdenes que vuelven a taller (<30 días)
- **Satisfacción del cliente**: Rating promedio por técnico
- **Tiempo de espera**: Desde check-in hasta entrega

---

## 7. Stack Tecnológico

### Base de Datos
- PostgreSQL con Supabase
- RLS policies para multi-tenancy
- Enums para estados y tipos
- Índices compuestos para queries frecuentes

### Frontend
- Next.js 14 con App Router
- TypeScript estricto
- Tailwind CSS con tokens del diseño system
- Lucide icons
- Zustand para state management (opcional)

### API
- Next.js API Routes
- Query directa a PostgreSQL (pool de conexiones)
- Response helpers (successResponse, errorResponse)

---

## 8. Próximos Pasos

1. **Forms de creación**: Nueva orden, nuevo vehículo, nuevo estimado
2. **Detalle de orden**: Página completa con timeline, items editables, fotos
3. **Impresión**: PDF de orden de trabajo y estimados
4. **Notificaciones**: Email/SMS al cliente en cambios de estado
5. **Dashboard avanzado**: Gráficos de revenue, ocupación, KPIs
6. **Integración DTE**: Conexión con servicio de facturación electrónica
7. **App móvil**: Check-in desde celular con fotos

---

## 9. Referencias

- Shopmonkey Documentation: https://www.shopmonkey.com
- RepairShopr Features: https://www.repairshopr.com
- TABS AutoFluent: https://www.auto fluent.com
- SII Chile: https://www.sii.cl
- Ley 21.442 (Condominios) - contexto regulatorio chileno

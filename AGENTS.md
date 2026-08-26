# Yellow ERP - Authentic Design System & Chilean SME Rules

## Project Overview

Yellow ERP is a multi-tenant SaaS ERP tailored specifically for Chilean SMEs (PYMEs). This document defines the **custom visual identity, layout standards, and Chilean localization rules** that ALL modules must implement.

**Design Aesthetic:** Yellow ERP Sun-Slate Modern (Deep Slate Navy `#0F172A` + Sun Yellow Accent `#FACC15` + Warm Neutral Canvas `#F8FAFC`).

---

## Layout

```
┌────────────────────────────────────────────────────────┐
│ HEADER (h-16) with UF/UTM Live Badge & Business Selector│
├──────────┬─────────────────────────────────────────────┤
│ SIDEBAR  │ CONTENT (scrollable, p-6 bg-[#F8FAFC])      │
│ (w-64)   │                                             │
│ bg-slate │ Cards with Chilean ERP Widgets & Tables     │
└──────────┴─────────────────────────────────────────────┘
```

- **Sidebar**: `w-64 bg-[#0F172A] text-slate-300 h-screen fixed left-0 top-0 border-r border-slate-800 z-20` (Deep obsidian slate with yellow highlights)
- **Header**: `h-16 bg-white border-b border-slate-200/80 fixed top-0 right-0 left-64 z-10 px-6 flex items-center justify-between`
- **Content Canvas**: `ml-64 pt-16 p-6 bg-[#F8FAFC] min-h-screen`

---

## Brand Colors & Tokens

### Light Mode (Default Canvas)

| Token | Value | Purpose |
|-------|-------|---------|
| background | `bg-[#F8FAFC]` | Canvas background |
| card | `bg-white border border-slate-200/80 shadow-sm rounded-2xl` | Standard card container |
| primary | `bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-semibold` | Signature Yellow Button |
| primary-dark | `bg-[#0F172A] hover:bg-[#1E293B] text-white` | Deep Navy Action Button |
| success | `bg-emerald-50 text-emerald-700 border-emerald-200` | DTE Aceptado / Stock OK |
| warning | `bg-amber-50 text-amber-700 border-amber-200` | DTE Pendiente / Alerta Stock |
| danger | `bg-rose-50 text-rose-700 border-rose-200` | DTE Rechazado / Mermas |
| info | `bg-blue-50 text-blue-700 border-blue-200` | SII Guía / Info |
| text-primary | `text-slate-900` | Primary Headings & Labels |
| text-secondary | `text-slate-500` | Subtitles & Descriptions |
| border | `border-slate-200/80` | Card & Table Borders |
| hover-row | `hover:bg-slate-50/80` | Table row hover |

---

## Module Personalities

Each module maintains the shared structural skeleton while highlighting its specialized Chilean workflow identity:

| Module | Primary Accent | Accent Token | Highlight Focus |
|--------|----------------|--------------|-----------------|
| **Dashboard ERP** | Sun Yellow | `#FACC15` / `amber-500` | SII DTE Resumen, Flujo Caja CLP/UF |
| **Inventario** | Emerald Teal | `#10B981` / `emerald-600` | Bodegas, SKU Barcodes, ABC Valorización |
| **Ventas & DTE** | Electric Blue | `#3B82F6` / `blue-600` | Facturación Electrónica SII, Guías |
| **Compras** | Warm Amber | `#F59E0B` / `amber-600` | Recepción Proveedores, Órdenes de Compra |
| **RRHH & Sueldos** | Rose Crimson | `#F43F5E` / `rose-600` | Liquidaciones, Previred, Asistencia |
| **Proyectos** | Royal Purple | `#8B5CF6` / `purple-600` | Presupuestos, Hitos, Avance de Obra |
| **Recetas / BOM** | Burnt Gold | `#F97316` / `orange-600` | Fórmulas, Lotes de Producción, Rendimiento |
| **Mi Cuenta** | Cobalt Blue | `#2563EB` / `blue-700` | Suscripción SaaS, Módulos Activos |
| **Centro Ayuda** | Mint Green | `#059669` / `emerald-600` | Base Conocimientos, Support Tickets |

---

## Chilean SME Business Formatting

1. **Moneda CLP**:
   ```ts
   new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
   ```
2. **Indicadores Financieros (Header Badge)**:
   - UF: Indicador diario SII
   - UTM: Valor mensual
3. **RUT Chileno**:
   - Formato estándar `XX.XXX.XXX-X`
4. **DTE SII Status Badges**:
   - `DTE Aceptado SII` (Emerald)
   - `Pendiente Envío SII` (Amber)
   - `Rechazado SII` (Rose)

---

## Components

### Signature Yellow ERP Primary Button

```tsx
<button className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center gap-2">
  <Plus className="w-4 h-4" />
  Nuevo Registro
</button>
```

### Signature Dark Action Button

```tsx
<button className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center gap-2">
  Acción Principal
</button>
```

### Standard Module Card

```tsx
<div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
  <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
    <h3 className="text-sm font-bold text-slate-900">Título del Módulo</h3>
  </div>
  <div className="p-6">
    {/* Content */}
  </div>
</div>
```

---

## Rules

1. **ALWAYS** display values in CLP format with Chilean locale support.
2. **ALWAYS** use `rounded-2xl` for main cards and `rounded-xl` for buttons/inputs.
3. **ALWAYS** include `company_id` scope in API requests & Supabase RLS.
4. **ALWAYS** maintain full responsiveness for desktop and mobile devices.
5. **ALWAYS** preserve zero TypeScript compilation errors.

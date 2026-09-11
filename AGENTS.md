# Yellow ERP - Authentic Design System & Chilean SME Rules

## Project Overview

Yellow ERP is a multi-tenant SaaS ERP tailored specifically for Chilean SMEs (PYMEs). This document defines the **custom visual identity, layout standards, and Chilean localization rules** that ALL modules must implement.

**Design Aesthetic:** monday.com-Inspired Modern (Primary Violet `#6161FF` + Ink `#323338` + Cloud Canvas `#F7F8FA`).

---

## Layout

```
┌────────────────────────────────────────────────────────┐
│ HEADER (h-16) with UF/UTM Live Badge & Business Selector│
├──────────┬─────────────────────────────────────────────┤
│ SIDEBAR  │ CONTENT (scrollable, p-6 bg-cloud)          │
│ (w-64)   │                                             │
│ bg-snow  │ Cards with Chilean ERP Widgets & Tables     │
└──────────┴─────────────────────────────────────────────┘
```

- **Sidebar**: `w-64 bg-snow text-ink h-screen fixed left-0 top-0 border-r border-mist z-20` (White sidebar with violet active state)
- **Header**: `h-16 bg-snow border-b border-mist fixed top-0 right-0 left-64 z-10 px-6 flex items-center justify-between`
- **Content Canvas**: `ml-64 pt-16 p-6 bg-cloud min-h-screen`

---

## Brand Colors & Tokens

### Light Mode (Default Canvas — no dark mode)

| Token | Tailwind | Hex | Purpose |
|-------|----------|-----|---------|
| primary | `monday-violet` | `#6161FF` | Primary CTA, active states, links |
| primary-hover | `monday-violet-hover` | `#5353e0` | Hover state for primary |
| ink | `ink` | `#323338` | Headings, primary text |
| slate-text | `slate-text` | `#676879` | Secondary text, descriptions |
| iron | `iron` | `#9d9eb5` | Labels, muted text |
| fog | `fog` | `#c3c6d4` | Borders, dividers |
| mist | `mist` | `#e6e7ef` | Card borders, input borders |
| cloud | `cloud` | `#f7f8fa` | Canvas background |
| snow | `snow` | `#ffffff` | Card background, sidebar |
| card | — | — | `bg-snow border border-mist rounded-3xl shadow-card` |
| card-hover | — | — | `bg-snow border border-fog rounded-3xl shadow-card-hover` |
| success | `mint/30 text-forest` | `#dff5e3` | DTE Aceptado / Stock OK |
| warning | `peach/30 text-[#c64d00]` | `#ffe8d6` | DTE Pendiente / Alerta Stock |
| danger | `peach/30 text-[#c64d00]` | `#ffe8d6` | DTE Rechazado / Mermas |
| info | `sky-accent/30 text-[#006680]` | `#d0ecf5` | SII Guía / Info |
| border | `mist` | `#e6e7ef` | Card & Table Borders |
| hover-row | `hover:bg-cloud` | — | Table row hover |

### Accent Colors (Pastel tints — badges, icons, chart fills)

| Name | Hex | Usage |
|------|-----|-------|
| `periwinkle` | `#ccccff` | Ventas, charts |
| `lavender` | `#b8b8ff` | CRM |
| `sky-accent` | `#d0ecf5` | Inventario, Costos |
| `mint` | `#dff5e3` | Success states, feature cards |
| `apricot` | `#ffd6c2` | Compras |
| `peach` | `#ffe8d6` | Warning states |
| `cotton-candy` | `#ffccff` | Proyectos |
| `peony` | `#ffccdd` | Nómina |
| `aqua` | `#ccffff` | Costos |

---

## Module Personalities

Each module maintains the shared structural skeleton while highlighting its specialized Chilean workflow identity:

| Module | Primary Accent | Accent Token | Highlight Focus |
|--------|----------------|--------------|-----------------|
| **Dashboard ERP** | Violet | `monday-violet` / `#6161FF` | SII DTE Resumen, Flujo Caja CLP/UF |
| **Inventario** | Sky Accent | `sky-accent` / `#d0ecf5` | Bodegas, SKU Barcodes, ABC Valorización |
| **Ventas & DTE** | Periwinkle | `periwinkle` / `#ccccff` | Facturación Electrónica SII, Guías |
| **Compras** | Apricot | `apricot` / `#ffd6c2` | Recepción Proveedores, Órdenes de Compra |
| **RRHH & Sueldos** | Peony | `peony` / `#ffccdd` | Liquidaciones, Previred, Asistencia |
| **Proyectos** | Cotton Candy | `cotton-candy` / `#ffccff` | Presupuestos, Hitos, Avance de Obra |
| **Recetas / BOM** | Peach | `peach` / `#ffe8d6` | Fórmulas, Lotes de Producción, Rendimiento |
| **Mi Cuenta** | Lavender | `lavender` / `#b8b8ff` | Suscripción SaaS, Módulos Activos |
| **Centro Ayuda** | Mint | `mint` / `#dff5e3` | Base Conocimientos, Support Tickets |

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
   - `DTE Aceptado SII` (Mint/Forest)
   - `Pendiente Envío SII` (Peach/Orange)
   - `Rechazado SII` (Peach/Orange)

---

## Typography

- **Font Family**: Poppins (Google Fonts) — `'Poppins', system-ui, sans-serif`
- **Weights**: Light (300) for headings, Regular (400) for body, Semi-Bold (600) for buttons/labels, Bold (700) for strong emphasis
- **Headings**: `font-light tracking-[-0.02em]` — clean, modern, airy
- **Body**: `font-normal leading-relaxed` — comfortable reading

---

## Spacing & Radius

- **Cards**: `rounded-3xl` (24px)
- **Buttons**: `rounded-[160px]` (pill shape)
- **Inputs**: `rounded-md` (6px)
- **Badges**: `rounded-md` (6px)
- **Shadows**: `shadow-card` (0 2px 8px rgba(50,51,56,0.08)), `shadow-card-hover` (0 8px 24px rgba(50,51,56,0.12))
- **Focus ring**: `focus:ring-2 focus:ring-monday-violet/20`

---

## Components

### Primary CTA Button (Violet Pill)

```tsx
<button className="bg-monday-violet hover:bg-monday-violet-hover text-white px-6 py-3 rounded-[160px] text-sm font-medium shadow-sm transition-all duration-150 active:scale-[0.98] flex items-center gap-2">
  <Plus className="w-4 h-4" />
  Nuevo Registro
</button>
```

### Secondary Button (Ghost/Outline)

```tsx
<button className="bg-snow border border-mist hover:bg-cloud text-ink px-6 py-3 rounded-[160px] text-sm font-medium transition-all duration-150">
  Acción Secundaria
</button>
```

### Standard Module Card

```tsx
<div className="bg-snow border border-mist rounded-3xl shadow-card overflow-hidden">
  <div className="px-6 py-4 border-b border-mist flex items-center justify-between">
    <h3 className="text-sm font-semibold text-ink">Título del Módulo</h3>
  </div>
  <div className="p-6">
    {/* Content */}
  </div>
</div>
```

### Badge (Pastel Tinted)

```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-mint/30 text-forest border border-mint/50">
  DTE Aceptado
</span>
```

---

## Rules

1. **ALWAYS** display values in CLP format with Chilean locale support.
2. **ALWAYS** use `rounded-3xl` for main cards and `rounded-[160px]` for buttons.
3. **ALWAYS** include `company_id` scope in API requests & Supabase RLS.
4. **ALWAYS** maintain full responsiveness for desktop and mobile devices.
5. **ALWAYS** preserve zero TypeScript compilation errors.
6. **NEVER** use dark mode classes — the design is light-only.
7. **NEVER** use yellow/amber as primary — the accent is `#6161FF` violet.

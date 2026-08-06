# Yellow ERP - Design System & Rules

## Project Overview

Yellow ERP is a multi-tenant SaaS ERP for Chilean SMEs. This document defines the **visual rules and constraints** that ALL modules must follow.

**Design Style:** BankDash Modern Banking Dashboard

---

## Layout

```
┌──────────────────────────────────────────────────────┐
│ HEADER (h-16)                                        │
├──────────┬───────────────────────────────────────────┤
│ SIDEBAR  │ CONTENT (scrollable, p-6)                │
│ (w-64)   │                                          │
│ fixed    │ Cards with tables, forms, or widgets     │
└──────────┴───────────────────────────────────────────┘
```

- Sidebar: `w-64 bg-white h-screen fixed left-0 top-0 border-r border-[#E6EFF5]` (white with accent)
- Header: `h-16 bg-white border-b border-[#E6EFF5] fixed top-0 right-0 left-64 z-10`
- Content: `ml-64 pt-16 p-6 bg-[#F5F7FA]`

---

## Colors

### Light Mode (Default)

| Token | Value |
|-------|-------|
| background | `bg-[#F5F7FA]` |
| card | `bg-white border border-[#E6EFF5] shadow-sm rounded-2xl` |
| primary | `bg-[#1814F3] hover:bg-[#1612D3] text-white` |
| success | `bg-[#16DBCC]` / `bg-emerald-50 text-emerald-700 border-emerald-200` |
| warning | `bg-[#FFBB38]` / `bg-amber-50 text-amber-700 border-amber-200` |
| danger | `bg-[#FE5C73] hover:bg-[#E54A62]` |
| info | `bg-[#2D60FF]` / `bg-blue-50 text-blue-700 border-blue-200` |
| text-primary | `text-[#232323]` |
| text-secondary | `text-[#718EBF]` |
| text-muted | `text-[#8BA3CB]` |
| border | `border-[#E6EFF5]` |
| hover-row | `hover:bg-[#F5F7FA]` |
| input-bg | `bg-white border-[#E6EFF5]` |
| focus-ring | `focus:ring-[#1814F3]/20 focus:border-[#1814F3]` |

---

## Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Module title | `text-xl` | `font-bold` | `text-foreground` |
| Subtitle | `text-sm` | `font-normal` | `text-muted-foreground` |
| Description | `text-sm` | `font-normal` | `text-muted-foreground` |
| Table body | `text-xs` | `font-normal` | `text-foreground` |
| Table header | `text-[10px]` | `font-medium uppercase tracking-wider` | `text-muted-foreground` |
| Badge | `text-[9px]` | `font-semibold` | Per status color |
| Button | `text-sm` | `font-medium` | Depends on variant |
| Input label | `text-xs` | `font-medium` | `text-foreground` |

---

## Components (Copy-Paste Ready)

### Card

```tsx
<div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm">
  <div className="px-6 py-4 border-b border-[#E6EFF5]">
    <h3 className="text-sm font-semibold text-foreground">Title</h3>
  </div>
  <div className="p-6">
    {/* content */}
  </div>
</div>
```

### Buttons

```tsx
// Primary
<button className="bg-[#1814F3] hover:bg-[#1612D3] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98]">
  Action
</button>

// Secondary
<button className="bg-white border border-[#E6EFF5] hover:bg-[#F5F7FA] text-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150">
  Cancel
</button>

// Danger
<button className="bg-[#FE5C73] hover:bg-[#E54A62] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98]">
  Delete
</button>

// Success
<button className="bg-[#16DBCC] hover:bg-[#14C4B6] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98]">
  Save
</button>
```

### Table

```tsx
<table className="w-full">
  <thead>
    <tr className="border-b border-[#E6EFF5]">
      <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">
        Column
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-[#E6EFF5] hover:bg-[#F5F7FA] transition-colors duration-100">
      <td className="px-4 py-3 text-xs text-[#232323]">
        Value
      </td>
    </tr>
  </tbody>
</table>
```

### Badges

```tsx
// Success
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
  Paid
</span>

// Warning
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
  Pending
</span>

// Danger
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
  Cancelled
</span>

// Info
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
  In Transit
</span>

// Neutral
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
  Draft
</span>
```

### Input

```tsx
<div className="space-y-1">
  <label className="block text-xs font-medium text-foreground">
    Label
  </label>
  <input
    type="text"
    className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150"
    placeholder="Placeholder..."
  />
</div>
```

### Select

```tsx
<select className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150">
  <option>Select...</option>
</select>
```

### Modal

```tsx
<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
    <div className="px-6 py-4 border-b border-[#E6EFF5] flex items-center justify-between">
      <h2 className="text-lg font-semibold text-[#232323]">Title</h2>
      <button className="text-muted-foreground hover:text-foreground transition-colors">
        <X className="w-5 h-5" />
      </button>
    </div>
    <div className="p-6">
      {/* content */}
    </div>
    <div className="px-6 py-4 border-t border-[#E6EFF5] flex justify-end gap-3">
      <button className="...">Cancel</button>
      <button className="...">Save</button>
    </div>
  </div>
</div>
```

### KPI Card

```tsx
<div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-5 hover:border-[#E6EFF5]/80 transition-all duration-150">
  <div className="flex items-center justify-between mb-3">
    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
      Label
    </p>
    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
      <Icon className="w-5 h-5 text-blue-600" />
    </div>
  </div>
  <p className="text-2xl font-bold text-foreground">
    Value
  </p>
  <p className="text-[11px] text-muted-foreground mt-1">
    +12% vs last month
  </p>
</div>
```

---

## Icons

Use **Lucide React** exclusively.

```tsx
import { IconName } from 'lucide-react';

// Sizes
<Icon className="w-4 h-4" />  // sidebar, inline
<Icon className="w-5 h-5" />  // buttons, headers
<Icon className="w-6 h-6" />  // KPI cards
```

### Module Icons

| Module | Icon |
|--------|------|
| Dashboard | `LayoutDashboard` |
| Inventory | `Package` |
| Warehouses | `Warehouse` |
| Sales | `ShoppingCart` |
| Purchases | `ShoppingBag` |
| Customers | `Users` |
| Suppliers | `Truck` |
| CRM | `Handshake` |
| Payroll | `Wallet` |
| Accounting | `Calculator` |
| Projects | `FolderKanban` |
| POS | `Monitor` |
| Billing | `CreditCard` |
| Settings | `Settings` |
| Audit | `ScrollText` |

---

## Spacing

- Card padding: `p-6`
- Gap between cards: `gap-4` or `gap-6`
- Table cell padding: `px-4 py-3`
- Section title margin: `mb-6`
- Modal padding: `p-6`
- Sidebar item padding: `px-3 py-2`

---

## Shadows

```
shadow-sm   // cards (subtle)
shadow-md   // small modals
shadow-xl   // main modals
```

---

## Transitions

```tsx
transition-all duration-150          // all interactive elements
active:scale-[0.98]                  // button click feedback
hover:bg-[#F5F7FA] transition-colors  // row hover
animate-pulse bg-slate-200           // skeleton loading
```

---

## Module Page Template

Every module MUST follow this structure:

```tsx
export default function ModuleName({ session, token, onNavigate }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Module Name</h1>
          <p className="text-sm text-muted-foreground mt-1">Description</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-150 active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          {/* filter inputs */}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* ... */}
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <p>Showing 1-10 of 50</p>
        <div className="flex items-center gap-2">
          {/* pagination buttons */}
        </div>
      </div>
    </div>
  );
}
```

---

## Database Conventions

Every module creates tables in Supabase with:

- Prefix: `module_tablename`
- Always include: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- Always include: `company_id UUID REFERENCES companies(id) ON DELETE CASCADE`
- Always include: `created_at TIMESTAMPTZ DEFAULT now()`
- RLS enabled: Policy with `company_id = current_company_id()`
- Index on `company_id` for performance

---

## API Conventions

Every module adds endpoints in `api/[...path].ts`:

```
GET    /api/companies/:id/module        → List
GET    /api/companies/:id/module/:id    → Detail
POST   /api/companies/:id/module        → Create
PUT    /api/companies/:id/module/:id    → Update
DELETE /api/companies/:id/module/:id    → Delete
```

---

## Rules

1. **NEVER** use colors outside the palette defined above
2. **ALWAYS** use `rounded-2xl` for cards, `rounded-xl` for buttons/inputs
3. **ALWAYS** use `text-[10px] uppercase` for table headers and badges
4. **ALWAYS** include hover states on interactive elements
5. **ALWAYS** use Lucide icons (no other icon libraries)
6. **ALWAYS** follow the module page template structure
7. **ALWAYS** add `company_id` FK and RLS to new tables
8. **NEVER** hardcode company data - always filter by `company_id`
9. **NEVER** expose service role key to frontend
10. **ALWAYS** use `onNavigate` for tab navigation
11. **ALWAYS** use `transition-all duration-150` for interactive elements
12. **ALWAYS** use `active:scale-[0.98]` for button click feedback
13. **NEVER** use gradients on cards or icons (flat design only)
14. **NEVER** use `hover:bg-black` - use `hover:bg-primary/90` instead
15. **ALWAYS** use colored backgrounds for icon containers (blue-50, teal-50, amber-50, etc.)

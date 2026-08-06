# Yellow ERP - Design System & Rules

## Project Overview

Yellow ERP is a multi-tenant SaaS ERP for Chilean SMEs. This document defines the **visual rules and constraints** that ALL modules must follow.

**Design Style:** Flat Design Modern (Vercel/Linear inspired)

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

- Sidebar: `w-64 bg-slate-900 h-screen fixed left-0 top-0` (dark)
- Header: `h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-64 z-10`
- Content: `ml-64 pt-16 p-6 bg-slate-50`

---

## Colors

### Light Mode (Default)

| Token | Value |
|-------|-------|
| background | `bg-slate-50` |
| card | `bg-white border border-slate-200 shadow-sm rounded-xl` |
| primary | `bg-slate-900 hover:bg-slate-800 text-white` |
| success | `bg-emerald-600` / `bg-emerald-50 text-emerald-700 border-emerald-200` |
| warning | `bg-amber-500` / `bg-amber-50 text-amber-700 border-amber-200` |
| danger | `bg-rose-600 hover:bg-rose-700` |
| info | `bg-blue-500` / `bg-blue-50 text-blue-700 border-blue-200` |
| text-primary | `text-slate-900` |
| text-secondary | `text-slate-500` |
| text-muted | `text-slate-400` |
| border | `border-slate-200` |
| hover-row | `hover:bg-slate-50` |
| input-bg | `bg-white border-slate-200` |
| focus-ring | `focus:ring-slate-900/10 focus:border-slate-900` |

---

## Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Module title | `text-xl` | `font-bold` | `text-slate-900` |
| Subtitle | `text-sm` | `font-normal` | `text-slate-500` |
| Description | `text-sm` | `font-normal` | `text-slate-500` |
| Table body | `text-xs` | `font-normal` | `text-slate-700` |
| Table header | `text-[9px]` | `font-semibold uppercase tracking-wider` | `text-slate-400` |
| Badge | `text-[9px]` | `font-semibold` | Per status color |
| Button | `text-sm` | `font-medium` | Depends on variant |
| Input label | `text-xs` | `font-medium` | `text-slate-700` |

---

## Components (Copy-Paste Ready)

### Card

```tsx
<div className="bg-white border border-slate-200 rounded-xl shadow-sm">
  <div className="px-6 py-4 border-b border-slate-100">
    <h3 className="text-sm font-semibold text-slate-900">Title</h3>
  </div>
  <div className="p-6">
    {/* content */}
  </div>
</div>
```

### Buttons

```tsx
// Primary
<button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98]">
  Action
</button>

// Secondary
<button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150">
  Cancel
</button>

// Danger
<button className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98]">
  Delete
</button>

// Success
<button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98]">
  Save
</button>
```

### Table

```tsx
<table className="w-full">
  <thead>
    <tr className="border-b border-slate-200">
      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
        Column
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-100">
      <td className="px-4 py-3 text-xs text-slate-700">
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
  <label className="block text-xs font-medium text-slate-700">
    Label
  </label>
  <input
    type="text"
    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors duration-150"
    placeholder="Placeholder..."
  />
</div>
```

### Select

```tsx
<select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors duration-150">
  <option>Select...</option>
</select>
```

### Modal

```tsx
<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-900">Title</h2>
      <button className="text-slate-400 hover:text-slate-600 transition-colors">
        <X className="w-5 h-5" />
      </button>
    </div>
    <div className="p-6">
      {/* content */}
    </div>
    <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
      <button className="...">Cancel</button>
      <button className="...">Save</button>
    </div>
  </div>
</div>
```

### KPI Card

```tsx
<div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 hover:border-slate-300 transition-all duration-150">
  <div className="flex items-center justify-between mb-3">
    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
      Label
    </p>
    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
      <Icon className="w-4 h-4 text-slate-600" />
    </div>
  </div>
  <p className="text-2xl font-bold text-slate-900">
    Value
  </p>
  <p className="text-[11px] text-slate-500 mt-1">
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
hover:bg-slate-50 transition-colors  // row hover
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
          <h1 className="text-xl font-bold text-slate-900">Module Name</h1>
          <p className="text-sm text-slate-500 mt-1">Description</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-150 active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          {/* filter inputs */}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* ... */}
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-slate-500">
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
2. **ALWAYS** use `rounded-xl` for cards, `rounded-lg` for buttons/inputs
3. **ALWAYS** use `text-[9px] uppercase` for table headers and badges
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
14. **NEVER** use `hover:bg-black` - use `hover:bg-slate-800` instead
15. **ALWAYS** use `bg-slate-100` for icon containers (not colored backgrounds)

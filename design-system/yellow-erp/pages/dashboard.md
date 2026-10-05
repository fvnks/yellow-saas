# Yellow ERP — Dashboard (ERP) Override

> Overrides MASTER.md for the ERP dashboard interface.

## Layout

- Sidebar: `bg-slate-900 text-white` — collapsible, 240px default
- Header: `bg-white border-b border-slate-200` — sticky top-0 z-10
- Content: `p-6 max-w-7xl mx-auto`

## Metrics Row

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <MetricCard ... />
</div>
```

## Data Tables

### Striped Rows
```tsx
<tbody>
  {rows.map((row, i) => (
    <tr key={row.id} className={`
      border-b border-slate-100
      hover:bg-slate-50/80 transition-colors duration-150
      ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
    `}>
      {row.cells}
    </tr>
  ))}
</tbody>
```

### Compact Padding
- `py-3 px-4` for all cells
- Header: `py-2 px-4 text-label font-medium text-slate-500 uppercase tracking-wider bg-slate-50`
- First column: `font-medium text-slate-900`
- Numeric columns: `text-right tabular-nums font-medium`

### Hover States
- Row hover: `bg-slate-50/80`
- Selected row: `bg-amber-50/50 border-l-2 border-amber-500`
- Clickable rows: `cursor-pointer`

## Badges

| Type | Class |
|------|-------|
| Active | `bg-amber-100 text-amber-700 border border-amber-200` |
| Pending | `bg-slate-100 text-slate-600 border border-slate-200` |
| Inactive | `bg-rose-50 text-rose-600 border border-rose-200` |
| Success | `bg-emerald-100 text-emerald-700 border border-emerald-200` |

## Focus Ring (accessibility)
```tsx
focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white
```

## Buttons

| Type | Class |
|------|-------|
| Primary | `bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 rounded-xl px-6 py-3 font-bold text-body transition-all duration-200 hover:shadow-xl` |
| Secondary | `bg-white border border-slate-200 text-slate-700 rounded-xl px-6 py-3 font-medium text-body hover:bg-slate-50 transition-all duration-200` |
| Ghost | `text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-3 py-2 font-medium text-body transition-all duration-150` |

## Cards
```tsx
<div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover border border-slate-100 transition-shadow duration-200">
  {content}
</div>
```

## Typography Hierarchy

- Page title: `text-h2 font-bold text-slate-900`
- Section heading: `text-h3 font-semibold text-slate-800`
- Metric value: `text-metric font-bold text-slate-900 tabular-nums`
- Data cell: `text-body font-medium text-slate-700`
- Label: `text-label font-medium text-slate-500 uppercase tracking-wider`

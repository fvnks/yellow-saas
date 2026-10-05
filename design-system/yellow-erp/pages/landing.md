# Yellow ERP — Landing Page Override

> Overrides MASTER.md for the marketing landing page.

## Hero Section

```tsx
<section className="relative bg-slate-900 overflow-hidden min-h-[85vh] flex items-center">
  <div className="absolute inset-0">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
    <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-yellow-400/10 via-amber-500/5 to-transparent" />
    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-yellow-400/15 to-transparent rounded-full blur-3xl" />
  </div>
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
    {/* content */}
  </div>
</section>
```

### Hero Typography
- Headline: `text-display text-white font-bold tracking-tight`
- Yellow accent: `bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 bg-clip-text text-transparent`
- Subtitle: `text-xl text-slate-300 font-normal leading-relaxed`

## CTA Buttons

| Type | Class |
|------|-------|
| Primary | `px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-bold rounded-xl shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200` |
| Secondary | `px-8 py-4 text-white font-medium rounded-xl border border-slate-600 hover:border-slate-400 hover:bg-slate-800/50 transition-all duration-200` |

## Pricing Cards

```tsx
<div className={`
  relative rounded-2xl p-8 shadow-xl hover:shadow-2xl 
  transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]
  ${highlighted 
    ? 'bg-gradient-to-b from-amber-500 to-amber-600 border-2 border-amber-400' 
    : 'bg-white border border-slate-200'}
`}>
  {content}
</div>
```

### Highlighted Card
- `bg-gradient-to-b from-amber-500 to-amber-600`
- `border-2 border-amber-400`
- "Más popular" badge: `absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-900 text-amber-400 text-label font-bold rounded-full`

## Conversion Elements

- Cards: `shadow-xl hover:shadow-2xl`
- Hover lift: `hover:scale-[1.03] active:scale-[0.98]`
- Rounded: `rounded-2xl`
- Transitions: `transition-all duration-200` or `duration-300`
- Focus ring: `focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900`

## Feature Sections

```tsx
<div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover 
                border border-slate-100 transition-shadow duration-200">
  {content}
</div>
```

## Typography
- Hero title: `text-display font-bold`
- Section heading: `text-h2 font-bold text-slate-900`
- Card title: `text-h3 font-semibold`
- Body: `text-body font-normal text-slate-600`
- Label: `text-label font-medium text-slate-500 uppercase tracking-wider`

# Yellow ERP — Design System Master

> Global Source of Truth. Page-specific overrides live in `pages/*.md` and take precedence over this file.

## Product Profile

- **Product:** Yellow ERP — SaaS financial/operations platform
- **Stack:** Next.js 14 + React 18 + Tailwind 3.4 + shadcn/ui + Radix + Framer Motion
- **Audience:** Finance teams, accountants, business operators
- **Style:** Trust & Authority + Minimalism (B2B SaaS)

---

## Color Tokens

### Brand — Yellow (controlled usage)

| Token | Value | Usage |
|-------|-------|-------|
| `brand.DEFAULT` | `#F5C518` | Primary brand yellow |
| `brand.hover` | `#D4A017` | Hover state |
| `brand.dark` | `#B8860B` | Pressed/active |
| `brand.ink` | `#8A6100` | Text on light surfaces |
| `brand.ink-hover` | `#6B4700` | Hover text |
| `brand.glow` | `rgba(245, 197, 24, 0.15)` | Shadow glow |

### Neutral Palette (60-30-10 rule)

| Token | Value | Ratio |
|-------|-------|-------|
| `surface.DEFAULT` | `#F8FAFC` | 60% background |
| `surface.card` | `#FFFFFF` | Cards |
| `surface.muted` | `#F1F5F9` | Striped rows |
| `surface.border` | `#E2E8F0` | Dividers |
| `surface.dark` | `#0F172A` | Hero/dark sections |
| `ink.DEFAULT` | `#1E293B` | Primary text |
| `ink.muted` | `#64748B` | Secondary text |
| `ink.faint` | `#94A3B8` | Tertiary text |

### Semantic Colors

| Token | Value |
|-------|-------|
| `success` | `#059669` |
| `warning` | `#D97706` |
| `error` | `#DC2626` |
| `info` | `#2563EB` |

---

## Typography Scale

| Role | Size | Line-height | Weight | Tracking |
|------|------|-------------|--------|----------|
| `display` | 2rem (32px) | 2.5rem | 700 | -0.02em |
| `h2` | 1.5rem (24px) | 2rem | 600 | -0.01em |
| `h3` | 1.125rem (18px) | 1.5rem | 600 | — |
| `metric` | 1.5rem (24px) | 1 | 700 | -0.025em |
| `body` | 0.875rem (14px) | 1.5 | 400 | — |
| `label` | 0.75rem (12px) | 1 | 500 | 0.05em |

**Rules:**
- Headings / metrics → `font-bold` (700)
- Data / labels → `font-medium` (500)
- Body → `font-normal` (400)
- Numbers → `tabular-nums`

---

## Spacing Rhythm

- Base unit: **8px**
- Scale: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`
- Card padding: `p-6` (24px)
- Section gap: `gap-6` (24px)
- Row padding (tables): `py-3 px-4`

---

## Shadows

| Token | Value |
|-------|-------|
| `card` | `0 2px 8px rgba(50,51,56,0.08)` |
| `card-hover` | `0 8px 24px rgba(50,51,56,0.12)` |
| `button` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `xl` | `0 2px 8px rgba(50,51,56,0.08)` |
| `xl-2` | `0 8px 24px rgba(50,51,56,0.12)` |

---

## Border Radius

| Token | Value |
|-------|-------|
| `md` | `calc(var(--radius) - 2px)` |
| `lg` | `var(--radius)` |
| `xl` | `calc(var(--radius) * 1.5)` |
| `2xl` | `calc(var(--radius) * 2)` |

**Standard:** `rounded-2xl` for cards, `rounded-xl` for buttons/elements.

---

## Transitions

| Duration | Usage |
|----------|-------|
| `duration-150` | Data rows, hovers |
| `duration-200` | Buttons, cards |
| `duration-300` | Modals, pages |
| `ease-out` | Entering |
| `ease-in` | Exiting |

---

## Yellow Micro-Interaction Rules (60-30-10)

Use amber/yellow ONLY for:
1. **Focus rings** — `focus:ring-2 focus:ring-amber-500 focus:ring-offset-2`
2. **Active badges** — `bg-amber-100 text-amber-700 border border-amber-200`
3. **Tooltips** — `bg-slate-900 text-amber-400`
4. **Loading lines** — `bg-gradient-to-r from-yellow-400 to-amber-500`
5. **Primary CTA** — `bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25`

Never use yellow for: backgrounds, large surfaces, decorative elements.

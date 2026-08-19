# Landing Page Surface Brief

## Job and audience
Owner/Manager of a Chilean SME, evaluating software to improve operations, arrives via search/ad, seeking a solution that handles inventory, sales, purchases, accounting, payroll with Chilean compliance (SII, AFP, UF). Visitor is decision‑maker, likely comparing options, wants quick understanding of value and trust signals.

## Outcome and proof
Primary action: request a demo (or start free trial). Success: visitor submits demo request form or signs up for trial. Proof: customer logos, testimonial quotes, compliance badges, clear module overview, transparent pricing.

## Selected direction
Visual authority: BankDash Modern Banking Dashboard (see AGENTS.md). Structural/interaction thesis: clean hero with value proposition and CTA above the fold, followed by module grid, features, testimonials, pricing, and final CTA. Sequence: hero → modules → features → testimonials → pricing → footer. Focal moment: headline and primary CTA. Implementation consequence: reuse existing UI components (Button, Card, Badge, Input, etc.) adhering to the design system; leverage Tailwind and Lucide icons.

## Scope and boundaries
Fidelity: production‑ready screen. Breadth: standalone landing page. Interactivity: navigation to auth/login, module detail pages (via links). Named target: apps/web/src/app/page.tsx. What remains untouched: global layout, header, footer components (reuse existing). Anti‑goals: avoid clutter, avoid generic SaaS visuals, do not violate design system colors/typography/layout, do not add unsupported third‑party libraries.

## States and ranges
Content ranges: headline (max 8 words), subheadline (1‑2 sentences), module list (6‑12 items), testimonials (2‑4 quotes), pricing plans (3 tiers). States: initial load, loading (skeleton placeholders), error (none for static page).

## Interaction and layout
Hierarchy: headline > subheadline > primary CTA > module grid > features section > testimonials > pricing section > final CTA/footer. Topology: single‑column vertical scroll; sections full width with inner containers. Responsiveness: on mobile, stack columns (modules become single column), keep touch targets ≥48px. Affordances: Button uses solid fill with hover/active scale; Card uses hover elevation; Input shows focus ring; icons are identifiable. Feedback: button active scale‑[0.98], hover:bg‑primary/90, input focus:ring‑2 focus:border‑primary/30.

## Constraints and open decisions
Platform: web (Next.js 14, React, Tailwind). Delivery: Vercel. Accessibility: WCAG 2.2 AA (contrast, keyboard navigation, ARIA labels). Reusable components: existing Button, Card, Badge, Input, Modal, etc. from @/components/ui. Open decisions: exact headline wording, demo request form fields (name, email, phone, company), inclusion of short explainer video, choice of testimonial order.
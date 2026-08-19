# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
Primary: Owner/Manager of Chilean SME – runs a small or medium-sized business in Chile, manages operations, finances, inventory.
Secondary: Accountant (handles bookkeeping, tax compliance), Operations Staff (handles sales, purchases, inventory tasks).

## Product Purpose
Provide an all-in-one ERP for Chilean SMEs with integrated modules (inventory, sales, purchases, accounting, payroll) tailored to Chilean regulations (SII, AFP, UF) delivered as a secure multi-tenant SaaS platform.

## Positioning
Yellow ERP offers a fully integrated ERP suite with built-in Chilean regulatory compliance (SII, AFP, UF) in a multi-tenant SaaS model, unlike generic ERPs requiring costly localization or separate add-ons.

## Operating Context
Workflows include managing sales orders, purchase invoices, inventory stock, accounting entries, payroll processing, and CRM interactions. Users operate in Chilean business environment, requiring adherence to local invoicing standards, monthly UF adjustments, AFP/ISAPRE deductions, and SII electronic filing. Access is primarily via web browsers on desktop and mobile.

## Capabilities and Constraints
Capabilities: Inventory management (stock, lot/traceability, reorder alerts), sales (quotations, orders, electronic invoicing), purchases (orders, receipts, vendor management), accounting (chart of accounts, automatic entries, financial statements), payroll (AFP, ISAPRE, licenses, liquidations, electronic payslips), CRM (customer activities, pipeline, segmentation), projects (Gantt, Kanban, time tracking), POS (online/offline), multi-tenant isolation, audit logging, notifications (email/in-app).
Constraints: Must enforce Chilean regulatory compliance (SII electronic invoicing, AFP/ISAPRE calculations, UF indexing); every table must include company_id foreign key and Row-Level Security (RLS) policies; UI must adhere to BankDash Modern Banking Dashboard design system (colors, typography, layout, components); data must be isolated per tenant; performance must support real-time dashboards.

## Brand Commitments
Name: Yellow ERP. Visual identity follows the BankDash Modern Banking Dashboard palette (primary #1814F3, background #F5F7FA, etc.) as defined in AGENTS.md.

## Evidence on Hand
Existing codebase: monorepo with Next.js web app, React components, Tailwind CSS, Supabase backend. Design system documented in AGENTS.md. Current landing page at apps/web/src/app/page.tsx showcases modules and features.

## Product Principles
1. Chilean compliance first – all features must adhere to local SII, AFP, UF rules without compromise.
2. Multi-tenant data security – strict company_id isolation and RLS ensure tenants see only their data.
3. Intuitive banking-inspired UI – clean, trustworthy interface inspired by modern banking dashboards.
4. Modular scalability – enable/disable modules per tenant; easy to extend with new functionalities.
5. Offline-first where critical – POS and key workflows tolerate intermittent connectivity and sync on restore.

## Accessibility & Inclusion
Follow WCAG 2.2 AA: ensure keyboard navigable interfaces, sufficient color contrast (minimum 4.5:1 for text), ARIA labels for dynamic components, and responsive design for mobile access.

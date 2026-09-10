-- Migration 094: Add core modules to module_catalog
-- These are the fundamental modules that gate sidebar navigation

INSERT INTO module_catalog (name, label, description, price_monthly, price_yearly, features, category, sort_order, is_active)
VALUES
  ('erp', 'ERP Core', 'Módulo core de planilla y ERP — Inventario, Ventas, Compras, Contabilidad, Proyectos', 0, 0,
   '["Inventario", "Ventas & DTE", "Compras", "Contabilidad", "Proyectos", "RRHH Básico"]', 'general', 0, true),
  ('mi-cuenta', 'Mi Cuenta', 'Gestión de cuenta, facturación SaaS y configuración de empresa', 0, 0,
   '["Perfil de empresa", "Suscripción", "Usuarios", "Configuración"]', 'general', 1, true)
ON CONFLICT (name) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  category = EXCLUDED.category,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- Migration 095: Complete module_catalog with all missing modules + add icon/route columns
-- Fixes: missing columns from 092, adds industry modules, aligns select page module names

-- 1. Add icon and route columns if they don't exist (needed by migration 092)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'module_catalog' AND column_name = 'icon') THEN
    ALTER TABLE module_catalog ADD COLUMN icon TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'module_catalog' AND column_name = 'route') THEN
    ALTER TABLE module_catalog ADD COLUMN route TEXT;
  END IF;
END $$;

-- 2. Industry / vertical modules (used by select page)
INSERT INTO module_catalog (name, label, description, price_monthly, price_yearly, features, category, sort_order, is_active, icon, route)
VALUES
  ('veterinaria', 'Veterinaria & Clínica', 'Ficha clínica multiespecie, agenda, hospitalización, recetas y vacunación', 12990, 129900,
   '["Ficha Clínica Multiespecie", "Agenda & Box de Atención", "Hospitalización & Quirófano", "Recetas & Vacunación", "Laboratorio", "Farmacia"]',
   'veterinaria', 20, true, 'Stethoscope', '/veterinaria'),
  ('auto-talleres', 'Talleres Automotrices', 'Órdenes de trabajo, vehículos, repuestos y técnicos', 9990, 99900,
   '["Órdenes de Trabajo", "Vehículos y Patentes", "Estimados y Repuestos", "Técnicos y Agenda", "Historial por Vehículo"]',
   'talleres', 21, true, 'Car', '/auto-talleres'),
  ('restaurant', 'Restaurante & POS', 'POS Garzón, mesas, comandas, KDS cocina y boleta electrónica', 14990, 149900,
   '["POS Garzón & Mesas", "Kiosco Autoservicio QR", "Pantallas KDS Cocina/Bar", "Boleta Electrónica SII", "Control de Mesas"]',
   'restaurante', 22, true, 'UtensilsCrossed', '/restaurant'),
  ('recetas', 'Recetas & Producción', 'Fórmulas BOM, lotes de producción, stock decimal y costos de insumos', 7990, 79900,
   '["Fórmulas BOM", "Lotes de Producción", "Stock Decimal", "Costos Insumos", "Rendimiento"]',
   'produccion', 23, true, 'FlaskConical', '/recetas')
ON CONFLICT (name) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  category = EXCLUDED.category,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  icon = EXCLUDED.icon,
  route = EXCLUDED.route;

-- 3. Add RLS policies for module_catalog and module_activations
ALTER TABLE module_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_activations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- module_catalog: anyone can read, only service role can write
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'module_catalog_read' AND tablename = 'module_catalog') THEN
    CREATE POLICY module_catalog_read ON module_catalog FOR SELECT USING (true);
  END IF;

  -- module_activations: company members can read their own
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'module_activations_company_read' AND tablename = 'module_activations') THEN
    CREATE POLICY module_activations_company_read ON module_activations
      FOR SELECT USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));
  END IF;
END $$;

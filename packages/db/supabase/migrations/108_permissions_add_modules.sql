-- Migration 108: Add missing permission modules for sidebar alignment
-- Adds 'expenses' and 'work_orders' modules to the permissions catalog

INSERT INTO permissions (module, action, description) VALUES
  ('expenses', 'create', 'Crear gastos'),
  ('expenses', 'read', 'Ver gastos'),
  ('expenses', 'update', 'Editar gastos'),
  ('expenses', 'delete', 'Eliminar gastos'),
  ('work_orders', 'create', 'Crear órdenes de trabajo'),
  ('work_orders', 'read', 'Ver órdenes de trabajo'),
  ('work_orders', 'update', 'Editar órdenes de trabajo'),
  ('work_orders', 'delete', 'Eliminar órdenes de trabajo')
ON CONFLICT DO NOTHING;

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:TxgCpHmrCYHHyxizSiUaUKslqvLnjIkU@tokaido.proxy.rlwy.net:15371/yellow-saas',
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Create demo company
    const companyRes = await client.query(
      `INSERT INTO companies (name, slug, plan, status)
       VALUES ($1, $2, 'professional', 'active')
       RETURNING id`,
      ['Yellow Technologies SpA', 'yellow-tech']
    );
    const companyId = companyRes.rows[0].id;
    console.log('✓ Company created:', companyId);

    // 2. Create admin user
    const passwordHash = await bcrypt.hash('admin123', 12);
    const userRes = await client.query(
      `INSERT INTO profiles (id, company_id, email, password_hash, full_name, role, status)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'owner', 'active')
       RETURNING id`,
      [companyId, 'admin@yellow-erp.cl', passwordHash, 'Admin Yellow']
    );
    const userId = userRes.rows[0].id;
    console.log('✓ Admin user created:', userId);

    // 3. Seed permissions (72 total)
    const modules = [
      'inventory', 'warehouses', 'sales_orders', 'delivery_guides', 'invoices', 'pos',
      'purchase_orders', 'quotations', 'customers', 'suppliers', 'crm',
      'price_lists', 'payroll', 'accounting', 'projects', 'reports', 'audit',
      'settings', 'users', 'roles'
    ];
    const actions = ['create', 'read', 'update', 'delete'];
    
    for (const module of modules) {
      for (const action of actions) {
        const label = action.charAt(0).toUpperCase() + action.slice(1) + ' ' + module.replace('_', ' ');
        await client.query(
          `INSERT INTO permissions (module, action, label) VALUES ($1, $2, $3)
           ON CONFLICT (module, action) DO NOTHING`,
          [module, action, label]
        );
      }
    }
    console.log('✓ Permissions seeded');

    // 4. Create roles
    const adminRoleRes = await client.query(
      `INSERT INTO roles (company_id, name, description, is_system)
       VALUES ($1, 'Administrador', 'Acceso completo al sistema', true)
       RETURNING id`,
      [companyId]
    );
    const adminRoleId = adminRoleRes.rows[0].id;
    
    const managerRoleRes = await client.query(
      `INSERT INTO roles (company_id, name, description, is_system)
       VALUES ($1, 'Gerente', 'Gestión de operaciones', false)
       RETURNING id`,
      [companyId]
    );
    const managerRoleId = managerRoleRes.rows[0].id;

    const salesRoleRes = await client.query(
      `INSERT INTO roles (company_id, name, description, is_system)
       VALUES ($1, 'Ventas', 'Módulo de ventas y clientes', false)
       RETURNING id`,
      [companyId]
    );
    const salesRoleId = salesRoleRes.rows[0].id;

    const warehouseRoleRes = await client.query(
      `INSERT INTO roles (company_id, name, description, is_system)
       VALUES ($1, 'Bodega', 'Gestión de inventario y bodegas', false)
       RETURNING id`,
      [companyId]
    );
    const warehouseRoleId = warehouseRoleRes.rows[0].id;
    console.log('✓ Roles created');

    // 5. Assign all permissions to admin role
    await client.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT $1, id FROM permissions
       ON CONFLICT DO NOTHING`,
      [adminRoleId]
    );

    // 6. Assign specific permissions to manager
    await client.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT $1, id FROM permissions WHERE module IN (
         'inventory', 'warehouses', 'sales_orders', 'delivery_guides', 'invoices',
         'purchase_orders', 'quotations', 'customers', 'suppliers', 'crm',
         'price_lists', 'projects', 'reports'
       )
       ON CONFLICT DO NOTHING`,
      [managerRoleId]
    );

    // 7. Assign sales permissions
    await client.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT $1, id FROM permissions WHERE module IN (
         'sales_orders', 'delivery_guides', 'invoices', 'pos', 'customers', 'crm', 'price_lists'
       )
       ON CONFLICT DO NOTHING`,
      [salesRoleId]
    );

    // 8. Assign warehouse permissions
    await client.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT $1, id FROM permissions WHERE module IN (
         'inventory', 'warehouses', 'stock_movements'
       )
       ON CONFLICT DO NOTHING`,
      [warehouseRoleId]
    );
    console.log('✓ Role permissions assigned');

    // 9. Assign admin role to admin user
    await client.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, adminRoleId]
    );
    console.log('✓ User roles assigned');

    // 10. Seed default inventory categories
    const categories = [
      { name: 'Electrónica', color: '#6366f1', icon: 'Package' },
      { name: 'Oficina', color: '#10b981', icon: 'PenTool' },
      { name: 'Mobiliario', color: '#f59e0b', icon: 'Table' },
      { name: 'Herramientas', color: '#ef4444', icon: 'Hammer' },
    ];
    for (let i = 0; i < categories.length; i++) {
      await client.query(
        `INSERT INTO inventory_categories (company_id, name, color, icon, sort_order) VALUES ($1, $2, $3, $4, $5)`,
        [companyId, categories[i].name, categories[i].color, categories[i].icon, i]
      );
    }
    console.log('✓ Categories seeded');

    // 11. Seed default warehouses
    await client.query(
      `INSERT INTO warehouses (company_id, name, code, address, city, region, is_default, is_active)
       VALUES ($1, 'Bodega Central', 'BC-01', 'Av. Providencia 1234', 'Santiago', 'RM', true, true)`,
      [companyId]
    );
    const wh2 = await client.query(
      `INSERT INTO warehouses (company_id, name, code, address, city, region, is_default, is_active)
       VALUES ($1, 'Bodega Norte', 'BN-02', 'Av. Américo Vespucio 567', 'Huechuraba', 'RM', false, true)
       RETURNING id`,
      [companyId]
    );
    console.log('✓ Warehouses seeded');

    // 12. Seed price lists
    await client.query(
      `INSERT INTO price_lists (company_id, name, description, is_default, currency, adjustment_type, adjustment_value, is_active)
       VALUES ($1, 'Lista General', 'Precios estándar', true, 'CLP', 'fixed', 0, true)`,
      [companyId]
    );
    await client.query(
      `INSERT INTO price_lists (company_id, name, description, is_default, currency, adjustment_type, adjustment_value, is_active)
       VALUES ($1, 'Lista Mayorista', 'Descuento 10%', false, 'CLP', 'percent', -10, true)`,
      [companyId]
    );
    console.log('✓ Price lists seeded');

    // 13. Seed payment methods
    const methods = [
      { name: 'Efectivo', type: 'cash' },
      { name: 'Transferencia', type: 'bank_transfer' },
      { name: 'Tarjeta Crédito', type: 'credit_card' },
      { name: 'Tarjeta Débito', type: 'debit_card' },
    ];
    for (const m of methods) {
      await client.query(
        `INSERT INTO payment_methods (company_id, name, type, is_active) VALUES ($1, $2, $3, true)`,
        [companyId, m.name, m.type]
      );
    }
    console.log('✓ Payment methods seeded');

    // 14. Seed POS terminal
    await client.query(
      `INSERT INTO pos_terminals (company_id, warehouse_id, name, code, is_active)
       VALUES ($1, (SELECT id FROM warehouses WHERE company_id = $1 AND is_default = true LIMIT 1), 'POS Principal', 'POS-01', true)`,
      [companyId]
    );
    console.log('✓ POS terminal seeded');

    await client.query('COMMIT');
    console.log('\n✅ Seed complete!');
    console.log('\nDemo login:');
    console.log('  Email: admin@yellow-erp.cl');
    console.log('  Password: admin123');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed error:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
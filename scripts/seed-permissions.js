const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:TxgCpHmrCYHHyxizSiUaUKslqvLnjIkU@tokaido.proxy.rlwy.net:15371/yellow-saas',
  ssl: { rejectUnauthorized: false },
});

const permissions = [
  // Inventory
  ['inventory', 'create', 'Crear productos'],
  ['inventory', 'read', 'Ver productos'],
  ['inventory', 'update', 'Editar productos'],
  ['inventory', 'delete', 'Eliminar productos'],
  // Warehouses
  ['warehouses', 'create', 'Crear bodegas'],
  ['warehouses', 'read', 'Ver bodegas'],
  ['warehouses', 'update', 'Editar bodegas'],
  ['warehouses', 'delete', 'Eliminar bodegas'],
  // Sales orders
  ['sales_orders', 'create', 'Crear órdenes de venta'],
  ['sales_orders', 'read', 'Ver órdenes de venta'],
  ['sales_orders', 'update', 'Editar órdenes de venta'],
  ['sales_orders', 'delete', 'Eliminar órdenes de venta'],
  // Delivery guides
  ['delivery_guides', 'create', 'Crear guías de despacho'],
  ['delivery_guides', 'read', 'Ver guías de despacho'],
  ['delivery_guides', 'update', 'Editar guías de despacho'],
  ['delivery_guides', 'delete', 'Eliminar guías de despacho'],
  // Invoices
  ['invoices', 'create', 'Crear facturas'],
  ['invoices', 'read', 'Ver facturas'],
  ['invoices', 'update', 'Editar facturas'],
  ['invoices', 'delete', 'Eliminar facturas'],
  // POS
  ['pos', 'create', 'Usar POS'],
  ['pos', 'read', 'Ver POS'],
  ['pos', 'update', 'Editar ventas POS'],
  ['pos', 'delete', 'Eliminar ventas POS'],
  // Purchase orders
  ['purchase_orders', 'create', 'Crear órdenes de compra'],
  ['purchase_orders', 'read', 'Ver órdenes de compra'],
  ['purchase_orders', 'update', 'Editar órdenes de compra'],
  ['purchase_orders', 'delete', 'Eliminar órdenes de compra'],
  // Quotations
  ['quotations', 'create', 'Crear cotizaciones'],
  ['quotations', 'read', 'Ver cotizaciones'],
  ['quotations', 'update', 'Editar cotizaciones'],
  ['quotations', 'delete', 'Eliminar cotizaciones'],
  // Customers
  ['customers', 'create', 'Crear clientes'],
  ['customers', 'read', 'Ver clientes'],
  ['customers', 'update', 'Editar clientes'],
  ['customers', 'delete', 'Eliminar clientes'],
  // Suppliers
  ['suppliers', 'create', 'Crear proveedores'],
  ['suppliers', 'read', 'Ver proveedores'],
  ['suppliers', 'update', 'Editar proveedores'],
  ['suppliers', 'delete', 'Eliminar proveedores'],
  // CRM
  ['crm', 'create', 'Crear leads/oportunidades'],
  ['crm', 'read', 'Ver CRM'],
  ['crm', 'update', 'Editar CRM'],
  ['crm', 'delete', 'Eliminar CRM'],
  // Price lists
  ['price_lists', 'create', 'Crear listas de precio'],
  ['price_lists', 'read', 'Ver listas de precio'],
  ['price_lists', 'update', 'Editar listas de precio'],
  ['price_lists', 'delete', 'Eliminar listas de precio'],
  // Payroll
  ['payroll', 'create', 'Crear nómina'],
  ['payroll', 'read', 'Ver nómina'],
  ['payroll', 'update', 'Editar nómina'],
  ['payroll', 'delete', 'Eliminar nómina'],
  // Accounting
  ['accounting', 'create', 'Crear asientos contables'],
  ['accounting', 'read', 'Ver contabilidad'],
  ['accounting', 'update', 'Editar contabilidad'],
  ['accounting', 'delete', 'Eliminar contabilidad'],
  // Projects
  ['projects', 'create', 'Crear proyectos'],
  ['projects', 'read', 'Ver proyectos'],
  ['projects', 'update', 'Editar proyectos'],
  ['projects', 'delete', 'Eliminar proyectos'],
  // Reports
  ['reports', 'create', 'Crear reportes'],
  ['reports', 'read', 'Ver reportes'],
  ['reports', 'update', 'Editar reportes'],
  ['reports', 'delete', 'Eliminar reportes'],
  // Audit
  ['audit', 'create', 'Crear auditoría'],
  ['audit', 'read', 'Ver auditoría'],
  ['audit', 'update', 'Editar auditoría'],
  ['audit', 'delete', 'Eliminar auditoría'],
  // Settings
  ['settings', 'create', 'Crear configuraciones'],
  ['settings', 'read', 'Ver configuraciones'],
  ['settings', 'update', 'Editar configuraciones'],
  ['settings', 'delete', 'Eliminar configuraciones'],
  // Users
  ['users', 'create', 'Crear usuarios'],
  ['users', 'read', 'Ver usuarios'],
  ['users', 'update', 'Editar usuarios'],
  ['users', 'delete', 'Eliminar usuarios'],
  // Roles
  ['roles', 'create', 'Crear roles'],
  ['roles', 'read', 'Ver roles'],
  ['roles', 'update', 'Editar roles'],
  ['roles', 'delete', 'Eliminar roles'],
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert permissions
    for (const [module, action, label] of permissions) {
      await client.query(
        'INSERT INTO permissions (module, action, label) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [module, action, label]
      );
    }
    console.log('✓ Permissions inserted');
    
    // Insert roles
    const roleResult = await client.query(
      `INSERT INTO roles (name, description, is_system) 
       VALUES 
         ('Admin', 'Acceso completo al sistema', true),
         ('Manager', 'Gestión completa sin configuración', false),
         ('Sales', 'Módulo de ventas y clientes', false),
         ('Warehouse', 'Inventario y bodegas', false),
         ('Accountant', 'Contabilidad y reportes', false),
         ('Viewer', 'Solo lectura', false)
       ON CONFLICT DO NOTHING
       RETURNING id, name`
    );
    console.log(`✓ Roles inserted: ${roleResult.rowCount}`);
    
    // Get all permissions and roles
    const allPerms = await client.query('SELECT id, module, action FROM permissions');
    const allRoles = await client.query('SELECT id, name FROM roles');
    
    // Admin gets all permissions
    const adminRole = allRoles.rows.find(r => r.name === 'Admin');
    if (adminRole) {
      for (const perm of allPerms.rows) {
        await client.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [adminRole.id, perm.id]
        );
      }
      console.log('✓ Admin permissions assigned');
    }
    
    // Manager gets most (except settings, users, roles, audit)
    const managerRole = allRoles.rows.find(r => r.name === 'Manager');
    if (managerRole) {
      const managerPerms = allPerms.rows.filter(p => 
        !['settings', 'users', 'roles', 'audit'].includes(p.module)
      );
      for (const perm of managerPerms) {
        await client.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [managerRole.id, perm.id]
        );
      }
      console.log('✓ Manager permissions assigned');
    }
    
    // Sales gets inventory read, sales, customers, crm
    const salesRole = allRoles.rows.find(r => r.name === 'Sales');
    if (salesRole) {
      const salesPerms = allPerms.rows.filter(p => 
        ['inventory', 'sales_orders', 'delivery_guides', 'invoices', 'pos', 'customers', 'crm', 'price_lists', 'reports'].includes(p.module) &&
        ['read', 'create', 'update'].includes(p.action)
      );
      for (const perm of salesPerms) {
        await client.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [salesRole.id, perm.id]
        );
      }
      console.log('✓ Sales permissions assigned');
    }
    
    // Warehouse gets inventory, warehouses, purchase_orders, stock
    const warehouseRole = allRoles.rows.find(r => r.name === 'Warehouse');
    if (warehouseRole) {
      const whPerms = allPerms.rows.filter(p => 
        ['inventory', 'warehouses', 'purchase_orders', 'stock_movements', 'reports'].includes(p.module)
      );
      for (const perm of whPerms) {
        await client.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [warehouseRole.id, perm.id]
        );
      }
      console.log('✓ Warehouse permissions assigned');
    }
    
    // Accountant gets accounting, reports, invoices
    const accountantRole = allRoles.rows.find(r => r.name === 'Accountant');
    if (accountantRole) {
      const accPerms = allPerms.rows.filter(p => 
        ['accounting', 'reports', 'invoices', 'purchase_orders', 'customers', 'suppliers'].includes(p.module)
      );
      for (const perm of accPerms) {
        await client.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [accountantRole.id, perm.id]
        );
      }
      console.log('✓ Accountant permissions assigned');
    }
    
    // Viewer gets read-only on most
    const viewerRole = allRoles.rows.find(r => r.name === 'Viewer');
    if (viewerRole) {
      const viewerPerms = allPerms.rows.filter(p => p.action === 'read');
      for (const perm of viewerPerms) {
        await client.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [viewerRole.id, perm.id]
        );
      }
      console.log('✓ Viewer permissions assigned');
    }
    
    await client.query('COMMIT');
    console.log('\n✅ Seed complete!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
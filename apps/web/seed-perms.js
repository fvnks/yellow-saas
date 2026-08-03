const { Pool } = require('pg');
const p = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const modules = ['inventario', 'ventas', 'compras', 'finanzas', 'herramientas', 'recetas', 'costos', 'rrhh', 'sistema'];
    const actions = ['create', 'read', 'update', 'delete'];

    for (const mod of modules) {
      for (const act of actions) {
        await p.query(
          `INSERT INTO permissions (module, action, label, description) VALUES ($1, $2, $3, $4) ON CONFLICT (module, action) DO NOTHING`,
          [mod, act, `${act}_${mod}`, `${act} ${mod}`]
        );
      }
    }
    console.log('Seeded new general module permissions');

    // Assign all new permissions to Admin role
    const adminRole = await p.query(`SELECT id FROM roles WHERE name = 'Admin' AND is_system = true LIMIT 1`);
    if (adminRole.rows.length > 0) {
      const roleId = adminRole.rows[0].id;
      await p.query(`INSERT INTO role_permissions (role_id, permission_id) SELECT $1, id FROM permissions ON CONFLICT DO NOTHING`, [roleId]);
      console.log('Assigned all permissions to Admin role');
    }

    // Count
    const count = await p.query('SELECT COUNT(*) FROM permissions');
    console.log('Total permissions:', count.rows[0].count);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    p.end();
  }
}

run();

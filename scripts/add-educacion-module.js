const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../apps/web/.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
  });
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false, connectionTimeoutMillis: 15000 });

const MODULO = {
  name: 'educacion',
  label: 'Educación & Colegios',
  description:
    'Estudiantes, cursos, asistencia, calificaciones, pensiones, comunicados y portal del apoderado',
  price_monthly: 14990,
  price_yearly: 149900,
  features: [
    'Asistencia y conducta',
    'Calificaciones y libro digital',
    'Pensiones y cartolas',
    'Portal del apoderado',
  ],
  category: 'educacion',
  is_active: true,
  sort_order: 10,
};

(async () => {
  try {
    const existing = await pool.query(`SELECT id FROM module_catalog WHERE name = $1`, [MODULO.name]);
    if (existing.rows.length > 0) {
      const r = await pool.query(
        `UPDATE module_catalog
            SET label = $2, description = $3, price_monthly = $4, price_yearly = $5,
                features = $6::jsonb, category = $7, is_active = true, sort_order = $8
          WHERE name = $1
          RETURNING name, label, is_active, sort_order`,
        [MODULO.name, MODULO.label, MODULO.description, MODULO.price_monthly, MODULO.price_yearly,
         JSON.stringify(MODULO.features), MODULO.category, MODULO.sort_order]
      );
      console.log('ACTUALIZADO:', JSON.stringify(r.rows[0]));
    } else {
      const r = await pool.query(
        `INSERT INTO module_catalog (name, label, description, price_monthly, price_yearly, features, category, is_active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9)
         RETURNING name, label, is_active, sort_order`,
        [MODULO.name, MODULO.label, MODULO.description, MODULO.price_monthly, MODULO.price_yearly,
         JSON.stringify(MODULO.features), MODULO.category, MODULO.is_active, MODULO.sort_order]
      );
      console.log('INSERTADO:', JSON.stringify(r.rows[0]));
    }

    const all = await pool.query(`SELECT name FROM module_catalog WHERE is_active = true ORDER BY sort_order`);
    console.log('\ncatalogo activo (' + all.rows.length + '):', all.rows.map((r) => r.name).join(', '));

    // Tarjetas del selector que no existen en el catalogo (boton Activar daria 404)
    const cards = ['erp', 'hr_premium', 'projects_pro', 'recetas', 'condominiums', 'restaurant', 'veterinaria', 'auto-talleres', 'educacion'];
    const missing = cards.filter((c) => !all.rows.some((r) => r.name === c));
    console.log('tarjetas SIN fila en catalogo:', missing.length ? missing.join(', ') : 'ninguna');

    // Activar para las empresas que ya usan el modulo educativo
    const targets = await pool.query(
      `SELECT c.id, c.name FROM companies c
        WHERE EXISTS (SELECT 1 FROM module_activations ma WHERE ma.company_id = c.id AND ma.module_name = 'recetas')
        ORDER BY c.name`
    );
    for (const co of targets.rows) {
      const a = await pool.query(
        `INSERT INTO module_activations (company_id, module_name, status, activated_at, notes)
         VALUES ($1, $2, 'active', now(), 'Activado por script add-educacion-module')
         ON CONFLICT (company_id, module_name)
           DO UPDATE SET status = 'active', activated_at = now(), cancelled_at = NULL
         RETURNING module_name, status`,
        [co.id, MODULO.name]
      );
      console.log('activado en ' + co.name + ': ' + JSON.stringify(a.rows[0]));
    }
    if (targets.rows.length === 0) console.log('sin empresas con modulos activos; se activara desde el selector');
  } catch (e) {
    console.error('ERROR:', e.code, e.message);
    console.error(e.stack);
  } finally {
    await pool.end().catch(() => {});
    process.exit(0);
  }
})();

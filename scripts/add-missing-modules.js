// Upsert de filas en module_catalog para tarjetas del selector que faltan.
// Sin fila en el catalogo, el modal "Activar" de /select devuelve 404
// (ver src/app/api/companies/[id]/modules/activate/route.ts).
// Lee DATABASE_URL de apps/web/.env.local (nunca hardcodea credenciales).
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

if (!process.env.DATABASE_URL) {
  console.error('FALTA DATABASE_URL en apps/web/.env.local');
  process.exit(1);
}

const MODULES = [
  {
    name: 'restaurant',
    label: 'Restaurante & POS',
    description: 'POS de salón, comandas, KDS de cocina, kiosco de autoservicio y boleta electrónica SII',
    price_monthly: 14990,
    price_yearly: 149900,
    features: ['POS Garzón & Mesas', 'Kiosco Autoservicio QR', 'Pantallas KDS Cocina/Bar', 'Boleta Electrónica SII'],
    category: 'general',
    sort_order: 11,
  },
  {
    name: 'veterinaria',
    label: 'Veterinaria & Clínica',
    description: 'Ficha clínica multiespecie, agenda de box, hospitalización, recetas y vacunación',
    price_monthly: 14990,
    price_yearly: 149900,
    features: ['Ficha Clínica Multiespecie', 'Agenda & Box de Atención', 'Hospitalización & Quirófano', 'Recetas & Vacunación'],
    category: 'general',
    sort_order: 12,
  },
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false, connectionTimeoutMillis: 15000 });

(async () => {
  try {
    for (const m of MODULES) {
      const params = [m.name, m.label, m.description, m.price_monthly, m.price_yearly,
        JSON.stringify(m.features), m.category, m.sort_order];
      const { rows } = await pool.query(
        `INSERT INTO module_catalog (name, label, description, price_monthly, price_yearly, features, category, is_active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, true, $8)
         ON CONFLICT (name) DO UPDATE
           SET label = EXCLUDED.label, description = EXCLUDED.description,
               price_monthly = EXCLUDED.price_monthly, price_yearly = EXCLUDED.price_yearly,
               features = EXCLUDED.features, category = EXCLUDED.category,
               is_active = true, sort_order = EXCLUDED.sort_order
         RETURNING name, label, is_active, sort_order`,
        params
      );
      console.log('OK ' + JSON.stringify(rows[0]));
    }

    const all = await pool.query(`SELECT name FROM module_catalog WHERE is_active = true`);
    console.log('\ncatalogo activo (' + all.rows.length + '): ' + all.rows.map((r) => r.name).join(', '));

    // Tarjetas de /select que siguen sin fila activa
    const CARDS = ['erp', 'hr_premium', 'projects_pro', 'recetas', 'condominiums', 'restaurant', 'veterinaria', 'auto-talleres', 'educacion'];
    const missing = CARDS.filter((c) => !all.rows.some((r) => r.name === c));
    console.log('tarjetas SIN fila en catalogo: ' + (missing.length ? missing.join(', ') : 'ninguna'));
  } catch (e) {
    console.error('ERROR:', e.code, e.message);
    process.exitCode = 1;
  } finally {
    await pool.end().catch(() => {});
    process.exit();
  }
})();

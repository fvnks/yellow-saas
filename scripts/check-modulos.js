// Diagnóstico: catálogo de módulos vs tarjetas del selector (/select).
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

// Tarjetas definidas en src/app/[locale]/(public)/select/page.tsx
const CARDS = ['erp', 'hr_premium', 'projects_pro', 'recetas', 'condominiums', 'restaurant', 'veterinaria', 'auto-talleres', 'educacion', 'mi-cuenta', 'ayuda'];

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false, connectionTimeoutMillis: 15000 });

(async () => {
  try {
    const { rows } = await pool.query(
      `SELECT name, label, is_active, sort_order FROM module_catalog ORDER BY sort_order, name`
    );
    console.log('=== module_catalog (' + rows.length + ') ===');
    rows.forEach((r) =>
      console.log('  ' + String(r.name).padEnd(18) + ' active=' + String(r.is_active).padEnd(5) +
        ' sort=' + String(r.sort_order).padEnd(3) + ' ' + r.label)
    );

    const missing = CARDS.filter((c) => !rows.some((r) => r.name === c && r.is_active));
    console.log('\ntarjetas SIN fila activa en catalogo (Activar devolveria 404):');
    console.log('  ' + (missing.length ? missing.join(', ') : 'ninguna'));

    const acts = await pool.query(
      `SELECT c.name AS company, ma.module_name, ma.status
         FROM module_activations ma
         LEFT JOIN companies c ON c.id = ma.company_id
        ORDER BY c.name, ma.module_name`
    );
    console.log('\n=== module_activations (' + acts.rows.length + ') ===');
    acts.rows.forEach((r) => console.log('  ' + String(r.company).padEnd(28) + r.module_name.padEnd(18) + r.status));
  } catch (e) {
    console.error('ERROR:', e.code, e.message);
  } finally {
    await pool.end().catch(() => {});
    process.exit(0);
  }
})();

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env.local file (nunca hardcodea credenciales)
const envPath = path.join(__dirname, '../apps/web/.env.local');
if (fs.existsSync(envPath)) {
  const envVars = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((acc, line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) acc[match[1].trim()] = match[2].trim();
    return acc;
  }, {});
  if (envVars.DATABASE_URL) process.env.DATABASE_URL = envVars.DATABASE_URL;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('No DATABASE_URL found in .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL === 'false' ? false : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false),
  connectionTimeoutMillis: 15000,
});

const MIGRATION = '125_portal_hijos_unicos.sql';

async function runMigration() {
  const migrationFile = path.join(__dirname, '../packages/db/supabase/migrations', MIGRATION);

  if (!fs.existsSync(migrationFile)) {
    console.error('Migration file not found:', migrationFile);
    process.exit(1);
  }

  // Preflight: el indice unico falla si ya hay un estudiante con dos apoderados.
  const dups = await pool.query(`
    SELECT e.rut, e.nombres, e.apellido_paterno, count(*) AS total
    FROM educacion_estudiante_apoderado ea
    JOIN educacion_estudiantes e ON e.id = ea.estudiante_id
    GROUP BY e.rut, e.nombres, e.apellido_paterno
    HAVING count(*) > 1
  `);
  if (dups.rows.length > 0) {
    console.error('BLOQUEADO: hay estudiantes con mas de un apoderado:');
    dups.rows.forEach((r) => console.error('  ' + r.rut + ' ' + r.nombres + ' ' + r.apellido_paterno + ' -> ' + r.total));
    console.error('Resuelve esos duplicados antes de aplicar la migracion.');
    await pool.end();
    process.exit(1);
  }

  console.log('Running migration ' + MIGRATION + '...');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  try {
    await pool.query(sql);
    console.log('Migration 125 completed successfully');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }

  try {
    const idx = await pool.query(`
      SELECT indexname FROM pg_indexes
      WHERE indexname IN ('uq_educacion_estudiante_apoderado_estudiante', 'uq_educacion_apoderados_email')
      ORDER BY indexname
    `);
    console.log('\nIndices creados:', idx.rows.map((r) => r.indexname).join(', ') || 'ninguno');

    const apojos = await pool.query(`
      SELECT count(*) AS apoderados,
             count(password) AS con_contrasena,
             (SELECT count(*) FROM educacion_estudiante_apoderado) AS vinculos
      FROM educacion_apoderados
    `);
    const a = apojos.rows[0];
    console.log('apoderados=' + a.apoderados + ' con_contrasena=' + a.con_contrasena + ' vinculos=' + a.vinculos);
  } catch (err) {
    console.error('Verificacion error:', err.message);
  }

  await pool.end();
  console.log('\nDone.');
}

runMigration();

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

const MIGRATION = '124_company_type_vertical.sql';

async function runMigration() {
  const migrationFile = path.join(__dirname, '../packages/db/supabase/migrations', MIGRATION);

  if (!fs.existsSync(migrationFile)) {
    console.error('Migration file not found:', migrationFile);
    process.exit(1);
  }

  console.log('Running migration ' + MIGRATION + '...');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  try {
    await pool.query(sql);
    console.log('Migration 124 completed successfully');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }

  try {
    const cols = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns
        WHERE table_name = 'companies' AND column_name IN ('company_type', 'vertical')
        ORDER BY column_name`
    );
    console.log('\nColumnas en companies:', cols.rows.map((r) => r.column_name + ' (' + r.data_type + ')').join(', '));

    const counts = await pool.query(
      `SELECT company_type, vertical, COUNT(*) AS n
         FROM companies GROUP BY company_type, vertical ORDER BY company_type, vertical`
    );
    console.log('\nClasificacion de empresas:');
    counts.rows.forEach((r) =>
      console.log('  ' + String(r.company_type).padEnd(10) + String(r.vertical).padEnd(14) + r.n)
    );
  } catch (err) {
    console.error('Verificacion error:', err.message);
  }

  await pool.end();
  console.log('\nDone.');
}

runMigration();

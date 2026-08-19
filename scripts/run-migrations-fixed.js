const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env.local file to get DATABASE_URL
const envPath = path.join(__dirname, '../apps/web/.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = envContent.split('\n').reduce((acc, line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) acc[match[1].trim()] = match[2].trim();
    return acc;
  }, {});

  if (envVars.DATABASE_URL) {
    process.env.DATABASE_URL = envVars.DATABASE_URL;
    console.log('Loaded DATABASE_URL from .env.local');
  }

  if (envVars.JWT_SECRET) {
    process.env.JWT_SECRET = envVars.JWT_SECRET;
  }
}

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  connectionString = 'postgresql://postgres:postgres@localhost:5432/yellow-saas';
  console.log('No DATABASE_URL provided. Using local PostgreSQL fallback.');
}

console.log('Using connection:', connectionString.replace(/:[^:]+@/, ':******@'));

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runMigrations() {
  const pool2 = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const migrationsDir = path.join(__dirname, '../packages/db/supabase/migrations');
  const orderedFiles = [
    '001_initial_schema_postgres.sql',
    '002_quotations.sql',
    '003_warehouse_layout.sql',
    '004_roles_permissions.sql',
  ];

  console.log('Running ' + orderedFiles.length + ' migrations:');

  for (const file of orderedFiles) {
    const filePath = path.join(migrationsDir, file);
    if (!fs.existsSync(filePath)) {
      console.log('⚠ File not found: ' + file);
      continue;
    }
    console.log('Running: ' + file);
    const sql = fs.readFileSync(filePath, 'utf8');
    try {
      await pool2.query(sql);
      console.log('  ✓ Done');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('  ⚠ Already exists, skipping');
      } else {
        console.error('  ✗ Error: ' + err.message);
      }
    }
  }

  await pool2.end();
  console.log('All migrations complete.');
}

runMigrations().catch(console.error);
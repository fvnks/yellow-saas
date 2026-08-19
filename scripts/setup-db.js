const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    console.log('Using DATABASE_URL:', connectionString.replace(/:[^:]+@/, ':******@'));
    await runMigrations(connectionString);
  } else {
    console.log('No DATABASE_URL provided. Skipping database setup.\n');
    console.log('You can set DATABASE_URL or run migrations locally.');
  }
}

async function runMigrations(connectionString) {
  const pool = new Pool({
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
      await pool.query(sql);
      console.log('  ✓ Done');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('  ⚠ Already exists, skipping');
      } else {
        console.error('  ✗ Error: ' + err.message);
      }
    }
  }

  await pool.end();
  console.log('All migrations complete.');
}

setupDatabase().catch(console.error);
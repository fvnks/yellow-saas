const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env.local file
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
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('No DATABASE_URL found in .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  const migrationFile = path.join(__dirname, '../packages/db/supabase/migrations/057_purchase_categories_payment_methods.sql');

  if (!fs.existsSync(migrationFile)) {
    console.error('Migration file not found:', migrationFile);
    process.exit(1);
  }

  console.log('Running migration 057_purchase_categories_payment_methods.sql...');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  try {
    await pool.query(sql);
    console.log('✓ Migration 057 completed successfully');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('⚠ Tables/columns already exist, skipping');
    } else {
      console.error('✗ Error:', err.message);
      process.exit(1);
    }
  }

  await pool.end();
  console.log('Done.');
}

runMigration();

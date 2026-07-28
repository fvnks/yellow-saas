const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../apps/web/.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = envContent.split('\n').reduce((acc, line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) acc[match[1].trim()] = match[2].trim();
    return acc;
  }, {});
  if (envVars.DATABASE_URL) process.env.DATABASE_URL = envVars.DATABASE_URL;
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function runMigration() {
  const migrationFile = path.join(__dirname, '../packages/db/supabase/migrations/058_fix_invoice_cost_center.sql');
  if (!fs.existsSync(migrationFile)) {
    console.error('Migration file not found:', migrationFile);
    process.exit(1);
  }

  console.log('Running migration 058_fix_invoice_cost_center.sql...');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  try {
    await pool.query(sql);
    console.log('✓ Migration 058 completed successfully');
  } catch (err) {
    if (err.message.includes('already exists') || err.message.includes('does not exist')) {
      console.log('⚠ Column already handled, skipping');
    } else {
      console.error('✗ Error:', err.message);
      process.exit(1);
    }
  }

  await pool.end();
  console.log('Done.');
}

runMigration();

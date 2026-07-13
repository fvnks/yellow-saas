const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load DATABASE_URL from .env.local
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
    console.log('✓ Loaded DATABASE_URL from .env.local');
    console.log('  Using:', envVars.DATABASE_URL.replace(/:[^:]+@/, ':******@'));
  } else {
    console.log('⚠ No DATABASE_URL found in .env.local');
  }

  if (envVars.JWT_SECRET) {
    process.env.JWT_SECRET = envVars.JWT_SECRET;
  }
} else {
  console.log('⚠ .env.local not found');
}

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  if (process.env.RAILWAY_SERVICE_HOST) {
    const password = process.env.RAILWAY_SERVICE_TOKEN || process.env.RAILWAY_PASSWORD || 'default';
    connectionString = `postgresql://postgres:${password}@${process.env.RAILWAY_SERVICE_HOST}:${process.env.RAILWAY_SERVICE_PORT || '5432'}/${process.env.RAILWAY_SERVICE_NAME || 'railway'}`;
    console.log('✓ Using Railway PostgreSQL:', process.env.RAILWAY_SERVICE_HOST);
  } else {
    console.error('❌ No DATABASE_URL available. Please set environment variables');
    console.log('\nTo set DATABASE_URL locally:');
    console.log('  export DATABASE_URL=postgresql://postgres:aXUTptOaTaDdrzsqWQQQjzIGMwMeRUiW@tokaido.proxy.rlwy.net:21360/railway');
    process.exit(1);
  }
}

console.log('\nRunning migrations to Railway PostgreSQL...\n');

async function runMigrations() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const migrationsDir = path.join(__dirname, '../packages/db/supabase/migrations');
  const orderedFiles = [
    '001_initial_schema_postgres.sql',
    '002_quotations.sql',
    '003_warehouse_layout.sql',
    '004_roles_permissions.sql',
  ];

  console.log('Running ' + orderedFiles.length + ' migrations:');

  let successCount = 0;
  let errorCount = 0;

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
      successCount++;
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('  ⚠ Already exists, skipping');
        successCount++;
      } else {
        console.error('  ✗ Error: ' + err.message);
        errorCount++;
      }
    }
  }

  await pool.end();
  console.log('\n✅ Migration complete!');
  console.log('Success:', successCount, 'migrations');
  if (errorCount > 0) {
    console.log('Errors:', errorCount, 'migrations');
    process.exit(1);
  }
}

runMigrations().catch(console.error);
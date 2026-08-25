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
}

let connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/yellow-saas';
console.log('Connecting to PostgreSQL:', connectionString.replace(/:[^:]+@/, ':******@'));

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function run() {
  const filePath = path.join(__dirname, '../packages/db/supabase/migrations/072_condominiums_module.sql');
  console.log('Reading migration file:', filePath);
  const sql = fs.readFileSync(filePath, 'utf8');
  try {
    await pool.query(sql);
    console.log('✅ Migration 072_condominiums_module.sql applied successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

run();

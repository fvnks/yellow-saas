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

async function main() {
  const tables = ['purchase_credit_notes', 'purchase_debit_notes', 'purchase_returns', 'purchase_categories'];
  for (const t of tables) {
    const { rows } = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='${t}' ORDER BY ordinal_position`);
    console.log(`\n=== ${t} ===`);
    if (rows.length === 0) { console.log('  DOES NOT EXIST'); }
    else { rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`)); }
  }
  await pool.end();
}

main();

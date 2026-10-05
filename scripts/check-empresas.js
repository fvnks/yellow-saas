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

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false, connectionTimeoutMillis: 15000 });

(async () => {
  try {
    for (const t of ['user_roles', 'roles', 'profiles']) {
      const c = await pool.query(
        `SELECT column_name, data_type, is_nullable FROM information_schema.columns
          WHERE table_name = $1 ORDER BY ordinal_position`, [t]);
      console.log('=== ' + t + ' ===');
      c.rows.forEach((r) => console.log('  ' + r.column_name.padEnd(18) + r.data_type.padEnd(16) + ' null=' + r.is_nullable));

      const cons = await pool.query(
        `SELECT conname, pg_get_constraintdef(oid) AS def FROM pg_constraint
          WHERE conrelid = $1::regclass AND contype IN ('p','u','f')`, [t]);
      cons.rows.forEach((r) => console.log('    ' + r.conname + ': ' + r.def));
      console.log('');
    }

    const sample = await pool.query(`SELECT * FROM user_roles LIMIT 5`);
    console.log('=== user_roles filas (' + sample.rows.length + ') ===');
    sample.rows.forEach((r) => console.log('  ' + JSON.stringify(r)));
  } catch (e) {
    console.error('ERROR:', e.code, e.message);
  } finally {
    await pool.end().catch(() => {});
    process.exit(0);
  }
})();

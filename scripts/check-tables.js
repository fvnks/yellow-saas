const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:TxgCpHmrCYHHyxizSiUaUKslqvLnjIkU@tokaido.proxy.rlwy.net:15371/yellow-saas',
  ssl: { rejectUnauthorized: false },
});
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name").then(r => {
  console.log('Tables:', r.rows.length);
  r.rows.forEach(row => console.log(' -', row.table_name));
  pool.end();
}).catch(console.error);
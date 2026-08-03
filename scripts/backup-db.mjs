import pg from 'pg';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const SSL = process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false };
const OUT_DIR = process.env.BACKUP_DIR || './backups';

const client = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: SSL,
});

async function backup() {
  await client.connect();
  console.log('Connected to database');

  const tablesResult = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  const tables = tablesResult.rows.map(r => r.table_name);
  console.log('Found', tables.length, 'tables');

  let sql = '-- Yellow ERP Database Backup\n';
  sql += `-- Generated: ${new Date().toISOString()}\n\n`;

  for (const table of tables) {
    const genCols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
        AND is_generated = 'ALWAYS'
    `, [table]);
    const generatedSet = new Set(genCols.rows.map(r => r.column_name));

    const dataResult = await client.query(`SELECT * FROM "${table}"`);

    if (dataResult.rows.length > 0) {
      const colKeys = Object.keys(dataResult.rows[0]).filter(c => !generatedSet.has(c));
      const columns = colKeys.join(', ');
      sql += `-- Table: ${table} (${dataResult.rows.length} rows)\n`;
      sql += `DELETE FROM "${table}";\n`;

      for (const row of dataResult.rows) {
        const values = colKeys.map(c => {
          const v = row[c];
          if (v === null) return 'NULL';
          if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
          if (v instanceof Date) return `'${v.toISOString()}'`;
          if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
          return v;
        }).join(', ');
        sql += `INSERT INTO "${table}" (${columns}) VALUES (${values});\n`;
      }
      sql += '\n';
    }
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outFile = path.join(OUT_DIR, `yellow-erp-backup-${timestamp}.sql`);
  fs.writeFileSync(outFile, sql);
  console.log('Backup saved to', outFile);
  console.log('Size:', fs.statSync(outFile).size, 'bytes');

  const MAX_KEEP = parseInt(process.env.BACKUP_KEEP || '14', 10);
  const backups = fs.readdirSync(OUT_DIR)
    .filter(f => f.startsWith('yellow-erp-backup-') && f.endsWith('.sql'))
    .sort();
  while (backups.length > MAX_KEEP) {
    const old = backups.shift();
    fs.unlinkSync(path.join(OUT_DIR, old));
    console.log('Removed old backup:', old);
  }

  await client.end();
}

backup().catch(e => { console.error(e); process.exit(1); });

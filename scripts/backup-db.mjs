import pg from 'pg';
import fs from 'fs';
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
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
  
  let sql = '-- Railway Database Backup\n';
  sql += `-- Generated: ${new Date().toISOString()}\n\n`;
  
  for (const table of tables) {
    const dataResult = await client.query(`SELECT * FROM "${table}"`);
    
    if (dataResult.rows.length > 0) {
      const columns = Object.keys(dataResult.rows[0]).join(', ');
      sql += `-- Table: ${table} (${dataResult.rows.length} rows)\n`;
      sql += `DELETE FROM "${table}";\n`;
      
      for (const row of dataResult.rows) {
        const values = Object.values(row).map(v => {
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
  
  fs.writeFileSync('railway_full_backup.sql', sql);
  console.log('Backup saved to railway_full_backup.sql');
  console.log('Size:', fs.statSync('railway_full_backup.sql').size, 'bytes');
  
  await client.end();
}

backup().catch(e => { console.error(e); process.exit(1); });
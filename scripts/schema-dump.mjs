import pg from 'pg';
import fs from 'fs';
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function dump() {
  await client.connect();
  console.log('Connected to database');

  let sql = '-- Schema dump generated from source database\n';
  sql += `-- Generated: ${new Date().toISOString()}\n\n`;

  const ext = await client.query(`
    SELECT extname FROM pg_extension
    ORDER BY extname
  `);
  for (const row of ext.rows) {
    sql += `CREATE EXTENSION IF NOT EXISTS "${row.extname}";\n`;
  }
  sql += '\n';

  const enums = await client.query(`
    SELECT t.typname, e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    ORDER BY t.typname, e.enumsortorder
  `);
  const enumLabels = {};
  for (const row of enums.rows) {
    (enumLabels[row.typname] = enumLabels[row.typname] || []).push(row.enumlabel);
  }
  for (const [name, labels] of Object.entries(enumLabels)) {
    sql += `CREATE TYPE "${name}" AS ENUM (${labels.map(l => `'${l}'`).join(', ')});\n`;
  }
  if (Object.keys(enumLabels).length) sql += '\n';

  const sequences = await client.query(`
    SELECT c.relname AS seqname, s.seqstart
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN pg_sequence s ON s.seqrelid = c.oid
    WHERE n.nspname = 'public' AND c.relkind = 'S'
    ORDER BY c.relname
  `);
  for (const row of sequences.rows) {
    sql += `CREATE SEQUENCE IF NOT EXISTS "${row.seqname}" START WITH ${row.seqstart};\n`;
  }
  if (sequences.rows.length) sql += '\n';

  const tables = await client.query(`
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
    ORDER BY c.relname
  `);

  const allCols = await client.query(`
    SELECT c.relname AS table_name,
           a.attname AS column_name,
           format_type(a.atttypid, a.atttypmod) AS data_type,
           a.attnotnull AS not_null,
           pg_get_expr(d.adbin, d.adrelid) AS default_expr,
           a.attgenerated,
           a.attnum
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
      AND a.attnum > 0 AND NOT a.attisdropped
    ORDER BY c.relname, a.attnum
  `);

  const colsByTable = {};
  for (const col of allCols.rows) {
    (colsByTable[col.table_name] = colsByTable[col.table_name] || []).push(col);
  }

  for (const t of tables.rows) {
    const colDefs = (colsByTable[t.table_name] || []).map(col => {
      let def = `"${col.column_name}" ${col.data_type}`;
      if (col.attgenerated === 's') {
        def += ` GENERATED ALWAYS AS (${col.default_expr}) STORED`;
      } else {
        if (col.default_expr) def += ` DEFAULT ${col.default_expr}`;
        if (col.not_null) def += ' NOT NULL';
      }
      return def;
    });

    sql += `CREATE TABLE "${t.table_name}" (\n  ${colDefs.join(',\n  ')}\n);\n\n`;
  }

  const constraints = await client.query(`
    SELECT conrelid::regclass::text AS table_name, conname, contype,
           pg_get_constraintdef(oid) AS def
    FROM pg_constraint
    WHERE connamespace = 'public'::regnamespace
      AND contype IN ('p', 'u', 'f', 'c')
      AND conrelid != 0
    ORDER BY conrelid::regclass::text,
      CASE contype WHEN 'p' THEN 1 WHEN 'u' THEN 2 WHEN 'f' THEN 3 ELSE 4 END,
      conname
  `);

  for (const row of constraints.rows) {
    const tableName = row.table_name.replace(/^public\./, '');
    if (row.contype !== 'f') {
      sql += `ALTER TABLE "${tableName}" ADD CONSTRAINT "${row.conname}" ${row.def};\n`;
    }
  }
  sql += '\n';

  for (const row of constraints.rows) {
    const tableName = row.table_name.replace(/^public\./, '');
    if (row.contype === 'f') {
      sql += `ALTER TABLE "${tableName}" ADD CONSTRAINT "${row.conname}" ${row.def};\n`;
    }
  }
  sql += '\n';

  const indexes = await client.query(`
    SELECT i.relname AS index_name, tab.relname AS table_name,
           pg_get_indexdef(idx.indexrelid) AS def,
           idx.indisprimary, idx.indisunique
    FROM pg_index idx
    JOIN pg_class i ON i.oid = idx.indexrelid
    JOIN pg_class tab ON tab.oid = idx.indrelid
    JOIN pg_namespace n ON n.oid = tab.relnamespace
    WHERE n.nspname = 'public' AND tab.relkind IN ('r', 'p')
    ORDER BY tab.relname, i.relname
  `);

  for (const row of indexes.rows) {
    if (row.indisprimary) continue;
    sql += `${row.def};\n`;
  }
  sql += '\n';

  fs.writeFileSync(process.argv[2] || 'schema_dump.sql', sql);
  console.log('Schema saved. Size:', fs.statSync(process.argv[2] || 'schema_dump.sql').size, 'bytes');

  await client.end();
}

dump().catch(e => { console.error(e); process.exit(1); });

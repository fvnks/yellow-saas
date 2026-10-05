const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Carga DATABASE_URL desde apps/web/.env.local (patrón del resto del repo)
const envPath = path.join(__dirname, '../apps/web/.env.local');
if (fs.existsSync(envPath)) {
  const envVars = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) acc[match[1].trim()] = match[2].trim();
    return acc;
  }, {});
  if (envVars.DATABASE_URL) process.env.DATABASE_URL = envVars.DATABASE_URL;
}

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL no está definida (apps/web/.env.local).');
  process.exit(1);
}

const target = new URL(process.env.DATABASE_URL);

console.log('=== Migraciones del Módulo Educativo ===\n');
console.log('Configuración:');
console.log(`  Host: ${target.hostname}`);
console.log(`  Port: ${target.port || '5432'}`);
console.log(`  Database: ${target.pathname.replace('/', '')}`);
console.log('');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  connectionTimeoutMillis: 15000,
});

// Lista de migraciones del módulo educativo
const migrations = [
  '110_educacion_estudiantes.sql',
  '111_educacion_apoderados.sql',
  '112_educacion_cursos.sql',
  '113_educacion_asignaturas.sql',
  '114_educacion_asistencia.sql',
  '115_educacion_calificaciones.sql',
  '116_educacion_comunicados.sql',
  '117_educacion_pensiones.sql',
  '118_educacion_eventos.sql',
  '119_educacion_biblioteca.sql',
  '120_educacion_admision.sql',
  '121_educacion_transporte.sql',
  '122_educacion_subvenciones.sql',
];

async function runMigrations() {
  let client;
  
  try {
    console.log('Conectando a PostgreSQL en el VPS...\n');
    client = await pool.connect();
    console.log('✓ Conexión exitosa!\n');
    
    // Verificar versión de PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('PostgreSQL:', versionResult.rows[0].version.split('\n')[0]);
    console.log('');
    
    console.log(`Ejecutando ${migrations.length} migraciones:\n`);
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const migration of migrations) {
      const filePath = path.join(__dirname, '../packages/db/supabase/migrations', migration);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Archivo no encontrado: ${migration}`);
        errorCount++;
        continue;
      }
      
      console.log(`Ejecutando: ${migration}`);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await client.query(sql);
        console.log('  ✅ Completada\n');
        successCount++;
      } catch (err) {
        if (err.message.includes('already exists') || 
            err.message.includes('duplicate key') ||
            err.message.includes('does not exist')) {
          console.log('  ⚠️  Ya existe o fue omitida\n');
          skipCount++;
        } else {
          console.error(`  ❌ Error: ${err.message}\n`);
          errorCount++;
        }
      }
    }
    
    // Verificar tablas creadas
    console.log('Verificando tablas del módulo educativo...\n');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'educacion_%'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log(`✓ Tablas del módulo educativo (${tablesResult.rows.length}):\n`);
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No se encontraron tablas del módulo educativo');
    }
    
    console.log('\n=== Resumen ===');
    console.log(`  ✅ Exitosas: ${successCount}`);
    console.log(`  ⚠️  Omitidas: ${skipCount}`);
    console.log(`  ❌ Errores: ${errorCount}`);
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message);
    console.error('\nDetalles del error:');
    console.error('  Code:', error.code);
    console.error('  Detail:', error.detail);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

runMigrations();

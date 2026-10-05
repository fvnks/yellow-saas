/**
 * Script para ejecutar migraciones del módulo educativo en el VPS
 * 
 * Uso en el VPS:
 *   node scripts/migrate-educacion-vps.js
 * 
 * O con variables de entorno:
 *   DB_HOST=localhost DB_PORT=5432 DB_USER=postgres DB_NAME=postgres DB_PASSWORD=tu_password node scripts/migrate-educacion-vps.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env.local si existe
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
  console.log('✓ Cargado .env.local\n');
}

// Configuración de conexión
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
};

// Si hay DATABASE_URL, usarla
if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  config.host = url.hostname;
  config.port = parseInt(url.port || '5432');
  config.user = url.username;
  config.password = url.password;
  config.database = url.pathname.slice(1);
}

console.log('=== Migraciones del Módulo Educativo ===\n');
console.log('Configuración:');
console.log(`  Host: ${config.host}`);
console.log(`  Port: ${config.port}`);
console.log(`  User: ${config.user}`);
console.log(`  Database: ${config.database}`);
console.log('');

if (!config.password) {
  console.error('❌ Error: No se encontró la contraseña de la base de datos');
  console.error('   Establece la variable DB_PASSWORD o asegúrate de que .env.local tenga DATABASE_URL');
  process.exit(1);
}

const pool = new Pool({
  ...config,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
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
    console.log('Conectando a PostgreSQL...\n');
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
    console.error('\nPosibles causas:');
    console.error('  - PostgreSQL no está ejecutándose');
    console.error('  - Las credenciales son incorrectas');
    console.error('  - La base de datos no existe');
    console.error('');
    console.error('Verifica tu configuración:');
    console.error(`  DB_HOST=${config.host}`);
    console.error(`  DB_PORT=${config.port}`);
    console.error(`  DB_USER=${config.user}`);
    console.error(`  DB_NAME=${config.database}`);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

runMigrations();

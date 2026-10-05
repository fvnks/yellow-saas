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
let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  connectionString = 'postgresql://postgres:postgres@localhost:5432/yellow-saas';
  console.log('⚠ No DATABASE_URL found. Using local PostgreSQL fallback.');
}

console.log('Connection string:', connectionString.replace(/:[^:]+@/, ':******@'));
console.log('');

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
});

async function checkConnection() {
  try {
    console.log('Intentando conectar a PostgreSQL...\n');
    
    const client = await pool.connect();
    console.log('✓ Conexión exitosa!\n');
    
    // Verificar versión de PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('PostgreSQL Version:', versionResult.rows[0].version.split('\n')[0]);
    
    // Verificar base de datos actual
    const dbResult = await client.query('SELECT current_database()');
    console.log('Base de datos actual:', dbResult.rows[0].current_database);
    
    // Verificar tablas existentes
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`\nTablas existentes (${tablesResult.rows.length}):`);
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Verificar si existen tablas del módulo educativo
    const educacionTables = tablesResult.rows.filter(row => 
      row.table_name.startsWith('educacion_')
    );
    
    if (educacionTables.length > 0) {
      console.log(`\n✓ Tablas del módulo educativo encontradas (${educacionTables.length}):`);
      educacionTables.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('\n⚠ No se encontraron tablas del módulo educativo');
    }
    
    client.release();
    
  } catch (error) {
    console.error('✗ Error de conexión:', error.message);
    console.error('\nDetalles del error:');
    console.error('  Code:', error.code);
    console.error('  Detail:', error.detail);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\nPosibles causas:');
      console.error('  - PostgreSQL no está ejecutándose');
      console.error('  - El puerto 5432 no es correcto');
      console.error('  - El host no es accesible');
    } else if (error.code === '28P01') {
      console.error('\nPosibles causas:');
      console.error('  - Contraseña incorrecta');
      console.error('  - Usuario no existe');
    } else if (error.code === '3D000') {
      console.error('\nPosibles causas:');
      console.error('  - La base de datos no existe');
      console.error('  - Crea la base de datos con: CREATE DATABASE yellow-saas;');
    }
  } finally {
    await pool.end();
  }
}

checkConnection();

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
  console.log('✓ Cargado .env.local');
}

// Configuración de conexión
let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Fallback a PostgreSQL local en el VPS
  connectionString = 'postgresql://postgres:postgres@localhost:5432/yellow-saas';
  console.log('⚠ No DATABASE_URL found. Using local PostgreSQL fallback.');
}

console.log('Using connection:', connectionString.replace(/:[^:]+@/, ':******@'));

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Migraciones del módulo educativo
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

async function runEducacionMigrations() {
  console.log('\n=== Migraciones del Módulo Educativo ===\n');
  console.log(`Running ${migrations.length} migrations:\n`);

  for (const file of migrations) {
    const filePath = path.join(__dirname, '../packages/db/supabase/migrations', file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠ File not found: ${file}`);
      continue;
    }

    console.log(`Running: ${file}`);
    const sql = fs.readFileSync(filePath, 'utf8');

    try {
      await pool.query(sql);
      console.log('  ✓ Done\n');
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('duplicate key')) {
        console.log('  ⚠ Already exists, skipping\n');
      } else {
        console.error(`  ✗ Error: ${err.message}\n`);
      }
    }
  }

  await pool.end();
  console.log('=== Migraciones del Módulo Educativo Completadas ===');
}

runEducacionMigrations().catch(console.error);

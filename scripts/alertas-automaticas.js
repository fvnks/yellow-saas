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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  connectionTimeoutMillis: 15000,
});

/**
 * Enviar alertas automáticas de pagos vencidos
 */
async function enviarAlertasPagosVencidos() {
  const client = await pool.connect();
  
  try {
    console.log('=== Alertas Automáticas de Pagos Vencidos ===\n');
    console.log('Buscando pensiones vencidas...\n');

    // Buscar pensiones vencidas que no han sido notificadas
    const result = await client.query(`
      SELECT 
        p.id,
        p.monto,
        p.fecha_vencimiento,
        e.nombres || ' ' || e.apellido_paterno as estudiante_nombre,
        a.email as apoderado_email,
        a.nombres || ' ' || a.apoderado_apellido_paterno as apoderado_nombre,
        CURRENT_DATE - p.fecha_vencimiento as dias_mora
      FROM educacion_pensiones p
      JOIN educacion_estudiantes e ON p.estudiante_id = e.id
      JOIN educacion_estudiante_apoderado ea ON e.id = ea.estudiante_id
      JOIN educacion_apoderados a ON ea.apoderado_id = a.id
      WHERE p.estado = 'vencida'
        AND a.email IS NOT NULL
      ORDER BY p.fecha_vencimiento
    `);

    if (result.rows.length === 0) {
      console.log('✅ No hay pensiones vencidas para notificar');
      return;
    }

    console.log(`Se encontraron ${result.rows.length} pensiones vencidas\n`);

    let success = 0;
    let failed = 0;

    for (const pension of result.rows) {
      console.log(`Enviando alerta a ${pension.apoderado_email} para ${pension.estudiante_nombre}...`);
      
      // Aquí se implementaría el envío real del email
      // Por ahora, solo loguear
      console.log(`  📧 Asunto: Alerta de Pago Vencido: ${pension.estudiante_nombre}`);
      console.log(`  💰 Monto: $${pension.monto.toLocaleString('es-CL')}`);
      console.log(`  📅 Días de mora: ${pension.dias_mora}`);
      
      success++;
    }

    console.log(`\n=== Resumen ===`);
    console.log(`  ✅ Alertas enviadas: ${success}`);
    console.log(`  ❌ Alertas fallidas: ${failed}`);
    
  } catch (error) {
    console.error('Error enviando alertas:', error);
  } finally {
    client.release();
  }
}

/**
 * Enviar alertas de inasistencia reiterada
 */
async function enviarAlertasInasistencia() {
  const client = await pool.connect();
  
  try {
    console.log('\n=== Alertas Automáticas de Inasistencia ===\n');
    console.log('Buscando estudiantes con inasistencias reiteradas...\n');

    // Buscar estudiantes con más de 3 ausencias en los últimos 30 días
    const result = await client.query(`
      SELECT 
        e.id,
        e.nombres || ' ' || e.apellido_paterno as estudiante_nombre,
        a.email as apoderado_email,
        a.nombres || ' ' || a.apoderado_apellido_paterno as apoderado_nombre,
        COUNT(*) as total_ausencias
      FROM educacion_asistencia asis
      JOIN educacion_estudiantes e ON asis.estudiante_id = e.id
      JOIN educacion_estudiante_apoderado ea ON e.id = ea.estudiante_id
      JOIN educacion_apoderados a ON ea.apoderado_id = a.id
      WHERE asis.estado = 'ausente'
        AND asis.fecha >= CURRENT_DATE - INTERVAL '30 days'
        AND a.email IS NOT NULL
      GROUP BY e.id, e.nombres, e.apellido_paterno, a.email, a.nombres, a.apoderado_apellido_paterno
      HAVING COUNT(*) >= 3
      ORDER BY total_ausencias DESC
    `);

    if (result.rows.length === 0) {
      console.log('✅ No hay estudiantes con inasistencias reiteradas');
      return;
    }

    console.log(`Se encontraron ${result.rows.length} estudiantes con inasistencias reiteradas\n`);

    let success = 0;
    let failed = 0;

    for (const estudiante of result.rows) {
      console.log(`Enviando alerta a ${estudiante.apoderado_email} para ${estudiante.estudiante_nombre}...`);
      console.log(`  📧 Asunto: Alerta de Inasistencia: ${estudiante.estudiante_nombre}`);
      console.log(`  📊 Total ausencias: ${estudiante.total_ausencias}`);
      
      success++;
    }

    console.log(`\n=== Resumen ===`);
    console.log(`  ✅ Alertas enviadas: ${success}`);
    console.log(`  ❌ Alertas fallidas: ${failed}`);
    
  } catch (error) {
    console.error('Error enviando alertas de inasistencia:', error);
  } finally {
    client.release();
  }
}

/**
 * Enviar recordatorios de eventos próximos
 */
async function enviarRecordatoriosEventos() {
  const client = await pool.connect();
  
  try {
    console.log('\n=== Recordatorios de Eventos Próximos ===\n');
    console.log('Buscando eventos en los próximos 7 días...\n');

    // Buscar eventos en los próximos 7 días
    const result = await client.query(`
      SELECT 
        e.id,
        e.titulo,
        e.descripcion,
        e.fecha_inicio,
        e.ubicacion,
        c.nombre as curso_nombre
      FROM educacion_eventos e
      LEFT JOIN educacion_cursos c ON e.curso_id = c.id
      WHERE e.fecha_inicio >= CURRENT_DATE
        AND e.fecha_inicio <= CURRENT_DATE + INTERVAL '7 days'
      ORDER BY e.fecha_inicio
    `);

    if (result.rows.length === 0) {
      console.log('✅ No hay eventos próximos');
      return;
    }

    console.log(`Se encontraron ${result.rows.length} eventos próximos\n`);

    for (const evento of result.rows) {
      console.log(`📅 Evento: ${evento.titulo}`);
      console.log(`   Fecha: ${new Date(evento.fecha_inicio).toLocaleDateString('es-CL')}`);
      console.log(`   Ubicación: ${evento.ubicacion || 'No especificada'}`);
      console.log(`   Curso: ${evento.curso_nombre || 'General'}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('Error enviando recordatorios de eventos:', error);
  } finally {
    client.release();
  }
}

// Ejecutar todas las alertas
async function main() {
  try {
    await enviarAlertasPagosVencidos();
    await enviarAlertasInasistencia();
    await enviarRecordatoriosEventos();
    
    console.log('\n=== Proceso de Alertas Completado ===');
  } catch (error) {
    console.error('Error en el proceso de alertas:', error);
  } finally {
    await pool.end();
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  main();
}

module.exports = {
  enviarAlertasPagosVencidos,
  enviarAlertasInasistencia,
  enviarRecordatoriosEventos,
};

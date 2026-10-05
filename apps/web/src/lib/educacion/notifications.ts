// ============================================
// SISTEMA DE NOTIFICACIONES DEL MÓDULO EDUCATIVO
// ============================================

import { getDb } from '@/lib/db';

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
}

interface NotificationData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Configuración de email (en producción, usar variables de entorno)
const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  user: process.env.SMTP_USER || '',
  password: process.env.SMTP_PASSWORD || '',
  from: process.env.SMTP_FROM || 'noreply@yellow-erp.cl',
};

/**
 * Enviar email (implementación simplificada)
 * En producción, usar un servicio como SendGrid, AWS SES, etc.
 */
async function sendEmail(data: NotificationData): Promise<boolean> {
  try {
    // Por ahora, solo loguear el email
    // En producción, integrar con un servicio de email real
    console.log('📧 Enviando email:', {
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
    
    // Simular envío exitoso
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
}

/**
 * Notificación de nuevo comunicado
 */
export async function notificarComunicado(
  comunicadoId: string
): Promise<{ success: number; failed: number }> {
  const db = await getDb();
  
  // Obtener datos del comunicado
  const comunicadoResult = await db.query(
    `SELECT c.*, co.nombre as curso_nombre
     FROM educacion_comunicados c
     LEFT JOIN educacion_cursos co ON c.curso_id = co.id
     WHERE c.id = $1`,
    [comunicadoId]
  );

  if (comunicadoResult.rows.length === 0) {
    throw new Error('Comunicado no encontrado');
  }

  const comunicado = comunicadoResult.rows[0];

  // Obtener apoderados según el tipo de comunicado
  let apoderadosQuery = `
    SELECT DISTINCT a.email, a.nombres, a.apellido_paterno
    FROM educacion_apoderados a
    JOIN educacion_estudiante_apoderado ea ON a.id = ea.apoderado_id
    JOIN educacion_estudiantes e ON ea.estudiante_id = e.id
    WHERE a.email IS NOT NULL AND a.company_id = $1
  `;
  const params: any[] = [comunicado.company_id];

  if (comunicado.tipo === 'por_curso' && comunicado.curso_id) {
    apoderadosQuery += ` AND e.curso_id = $2`;
    params.push(comunicado.curso_id);
  }

  const apoderadosResult = await db.query(apoderadosQuery, params);

  let success = 0;
  let failed = 0;

  // Enviar notificación a cada apoderado
  for (const apoderado of apoderadosResult.rows) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Nuevo Comunicado</h2>
        <h3 style="color: #374151;">${comunicado.titulo}</h3>
        <p style="color: #4b5563;">${comunicado.contenido}</p>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          Este es un mensaje automático del sistema de gestión escolar.
          <br>
          Fecha: ${new Date(comunicado.fecha_publicacion).toLocaleDateString('es-CL')}
        </p>
      </div>
    `;

    const sent = await sendEmail({
      to: apoderado.email,
      subject: `Nuevo Comunicado: ${comunicado.titulo}`,
      html,
    });

    if (sent) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Alerta de inasistencia reiterada
 */
export async function alertarInasistencia(
  estudianteId: string,
  umbral: number = 3
): Promise<boolean> {
  const db = await getDb();
  
  // Contar inasistencias recientes
  const result = await db.query(
    `SELECT COUNT(*) as total_ausencias
     FROM educacion_asistencia
     WHERE estudiante_id = $1
       AND estado = 'ausente'
       AND fecha >= CURRENT_DATE - INTERVAL '30 days'`,
    [estudianteId]
  );

  const totalAusencias = parseInt(result.rows[0].total_ausencias);

  if (totalAusencias < umbral) {
    return false; // No alcanza el umbral
  }

  // Obtener datos del estudiante y apoderado
  const estudianteResult = await db.query(
    `SELECT 
       e.nombres || ' ' || e.apellido_paterno as estudiante_nombre,
       a.email as apoderado_email,
       a.nombres || ' ' || a.apellido_paterno as apoderado_nombre
     FROM educacion_estudiante_apoderado ea
     JOIN educacion_estudiantes e ON ea.estudiante_id = e.id
     JOIN educacion_apoderados a ON ea.apoderado_id = a.id
     WHERE ea.estudiante_id = $1
     LIMIT 1`,
    [estudianteId]
  );

  if (estudianteResult.rows.length === 0) {
    return false;
  }

  const { estudiante_nombre, apoderado_email, apoderado_nombre } = estudianteResult.rows[0];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Alerta de Inasistencia</h2>
      <p>Estimado/a ${apoderado_nombre},</p>
      <p>
        Le informamos que el estudiante <strong>${estudiante_nombre}</strong> ha acumulado
        <strong>${totalAusencias} inasistencias</strong> en los últimos 30 días.
      </p>
      <p>
        Le recomendamos revisar el detalle de asistencia en el portal del apoderado
        y tomar las medidas necesarias para mejorar la asistencia del estudiante.
      </p>
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        Este es un mensaje automático del sistema de gestión escolar.
      </p>
    </div>
  `;

  return await sendEmail({
    to: apoderado_email,
    subject: `Alerta de Inasistencia: ${estudiante_nombre}`,
    html,
  });
}

/**
 * Alerta de pago vencido
 */
export async function alertarPagoVencido(
  pensionId: string
): Promise<boolean> {
  const db = await getDb();
  
  // Obtener datos de la pensión
  const result = await db.query(
    `SELECT 
       p.monto,
       p.fecha_vencimiento,
       e.nombres || ' ' || e.apellido_paterno as estudiante_nombre,
       a.email as apoderado_email,
       a.nombres || ' ' || a.apoderado_apellido_paterno as apoderado_nombre
     FROM educacion_pensiones p
     JOIN educacion_estudiantes e ON p.estudiante_id = e.id
     JOIN educacion_estudiante_apoderado ea ON e.id = ea.estudiante_id
     JOIN educacion_apoderados a ON ea.apoderado_id = a.id
     WHERE p.id = $1
     LIMIT 1`,
    [pensionId]
  );

  if (result.rows.length === 0) {
    return false;
  }

  const { monto, fecha_vencimiento, estudiante_nombre, apoderado_email, apoderado_nombre } = result.rows[0];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Alerta de Pago Vencido</h2>
      <p>Estimado/a ${apoderado_nombre},</p>
      <p>
        Le recordamos que la pensión del estudiante <strong>${estudiante_nombre}</strong>
        con fecha de vencimiento <strong>${new Date(fecha_vencimiento).toLocaleDateString('es-CL')}</strong>
        se encuentra <strong>vencida</strong>.
      </p>
      <p>
        <strong>Monto:</strong> $${monto.toLocaleString('es-CL')}
      </p>
      <p>
        Le recomendamos regularizar su situación lo antes posible para evitar
        inconvenientes con la matrícula del estudiante.
      </p>
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        Este es un mensaje automático del sistema de gestión escolar.
      </p>
    </div>
  `;

  return await sendEmail({
    to: apoderado_email,
    subject: `Alerta de Pago Vencido: ${estudiante_nombre}`,
    html,
  });
}

/**
 * Alerta de nota baja
 */
export async function alertarNotaBaja(
  estudianteId: string,
  asignatura: string,
  nota: number
): Promise<boolean> {
  const db = await getDb();
  
  // Obtener datos del estudiante y apoderado
  const result = await db.query(
    `SELECT 
       e.nombres || ' ' || e.apellido_paterno as estudiante_nombre,
       a.email as apoderado_email,
       a.nombres || ' ' || a.apoderado_apellido_paterno as apoderado_nombre
     FROM educacion_estudiante_apoderado ea
     JOIN educacion_estudiantes e ON ea.estudiante_id = e.id
     JOIN educacion_apoderados a ON ea.apoderado_id = a.id
     WHERE ea.estudiante_id = $1
     LIMIT 1`,
    [estudianteId]
  );

  if (result.rows.length === 0) {
    return false;
  }

  const { estudiante_nombre, apoderado_email, apoderado_nombre } = result.rows[0];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Alerta de Nota Baja</h2>
      <p>Estimado/a ${apoderado_nombre},</p>
      <p>
        Le informamos que el estudiante <strong>${estudiante_nombre}</strong> ha obtenido
        una nota de <strong>${nota.toFixed(1)}</strong> en la asignatura <strong>${asignatura}</strong>.
      </p>
      <p>
        Le recomendamos revisar el rendimiento académico en el portal del apoderado
        y apoyar al estudiante en su proceso de aprendizaje.
      </p>
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        Este es un mensaje automático del sistema de gestión escolar.
      </p>
    </div>
  `;

  return await sendEmail({
    to: apoderado_email,
    subject: `Alerta de Nota Baja: ${estudiante_nombre}`,
    html,
  });
}

/**
 * Enviar notificación personalizada
 */
export async function enviarNotificacionPersonalizada(
  destinatarios: string[],
  asunto: string,
  mensaje: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const email of destinatarios) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">${asunto}</h2>
        <p style="color: #4b5563;">${mensaje}</p>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          Este es un mensaje automático del sistema de gestión escolar.
        </p>
      </div>
    `;

    const sent = await sendEmail({
      to: email,
      subject: asunto,
      html,
    });

    if (sent) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}

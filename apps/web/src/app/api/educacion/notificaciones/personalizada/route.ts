import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { enviarNotificacionPersonalizada } from '@/lib/educacion/notifications';

// POST /api/educacion/notificaciones/personalizada - Enviar notificación personalizada
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { destinatarios, asunto, mensaje } = body;

    if (!destinatarios || !Array.isArray(destinatarios) || destinatarios.length === 0) {
      return NextResponse.json(
        { error: 'Lista de destinatarios requerida' },
        { status: 400 }
      );
    }

    if (!asunto || !mensaje) {
      return NextResponse.json(
        { error: 'Asunto y mensaje requeridos' },
        { status: 400 }
      );
    }

    const result = await enviarNotificacionPersonalizada(destinatarios, asunto, mensaje);

    return NextResponse.json({
      message: 'Notificaciones enviadas',
      data: result,
    });
  } catch (error) {
    console.error('Error enviando notificaciones personalizadas:', error);
    return NextResponse.json(
      { error: 'Error al enviar notificaciones' },
      { status: 500 }
    );
  }
}

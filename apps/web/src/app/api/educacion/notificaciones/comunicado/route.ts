import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { notificarComunicado } from '@/lib/educacion/notifications';

// POST /api/educacion/notificaciones/comunicado - Enviar notificación de comunicado
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { comunicado_id } = body;

    if (!comunicado_id) {
      return NextResponse.json(
        { error: 'ID de comunicado requerido' },
        { status: 400 }
      );
    }

    const result = await notificarComunicado(comunicado_id);

    return NextResponse.json({
      message: 'Notificaciones enviadas',
      data: result,
    });
  } catch (error) {
    console.error('Error enviando notificaciones:', error);
    return NextResponse.json(
      { error: 'Error al enviar notificaciones' },
      { status: 500 }
    );
  }
}

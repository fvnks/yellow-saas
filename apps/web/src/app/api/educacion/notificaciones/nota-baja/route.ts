import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { alertarNotaBaja } from '@/lib/educacion/notifications';

// POST /api/educacion/notificaciones/nota-baja - Enviar alerta de nota baja
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { estudiante_id, asignatura, nota } = body;

    if (!estudiante_id || !asignatura || !nota) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const sent = await alertarNotaBaja(estudiante_id, asignatura, nota);

    return NextResponse.json({
      message: sent ? 'Alerta enviada' : 'No se pudo enviar la alerta',
      data: { sent },
    });
  } catch (error) {
    console.error('Error enviando alerta de nota:', error);
    return NextResponse.json(
      { error: 'Error al enviar alerta' },
      { status: 500 }
    );
  }
}

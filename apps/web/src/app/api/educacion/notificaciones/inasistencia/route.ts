import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { alertarInasistencia } from '@/lib/educacion/notifications';

// POST /api/educacion/notificaciones/inasistencia - Enviar alerta de inasistencia
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { estudiante_id, umbral } = body;

    if (!estudiante_id) {
      return NextResponse.json(
        { error: 'ID de estudiante requerido' },
        { status: 400 }
      );
    }

    const sent = await alertarInasistencia(estudiante_id, umbral || 3);

    return NextResponse.json({
      message: sent ? 'Alerta enviada' : 'No se alcanzó el umbral de inasistencias',
      data: { sent },
    });
  } catch (error) {
    console.error('Error enviando alerta de inasistencia:', error);
    return NextResponse.json(
      { error: 'Error al enviar alerta' },
      { status: 500 }
    );
  }
}

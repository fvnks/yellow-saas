import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { alertarPagoVencido } from '@/lib/educacion/notifications';

// POST /api/educacion/notificaciones/pago-vencido - Enviar alerta de pago vencido
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { pension_id } = body;

    if (!pension_id) {
      return NextResponse.json(
        { error: 'ID de pensión requerido' },
        { status: 400 }
      );
    }

    const sent = await alertarPagoVencido(pension_id);

    return NextResponse.json({
      message: sent ? 'Alerta enviada' : 'No se pudo enviar la alerta',
      data: { sent },
    });
  } catch (error) {
    console.error('Error enviando alerta de pago:', error);
    return NextResponse.json(
      { error: 'Error al enviar alerta' },
      { status: 500 }
    );
  }
}

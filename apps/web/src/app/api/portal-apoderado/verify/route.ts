import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    const secret = new TextEncoder().encode(JWT_SECRET);
    
    try {
      const { payload } = await jwtVerify(token, secret);
      
      // Verificar que el apoderado existe
      const db = await getDb();
      const result = await db.query(
        `SELECT id, nombres, apellido_paterno, apellido_materno, email, telefono
         FROM educacion_apoderados
         WHERE id = $1`,
        [payload.id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Apoderado no encontrado' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        data: {
          apoderado: result.rows[0],
        },
      });
    } catch {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error en verificación:', error);
    return NextResponse.json(
      { error: 'Error al verificar token' },
      { status: 500 }
    );
  }
}

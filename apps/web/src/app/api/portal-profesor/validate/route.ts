import { NextRequest, NextResponse } from 'next/server';
import { verifyPortalProfesorAuth } from '@/app/api/portal-profesor/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyPortalProfesorAuth(request);

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      session: {
        id: session.id,
        email: session.email,
        nombre: session.nombre,
        company_id: session.company_id,
      },
    });
  } catch (error) {
    console.error('Error validating portal profesor session:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

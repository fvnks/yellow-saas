import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId } from '@/api/lib/helpers';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return NextResponse.json({ success: false, error: 'Company ID not found' }, { status: 400 });

    const propRes = await query('SELECT id FROM condos_properties WHERE company_id = $1 AND is_active = true LIMIT 1', [companyId]);
    if (propRes.rows.length === 0) return NextResponse.json({ success: true, data: [] });
    const propertyId = propRes.rows[0].id;

    const result = await query(
      `SELECT * FROM condos_common_areas
       WHERE company_id = $1 AND property_id = $2 AND is_active = true
       ORDER BY name ASC`,
      [companyId, propertyId]
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Error in GET /api/condominio/common-areas:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al obtener espacios' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, capacity, hourly_rate_clp, deposit_clp } = body;

    const companyId = await getCompanyId(request);
    if (!companyId) return NextResponse.json({ success: false, error: 'Company ID not found' }, { status: 400 });

    if (!name) return NextResponse.json({ success: false, error: 'Nombre del espacio requerido' }, { status: 400 });

    const propRes = await query('SELECT id FROM condos_properties WHERE company_id = $1 AND is_active = true LIMIT 1', [companyId]);
    if (propRes.rows.length === 0) return NextResponse.json({ success: false, error: 'Propiedad no encontrada' }, { status: 404 });
    const propertyId = propRes.rows[0].id;

    const result = await query(
      `INSERT INTO condos_common_areas (company_id, property_id, name, description, capacity, hourly_rate_clp, deposit_clp)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [companyId, propertyId, name, description || null, Number(capacity) || 0, Number(hourly_rate_clp) || 0, Number(deposit_clp) || 0]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error in POST /api/condominio/common-areas:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al crear espacio' }, { status: 500 });
  }
}

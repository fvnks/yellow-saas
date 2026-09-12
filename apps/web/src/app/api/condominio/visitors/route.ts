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
      `SELECT v.*
       FROM condos_visitors v
       WHERE v.company_id = $1 AND v.property_id = $2
       ORDER BY v.created_at DESC`,
      [companyId, propertyId]
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Error in GET /api/condominio/visitors:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al obtener visitas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitor_name, visitor_rut, vehicle_plate, destination_unit_number, parking_spot, notes } = body;

    const companyId = await getCompanyId(request);
    if (!companyId) return NextResponse.json({ success: false, error: 'Company ID not found' }, { status: 400 });

    if (!visitor_name) {
      return NextResponse.json({ success: false, error: 'Nombre del visitante requerido' }, { status: 400 });
    }

    const propRes = await query('SELECT id FROM condos_properties WHERE company_id = $1 AND is_active = true LIMIT 1', [companyId]);
    if (propRes.rows.length === 0) return NextResponse.json({ success: false, error: 'Propiedad no encontrada' }, { status: 404 });
    const propertyId = propRes.rows[0].id;

    const result = await query(
      `INSERT INTO condos_visitors (company_id, property_id, visitor_name, visitor_rut, vehicle_plate, destination_unit_number, parking_spot, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
       RETURNING *`,
      [companyId, propertyId, visitor_name, visitor_rut || null, vehicle_plate || null, destination_unit_number || null, parking_spot || null, notes || null]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error in POST /api/condominio/visitors:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al registrar visita' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    const companyId = await getCompanyId(request);
    if (!companyId) return NextResponse.json({ success: false, error: 'Company ID not found' }, { status: 400 });

    if (!id) return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });

    const result = await query(
      `UPDATE condos_visitors
       SET status = 'exited', exit_time = now(), updated_at = now()
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [id, companyId]
    );

    if (result.rows.length === 0) return NextResponse.json({ success: false, error: 'Visita no encontrada' }, { status: 404 });
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error in PATCH /api/condominio/visitors:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al actualizar visita' }, { status: 500 });
  }
}

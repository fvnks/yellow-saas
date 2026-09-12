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
      `SELECT r.*, ca.name as space_name, u.unit_number,
              COALESCE(u.resident_name, 'Copropietario') as reserver_name
       FROM condos_reservations r
       JOIN condos_common_areas ca ON ca.id = r.common_area_id
       JOIN condos_units u ON u.id = r.unit_id
       WHERE r.company_id = $1 AND r.property_id = $2
       ORDER BY r.reservation_date DESC, r.created_at DESC`,
      [companyId, propertyId]
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Error in GET /api/condominio/reservations:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al obtener reservas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { common_area_id, unit_id, reservation_date, time_slot, fee_clp, deposit_clp, notes } = body;

    const companyId = await getCompanyId(request);
    if (!companyId) return NextResponse.json({ success: false, error: 'Company ID not found' }, { status: 400 });

    if (!common_area_id || !unit_id || !reservation_date || !time_slot) {
      return NextResponse.json({ success: false, error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const propRes = await query('SELECT id FROM condos_properties WHERE company_id = $1 AND is_active = true LIMIT 1', [companyId]);
    if (propRes.rows.length === 0) return NextResponse.json({ success: false, error: 'Propiedad no encontrada' }, { status: 404 });
    const propertyId = propRes.rows[0].id;

    const unitRes = await query('SELECT resident_name FROM condos_units WHERE id = $1 AND company_id = $2', [unit_id, companyId]);
    const reserverName = unitRes.rows[0]?.resident_name || 'Copropietario';

    const result = await query(
      `INSERT INTO condos_reservations (company_id, property_id, common_area_id, unit_id, reserver_name, reservation_date, time_slot, fee_clp, deposit_clp, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'confirmed')
       RETURNING *`,
      [companyId, propertyId, common_area_id, unit_id, reserverName, reservation_date, time_slot, Number(fee_clp) || 0, Number(deposit_clp) || 0, notes || null]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error in POST /api/condominio/reservations:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al crear reserva' }, { status: 500 });
  }
}

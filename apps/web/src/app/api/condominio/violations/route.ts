import { NextResponse } from 'next/server';
import { query, transaction } from '@/api/lib/db';

// GET: Fetch violations & insurance policies
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

    const propRes = await query('SELECT id FROM condos_properties WHERE company_id = $1 LIMIT 1', [companyId]);
    if (propRes.rows.length === 0) return NextResponse.json({ success: true, data: { violations: [], policies: [] } });
    const propertyId = propRes.rows[0].id;

    const violationsRes = await query(
      `SELECT v.id, v.unit_id as "unitId", u.unit_number as "unitNumber", u.resident_name as "ownerName",
              v.infraction_description as "description", v.fine_amount_clp as "amountCLP",
              v.fine_amount_uf as "amountUF", v.status, v.created_at as "createdAt"
       FROM condos_violations v
       JOIN condos_units u ON u.id = v.unit_id
       WHERE v.company_id = $1 AND v.property_id = $2
       ORDER BY v.created_at DESC`,
      [companyId, propertyId]
    );

    const policiesRes = await query(
      `SELECT id, insurer_name as "insurerName", policy_number as "policyNumber",
              start_date as "startDate", end_date as "endDate", fire_coverage_clp as "fireCoverageCLP",
              premium_amount_clp as "premiumAmountCLP"
       FROM condos_insurance_policies
       WHERE company_id = $1 AND property_id = $2`,
      [companyId, propertyId]
    );

    return NextResponse.json({
      success: true,
      data: {
        violations: violationsRes.rows,
        policies: policiesRes.rows
      }
    });
  } catch (error: any) {
    console.error('Error in GET /api/condominio/violations:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al obtener multas y seguros' }, { status: 500 });
  }
}

// POST: Add violation or insurance policy
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, company_id, unit_id, description, amount_clp, amount_uf, insurer_name, policy_number, fire_coverage_clp, premium_amount_clp } = body;
    const companyId = company_id || '00000000-0000-0000-0000-000000000001';

    if (type === 'policy') {
      const propRes = await query('SELECT id FROM condos_properties WHERE company_id = $1 LIMIT 1', [companyId]);
      const propertyId = propRes.rows[0].id;

      const pRes = await query(
        `INSERT INTO condos_insurance_policies (company_id, property_id, insurer_name, policy_number, fire_coverage_clp, premium_amount_clp)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [companyId, propertyId, insurer_name, policy_number, Number(fire_coverage_clp) || 0, Number(premium_amount_clp) || 0]
      );
      return NextResponse.json({ success: true, data: pRes.rows[0] });
    }

    // Default: Add violation
    if (!unit_id || !description || !amount_clp) {
      return NextResponse.json({ success: false, error: 'Unidad, descripción y monto requeridos' }, { status: 400 });
    }

    const propRes = await query('SELECT property_id FROM condos_units WHERE id = $1', [unit_id]);
    const propertyId = propRes.rows[0].property_id;

    const vRes = await query(
      `INSERT INTO condos_violations (company_id, property_id, unit_id, infraction_description, fine_amount_clp, fine_amount_uf, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [companyId, propertyId, unit_id, description, Number(amount_clp), Number(amount_uf) || 0]
    );

    return NextResponse.json({ success: true, data: vRes.rows[0] });
  } catch (error: any) {
    console.error('Error in POST /api/condominio/violations:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al guardar registro' }, { status: 500 });
  }
}

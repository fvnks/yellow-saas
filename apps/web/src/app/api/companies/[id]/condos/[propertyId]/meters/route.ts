import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string }> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    let whereClause = "WHERE m.company_id = $1 AND m.property_id = $2";
    const params_: any[] = [companyId, pParams.propertyId];
    let paramIndex = 3;
    if (search) {
      whereClause += ` AND (u.unit_number ILIKE $${paramIndex} OR m.meter_type ILIKE $${paramIndex} OR m.meter_number ILIKE $${paramIndex})`;
      params_.push(`%${search}%`);
      paramIndex++;
    }
    const countResult = await query(
      `SELECT COUNT(*) FROM condos_utility_meters m JOIN condos_units u ON u.id = m.unit_id ${whereClause}`,
      params_,
    );
    const dataResult = await query(
      `SELECT m.id, m.unit_id as "unitId", u.unit_number as "unitNumber", m.meter_type as "meterType",
              m.meter_number as "meterNumber",
              r.previous_reading as "previousReading", r.current_reading as "currentReading",
              r.consumption, r.unit_rate_clp as "unitRateCLP", r.total_clp as "totalCLP"
       FROM condos_utility_meters m
       JOIN condos_units u ON u.id = m.unit_id
       LEFT JOIN LATERAL (
         SELECT previous_reading, current_reading, consumption, unit_rate_clp, total_clp
         FROM condos_meter_readings
         WHERE meter_id = m.id
         ORDER BY created_at DESC LIMIT 1
       ) r ON true
       ${whereClause}
       ORDER BY u.unit_number ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params_, limit, offset],
    );
    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string }> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const body = await request.json();
    const { unit_id, meter_type, meter_number, previous_reading, current_reading, unit_rate_clp } = body;
    if (!unit_id || !meter_type || current_reading === undefined) return errorResponse("unit_id, meter_type and current_reading are required", 400);

    // Verify unit belongs to this property
    const unitCheck = await query(
      `SELECT id FROM condos_units WHERE id = $1 AND company_id = $2 AND property_id = $3`,
      [unit_id, companyId, pParams.propertyId],
    );
    if (unitCheck.rows.length === 0) return errorResponse("Unit not found in this property", 404);

    // Find or create meter
    let meterRes = await query(
      `SELECT id FROM condos_utility_meters WHERE unit_id = $1 AND meter_type = $2 AND company_id = $3 LIMIT 1`,
      [unit_id, meter_type, companyId],
    );
    let meterId: string;
    if (meterRes.rows.length === 0) {
      const newMeter = await query(
        `INSERT INTO condos_utility_meters (company_id, property_id, unit_id, meter_type, meter_number)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [companyId, pParams.propertyId, unit_id, meter_type, meter_number || `MED-${meter_type.toUpperCase()}`],
      );
      meterId = newMeter.rows[0].id;
    } else {
      meterId = meterRes.rows[0].id;
    }

    // Fetch active period
    const pRes = await query('SELECT id FROM condos_periods WHERE company_id = $1 ORDER BY created_at DESC LIMIT 1', [companyId]);
    const periodId = pRes.rows[0]?.id;

    const prev = Number(previous_reading) || 0;
    const curr = Number(current_reading) || 0;
    const consumption = Math.max(0, curr - prev);
    const rate = Number(unit_rate_clp) || 3500;
    const totalCLP = Math.round(consumption * rate);

    const readingRes = await query(
      `INSERT INTO condos_meter_readings (company_id, meter_id, period_id, unit_id, previous_reading, current_reading, consumption, unit_rate_clp, total_clp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [companyId, meterId, periodId || null, unit_id, prev, curr, consumption, rate, totalCLP],
    );

    return successResponse(readingRes.rows[0], 201);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string }> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const { searchParams } = new URL(request.url);
    const meterId = searchParams.get('meterId');
    const readingId = searchParams.get('readingId');

    if (readingId) {
      const result = await query(
        `DELETE FROM condos_meter_readings WHERE id = $1 AND company_id = $2 RETURNING id`,
        [readingId, companyId]
      );
      if (result.rows.length === 0) return errorResponse("Lectura no encontrada", 404);
      return successResponse({ deleted: true });
    }

    if (meterId) {
      const result = await query(
        `DELETE FROM condos_utility_meters WHERE id = $1 AND company_id = $2 AND property_id = $3 RETURNING id`,
        [meterId, companyId, pParams.propertyId]
      );
      if (result.rows.length === 0) return errorResponse("Medidor no encontrado", 404);
      return successResponse({ deleted: true });
    }

    return errorResponse("meterId or readingId query param is required", 400);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

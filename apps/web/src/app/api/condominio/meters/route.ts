import { NextResponse } from 'next/server';
import { query, transaction } from '@/api/lib/db';

// GET: Fetch utility meters & period readings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

    const propRes = await query('SELECT id FROM condos_properties WHERE company_id = $1 LIMIT 1', [companyId]);
    if (propRes.rows.length === 0) return NextResponse.json({ success: true, data: [] });
    const propertyId = propRes.rows[0].id;

    const metersRes = await query(
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
       WHERE m.company_id = $1 AND m.property_id = $2`,
      [companyId, propertyId]
    );

    return NextResponse.json({ success: true, data: metersRes.rows });
  } catch (error: any) {
    console.error('Error in GET /api/condominio/meters:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al obtener medidores' }, { status: 500 });
  }
}

// POST: Register meter reading
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company_id, unit_id, meter_type, meter_number, previous_reading, current_reading, unit_rate_clp } = body;
    const companyId = company_id || '00000000-0000-0000-0000-000000000001';

    if (!unit_id || !meter_type || current_reading === undefined) {
      return NextResponse.json({ success: false, error: 'Unidad, tipo de medidor y lectura actual requeridos' }, { status: 400 });
    }

    const result = await transaction(async (client) => {
      const propRes = await client.query('SELECT property_id FROM condos_units WHERE id = $1', [unit_id]);
      if (propRes.rows.length === 0) throw new Error('Unidad no encontrada');
      const propertyId = propRes.rows[0].property_id;

      // Find or create meter
      let meterRes = await client.query(
        `SELECT id FROM condos_utility_meters WHERE unit_id = $1 AND meter_type = $2 LIMIT 1`,
        [unit_id, meter_type]
      );
      let meterId: string;
      if (meterRes.rows.length === 0) {
        const newMeter = await client.query(
          `INSERT INTO condos_utility_meters (company_id, property_id, unit_id, meter_type, meter_number)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [companyId, propertyId, unit_id, meter_type, meter_number || `MED-${meter_type.toUpperCase()}`]
        );
        meterId = newMeter.rows[0].id;
      } else {
        meterId = meterRes.rows[0].id;
      }

      // Fetch active period
      const pRes = await client.query('SELECT id FROM condos_periods WHERE company_id = $1 ORDER BY created_at DESC LIMIT 1', [companyId]);
      const periodId = pRes.rows[0]?.id;

      const prev = Number(previous_reading) || 0;
      const curr = Number(current_reading) || 0;
      const consumption = Math.max(0, curr - prev);
      const rate = Number(unit_rate_clp) || 3500;
      const totalCLP = Math.round(consumption * rate);

      const readingRes = await client.query(
        `INSERT INTO condos_meter_readings (company_id, meter_id, period_id, unit_id, previous_reading, current_reading, consumption, unit_rate_clp, total_clp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [companyId, meterId, periodId, unit_id, prev, curr, consumption, rate, totalCLP]
      );

      return readingRes.rows[0];
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in POST /api/condominio/meters:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al guardar lectura de medidor' }, { status: 500 });
  }
}

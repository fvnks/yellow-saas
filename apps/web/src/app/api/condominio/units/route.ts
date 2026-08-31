import { NextResponse } from 'next/server';
import { query, transaction } from '@/api/lib/db';

// POST: Add new unit
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company_id, property_id, unit_number, type, resident_name, resident_email, resident_phone, alicuota_percentage } = body;

    const companyId = company_id || '00000000-0000-0000-0000-000000000001';

    if (!unit_number) {
      return NextResponse.json({ success: false, error: 'El número de unidad es requerido' }, { status: 400 });
    }

    const result = await transaction(async (client) => {
      // Find default property if not provided
      let propId = property_id;
      if (!propId) {
        const propRes = await client.query('SELECT id FROM condos_properties WHERE company_id = $1 LIMIT 1', [companyId]);
        if (propRes.rows.length === 0) {
          throw new Error('No se encontró condominio registrado');
        }
        propId = propRes.rows[0].id;
      }

      // Insert Unit
      const unitRes = await client.query(
        `INSERT INTO condos_units (company_id, property_id, unit_number, type, resident_name, resident_email, resident_phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [companyId, propId, unit_number, type || 'departamento', resident_name || '', resident_email || '', resident_phone || '']
      );

      const newUnit = unitRes.rows[0];

      // Insert Coefficient
      const alicuota = Number(alicuota_percentage) || 0;
      await client.query(
        `INSERT INTO condos_coefficients (company_id, property_id, unit_id, category, percentage, coefficient_pct)
         VALUES ($1, $2, $3, 'general', $4, $4)`,
        [companyId, propId, newUnit.id, alicuota]
      );

      return newUnit;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in POST /api/condominio/units:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al guardar la unidad' }, { status: 500 });
  }
}

// PUT: Update existing unit or alícuota
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, unit_number, type, resident_name, resident_email, resident_phone, alicuota_percentage } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de unidad requerido' }, { status: 400 });
    }

    await transaction(async (client) => {
      await client.query(
        `UPDATE condos_units
         SET unit_number = COALESCE($1, unit_number),
             type = COALESCE($2, type),
             resident_name = COALESCE($3, resident_name),
             resident_email = COALESCE($4, resident_email),
             resident_phone = COALESCE($5, resident_phone),
             updated_at = now()
         WHERE id = $6`,
        [unit_number, type, resident_name, resident_email, resident_phone, id]
      );

      if (alicuota_percentage !== undefined) {
        await client.query(
          `INSERT INTO condos_coefficients (company_id, property_id, unit_id, category, percentage, coefficient_pct)
           SELECT company_id, property_id, id, 'general', $1, $1 FROM condos_units WHERE id = $2
           ON CONFLICT (unit_id, category)
           DO UPDATE SET percentage = $1, coefficient_pct = $1, updated_at = now()`,
          [Number(alicuota_percentage), id]
        );
      }
    });

    return NextResponse.json({ success: true, message: 'Unidad actualizada' });
  } catch (error: any) {
    console.error('Error in PUT /api/condominio/units:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al actualizar unidad' }, { status: 500 });
  }
}

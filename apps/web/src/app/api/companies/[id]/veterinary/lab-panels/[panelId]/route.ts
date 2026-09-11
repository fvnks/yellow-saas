import { query, transaction } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; panelId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT vlp.*,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', vlt.id, 'name', vlt.name, 'code', vlt.code, 'unit', vlt.unit,
            'reference_range', vlt.reference_range, 'reference_range_feline', vlt.reference_range_feline,
            'reference_range_avian', vlt.reference_range_avian, 'sort_order', vlt.sort_order
          ) ORDER BY vlt.sort_order) FROM veterinary_lab_tests vlt WHERE vlt.panel_id = vlp.id), '[]'
        ) as tests
       FROM veterinary_lab_panels vlp
       WHERE vlp.id = $1 AND vlp.company_id = $2`,
      [params.panelId, companyId]
    );

    if (!rows[0]) return errorResponse('Lab panel not found', 404);

    return successResponse(rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Failed to fetch lab panel', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; panelId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, code, category, is_active, tests } = body;

    if (code) {
      const existing = await query(
        `SELECT id FROM veterinary_lab_panels WHERE company_id = $1 AND code = $2 AND id != $3`,
        [companyId, code, params.panelId]
      );
      if (existing.rows.length > 0) {
        return errorResponse('A panel with this code already exists', 409);
      }
    }

    if (category) {
      const validCategories = ['hematologia', 'bioquimica', 'endocrinologia', 'urianalisis', 'parasitologia', 'citologia', 'serologia', 'otros'];
      if (!validCategories.includes(category)) return errorResponse('Invalid category', 400);
    }

    const result = await transaction(async (client) => {
      const { rows } = await client.query(
        `UPDATE veterinary_lab_panels SET
          name = COALESCE($1, name), code = COALESCE($2, code),
          category = COALESCE($3, category), is_active = COALESCE($4, is_active),
          updated_at = NOW()
         WHERE id = $5 AND company_id = $6
         RETURNING *`,
        [name || null, code || null, category || null,
         is_active !== undefined ? is_active : null,
         params.panelId, companyId]
      );

      if (!rows[0]) throw new Error('NOT_FOUND');

      if (tests?.length) {
        await client.query(
          `DELETE FROM veterinary_lab_tests WHERE panel_id = $1 AND company_id = $2`,
          [params.panelId, companyId]
        );

        for (let i = 0; i < tests.length; i++) {
          const test = tests[i];
          await client.query(
            `INSERT INTO veterinary_lab_tests (company_id, panel_id, name, code, unit, reference_range, reference_range_feline, reference_range_avian, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [companyId, params.panelId, test.name, test.code || null, test.unit || null,
             test.reference_range || null, test.reference_range_feline || null,
             test.reference_range_avian || null, test.sort_order || i]
          );
        }
      }

      return rows[0];
    });

    return successResponse(result);
  } catch (err: any) {
    if (err?.message === 'NOT_FOUND') return errorResponse('Lab panel not found', 404);
    return errorResponse('Failed to update lab panel', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; panelId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: existing } = await query(
      `SELECT id FROM veterinary_lab_panels WHERE id = $1 AND company_id = $2`,
      [params.panelId, companyId]
    );

    if (!existing[0]) return errorResponse('Lab panel not found', 404);

    const { rows: orders } = await query(
      `SELECT id FROM veterinary_lab_orders WHERE panel_id = $1 AND company_id = $2 LIMIT 1`,
      [params.panelId, companyId]
    );

    if (orders.length > 0) {
      return errorResponse('Cannot delete panel with associated lab orders', 400);
    }

    await query(
      `DELETE FROM veterinary_lab_tests WHERE panel_id = $1 AND company_id = $2`,
      [params.panelId, companyId]
    );
    await query(
      `DELETE FROM veterinary_lab_panels WHERE id = $1 AND company_id = $2`,
      [params.panelId, companyId]
    );

    return successResponse({ message: 'Lab panel deleted successfully' });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Failed to delete lab panel', 500);
  }
}

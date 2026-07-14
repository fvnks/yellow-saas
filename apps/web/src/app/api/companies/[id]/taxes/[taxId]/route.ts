import { query } from '../../../../lib/db';
import { getCompanyId, successResponse, errorResponse } from '../../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; taxId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT t.*,
        (SELECT COUNT(*) FROM products WHERE tax_id = t.id) as product_count
       FROM taxes t
       WHERE t.id = $1 AND t.company_id = $2`,
      [params.taxId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Tax not found', 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; taxId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, code, rate, type, sri_code, is_active } = body;

    if (name) {
      const existing = await query(
        `SELECT id FROM taxes WHERE company_id = $1 AND LOWER(name) = LOWER($2) AND id != $3`,
        [companyId, name, params.taxId]
      );
      if (existing.rows.length > 0) {
        return errorResponse('A tax with this name already exists', 400);
      }
    }

    const result = await query(
      `UPDATE taxes SET
        name = COALESCE($1, name),
        code = COALESCE($2, code),
        rate = COALESCE($3, rate),
        type = COALESCE($4, type),
        sri_code = COALESCE($5, sri_code),
        is_active = COALESCE($6, is_active)
       WHERE id = $7 AND company_id = $8
       RETURNING *`,
      [name || null, code || null, rate ?? null, type || null, sri_code || null, is_active ?? null, params.taxId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Tax not found', 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; taxId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const productCheck = await query(
      `SELECT COUNT(*) FROM products WHERE tax_id = $1 AND company_id = $2`,
      [params.taxId, companyId]
    );
    if (parseInt(productCheck.rows[0].count) > 0) {
      return errorResponse('Cannot delete tax assigned to products', 400);
    }

    const result = await query(
      `DELETE FROM taxes WHERE id = $1 AND company_id = $2 RETURNING id`,
      [params.taxId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Tax not found', 404);
    return successResponse({ message: 'Tax deleted' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

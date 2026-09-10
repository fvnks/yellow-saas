import { query, transaction } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'name', 'code', 'category'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'created_at';
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const isActive = url.searchParams.get('is_active');

    const params: any[] = [companyId];
    let where = 'WHERE vlp.company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND (vlp.name ILIKE $${paramIndex} OR vlp.code ILIKE $${paramIndex} OR vlp.category ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      where += ` AND vlp.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (isActive !== null && isActive !== undefined) {
      where += ` AND vlp.is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    const countResult = await query(`SELECT COUNT(*) FROM veterinary_lab_panels vlp ${where}`, params);
    const total = parseInt(countResult.rows[0]?.count || '0');

    const dataResult = await query(
      `SELECT vlp.*,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', vlt.id, 'name', vlt.name, 'code', vlt.code, 'unit', vlt.unit,
            'reference_range', vlt.reference_range, 'reference_range_feline', vlt.reference_range_feline,
            'reference_range_avian', vlt.reference_range_avian, 'sort_order', vlt.sort_order
          ) ORDER BY vlt.sort_order) FROM veterinary_lab_tests vlt WHERE vlt.panel_id = vlp.id), '[]'
        ) as tests
       FROM veterinary_lab_panels vlp
       ${where}
       ORDER BY vlp.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(dataResult.rows, total, page, limit);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, code, category, is_active = true, tests = [] } = body;

    if (!name || !code) return errorResponse('Name and code are required', 400);

    const validCategories = ['hematologia', 'bioquimica', 'endocrinologia', 'urianalisis', 'parasitologia', 'citologia', 'serologia', 'otros'];
    if (category && !validCategories.includes(category)) return errorResponse('Invalid category', 400);

    const existing = await query(
      `SELECT id FROM veterinary_lab_panels WHERE company_id = $1 AND code = $2`,
      [companyId, code]
    );
    if (existing.rows.length > 0) {
      return errorResponse('A panel with this code already exists', 409);
    }

    const result = await transaction(async (client) => {
      const { rows: panelRows } = await client.query(
        `INSERT INTO veterinary_lab_panels (company_id, name, code, category, is_active)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [companyId, name, code, category || 'otros', is_active]
      );

      const panel = panelRows[0];

      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        await client.query(
          `INSERT INTO veterinary_lab_tests (company_id, panel_id, name, code, unit, reference_range, reference_range_feline, reference_range_avian, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [companyId, panel.id, test.name, test.code || null, test.unit || null,
           test.reference_range || null, test.reference_range_feline || null,
           test.reference_range_avian || null, test.sort_order || i]
        );
      }

      return panel;
    });

    return successResponse(result, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

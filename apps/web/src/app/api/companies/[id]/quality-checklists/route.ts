import { query } from '@/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const isActive = url.searchParams.get('is_active');

    let whereClause = 'WHERE qc.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (type) {
      whereClause += ` AND qc.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (isActive !== null) {
      whereClause += ` AND qc.is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (qc.name ILIKE $${paramIndex} OR qc.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM quality_checklists qc ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT qc.*, 
        (SELECT COUNT(*) FROM quality_checklist_items qci WHERE qci.checklist_id = qc.id) as items_count
       FROM quality_checklists qc
       ${whereClause}
       ORDER BY qc.name
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Quality checklists error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, description, type, version, is_active, items } = body;

    if (!name) {
      return errorResponse('name is required', 400);
    }

    const validTypes = ['incoming', 'in_process', 'final', 'shipping'];
    if (type && !validTypes.includes(type)) {
      return errorResponse(`type must be one of: ${validTypes.join(', ')}`, 400);
    }

    const result = await query(
      `INSERT INTO quality_checklists (company_id, name, description, type, version, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [companyId, name, description || null, type || 'incoming', version || '1.0', is_active !== false]
    );

    const checklist = result.rows[0];

    if (items && Array.isArray(items)) {
      for (const item of items) {
        await query(
          `INSERT INTO quality_checklist_items (company_id, checklist_id, sequence, check_type, description, acceptance_criteria, min_value, max_value, uom, is_critical, aql_level)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            companyId,
            checklist.id,
            item.sequence || 1,
            item.check_type || 'visual',
            item.description,
            item.acceptance_criteria || null,
            item.min_value || null,
            item.max_value || null,
            item.uom || null,
            item.is_critical || false,
            item.aql_level || null,
          ]
        );
      }
    }

    return successResponse(checklist, 201);
  } catch (err) {
    console.error('Create quality checklist error:', err);
    return errorResponse('Internal server error', 500);
  }
}
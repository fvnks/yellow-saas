import { query } from '@/api/lib/db';
import { successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  try {
    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');
    const priorityFilter = url.searchParams.get('priority');
    const companyFilter = url.searchParams.get('company_id');

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(t.subject ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (statusFilter) {
      conditions.push(`t.status = $${paramIndex}`);
      params.push(statusFilter);
      paramIndex++;
    }
    if (priorityFilter) {
      conditions.push(`t.priority = $${paramIndex}`);
      params.push(priorityFilter);
      paramIndex++;
    }
    if (companyFilter) {
      conditions.push(`t.company_id = $${paramIndex}`);
      params.push(companyFilter);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM support_tickets t JOIN companies c ON c.id = t.company_id ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.count || '0');

    const allowedSorts: Record<string, string> = { created_at: 't.created_at', updated_at: 't.updated_at', priority: 't.priority', status: 't.status' };
    const sortColumn = allowedSorts[sort] || 't.created_at';

    const result = await query(
      `SELECT t.id, t.subject, t.status, t.priority, t.created_at, t.updated_at,
        c.name as company_name, c.id as company_id,
        p.full_name as created_by_name,
        sa.name as assigned_to_name
       FROM support_tickets t
       JOIN companies c ON c.id = t.company_id
       LEFT JOIN profiles p ON p.id = t.created_by
       LEFT JOIN super_admins sa ON sa.id = t.assigned_to
       ${whereClause}
       ORDER BY ${sortColumn} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(result.rows, total, page, limit);
  } catch (err) {
    console.error('Support tickets list error:', err);
    return errorResponse('Error al obtener tickets', 500);
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const body = await request.json();
  const { company_id, subject, priority, message } = body;

  if (!company_id || !subject) return errorResponse('Empresa y asunto son requeridos', 400);

  try {
    const ticketResult = await query(
      'INSERT INTO support_tickets (company_id, subject, priority, assigned_to) VALUES ($1, $2, $3, $4) RETURNING id',
      [company_id, subject, priority || 'medium', admin.id]
    );
    const ticketId = ticketResult.rows[0].id;

    if (message) {
      await query(
        'INSERT INTO ticket_messages (ticket_id, sender_type, sender_id, message) VALUES ($1, $2, $3, $4)',
        [ticketId, 'super_admin', admin.id, message]
      );
    }

    return successResponse({ id: ticketId });
  } catch (err) {
    console.error('Support ticket create error:', err);
    return errorResponse('Error al crear ticket', 500);
  }
}

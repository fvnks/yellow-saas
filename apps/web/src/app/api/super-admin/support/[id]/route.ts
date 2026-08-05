import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  try {
    const ticketResult = await query(`
      SELECT 
        t.id, t.subject, t.status, t.priority, t.created_at, t.updated_at,
        c.name as company_name, c.id as company_id,
        p.full_name as created_by_name,
        sa.name as assigned_to_name
      FROM support_tickets t
      JOIN companies c ON c.id = t.company_id
      LEFT JOIN profiles p ON p.id = t.created_by
      LEFT JOIN super_admins sa ON sa.id = t.assigned_to
      WHERE t.id = $1
    `, [params.id]);

    if (ticketResult.rows.length === 0) return errorResponse('Ticket no encontrado', 404);

    const messagesResult = await query(`
      SELECT 
        tm.id, tm.sender_type, tm.sender_id, tm.message, tm.created_at,
        CASE 
          WHEN tm.sender_type = 'super_admin' THEN sa.name
          ELSE p.full_name
        END as sender_name
      FROM ticket_messages tm
      LEFT JOIN super_admins sa ON sa.id = tm.sender_id AND tm.sender_type = 'super_admin'
      LEFT JOIN profiles p ON p.id = tm.sender_id AND tm.sender_type = 'company'
      WHERE tm.ticket_id = $1
      ORDER BY tm.created_at ASC
    `, [params.id]);

    const feedbackResult = await query(`
      SELECT rating, comment, created_at
      FROM ticket_feedback
      WHERE ticket_id = $1
    `, [params.id]);

    return successResponse({
      ...ticketResult.rows[0],
      messages: messagesResult.rows,
      feedback: feedbackResult.rows[0] || null,
    });
  } catch (err) {
    console.error('Support ticket detail error:', err);
    return errorResponse('Error al obtener ticket', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const body = await request.json();
  const { status, assigned_to } = body;

  try {
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (status) {
      updates.push(`status = $${idx++}`);
      values.push(status);
    }
    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${idx++}`);
      values.push(assigned_to);
    }
    updates.push(`updated_at = now()`);
    values.push(params.id);

    await query(`UPDATE support_tickets SET ${updates.join(', ')} WHERE id = $${idx}`, values);

    return successResponse({ success: true });
  } catch (err) {
    console.error('Support ticket update error:', err);
    return errorResponse('Error al actualizar ticket', 500);
  }
}

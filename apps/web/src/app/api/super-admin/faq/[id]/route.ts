import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const body = await request.json();
  const { category, question, answer, sort_order, active } = body;

  try {
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (question !== undefined) {
      if (!String(question).trim()) return errorResponse('La pregunta es requerida', 400);
      updates.push(`question = $${idx++}`);
      values.push(String(question).trim());
    }
    if (answer !== undefined) {
      if (!String(answer).trim()) return errorResponse('La respuesta es requerida', 400);
      updates.push(`answer = $${idx++}`);
      values.push(String(answer).trim());
    }
    if (category !== undefined) {
      updates.push(`category = $${idx++}`);
      values.push(String(category).trim() || 'General');
    }
    if (sort_order !== undefined) {
      updates.push(`sort_order = $${idx++}`);
      values.push(sort_order);
    }
    if (active !== undefined) {
      updates.push(`active = $${idx++}`);
      values.push(Boolean(active));
    }
    updates.push(`updated_at = now()`);

    const result = await query(
      `UPDATE support_faq SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, category, question, answer, sort_order, active, created_at, updated_at`,
      [...values, params.id]
    );
    if (result.rows.length === 0) return errorResponse('FAQ no encontrado', 404);
    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('FAQ update error:', err);
    return errorResponse('Error al actualizar FAQ', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  try {
    const result = await query('DELETE FROM support_faq WHERE id = $1', [params.id]);
    if (result.rowCount === 0) return errorResponse('FAQ no encontrado', 404);
    return successResponse({ success: true });
  } catch (err) {
    console.error('FAQ delete error:', err);
    return errorResponse('Error al eliminar FAQ', 500);
  }
}
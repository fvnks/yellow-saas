import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  try {
    const { rows } = await query(
      `SELECT id, category, question, answer, sort_order, active, created_at, updated_at
       FROM support_faq
       ORDER BY sort_order ASC, created_at ASC`
    );
    return successResponse(rows);
  } catch (err) {
    console.error('FAQ admin list error:', err);
    return errorResponse('Error al obtener FAQ', 500);
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const body = await request.json();
  const { category, question, answer, sort_order, active } = body;

  if (!question?.trim()) return errorResponse('La pregunta es requerida', 400);
  if (!answer?.trim()) return errorResponse('La respuesta es requerida', 400);

  try {
    const { rows } = await query(
      `INSERT INTO support_faq (category, question, answer, sort_order, active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, category, question, answer, sort_order, active, created_at, updated_at`,
      [category?.trim() || 'General', question.trim(), answer.trim(), sort_order || 0, active !== false]
    );
    return successResponse(rows[0], 201);
  } catch (err) {
    console.error('FAQ create error:', err);
    return errorResponse('Error al crear FAQ', 500);
  }
}
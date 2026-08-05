import { query } from '@/api/lib/db';
import { successResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { rows } = await query(
      `SELECT id, category, question, answer
       FROM support_faq
       WHERE active = true
       ORDER BY sort_order ASC, created_at ASC`
    );
    return successResponse(rows);
  } catch (err) {
    console.error('FAQ list error:', err);
    return successResponse([]);
  }
}
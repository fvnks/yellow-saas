import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);
    const url = new URL(req.url);
    const year = url.searchParams.get('year') || new Date().getFullYear().toString();
    const { rows: budgets } = await query(
      `SELECT * FROM purchase_budgets WHERE company_id = $1 AND year = $2 ORDER BY category`, [companyId, year]);
    const { rows: actual } = await query(
      `SELECT category, SUM(total_amount) as actual_amount
       FROM purchase_orders WHERE company_id = $1 AND EXTRACT(YEAR FROM created_at) = $2 AND status != 'cancelled'
       GROUP BY category`, [companyId, year]);
    const enriched = budgets.map(b => {
      const a = actual.find(av => av.category === b.category);
      return { ...b, actual_amount: a ? parseFloat(a.actual_amount) : 0, variance: b.budget_amount - (a ? parseFloat(a.actual_amount) : 0) };
    });
    return successResponse(enriched);
  } catch (e: any) { return errorResponse(e.message, 500); }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);
    const body = await req.json();
    const { category, year, month, budget_amount } = body;
    if (!category || !year) return errorResponse('category, year son requeridos', 400);
    const { rows } = await query(
      `INSERT INTO purchase_budgets (company_id, category, year, month, budget_amount)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (company_id, category, year, month) DO UPDATE SET budget_amount = $5
       RETURNING *`, [companyId, category, year, month || null, budget_amount || 0]);
    return successResponse(rows[0], 201);
  } catch (e: any) { return errorResponse(e.message, 500); }
}

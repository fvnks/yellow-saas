import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 20);
    const offset = (page - 1) * limit;
    const status = searchParams.get('status');
    const categoryId = searchParams.get('category_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const search = searchParams.get('search');

    let where = 'e.company_id = $1';
    const values: any[] = [companyId];
    let paramIndex = 2;

    if (status) { where += ` AND e.status = $${paramIndex++}`; values.push(status); }
    if (categoryId) { where += ` AND e.category_id = $${paramIndex++}`; values.push(categoryId); }
    if (dateFrom) { where += ` AND e.expense_date >= $${paramIndex++}`; values.push(dateFrom); }
    if (dateTo) { where += ` AND e.expense_date <= $${paramIndex++}`; values.push(dateTo); }
    if (search) {
      where += ` AND (e.supplier_name ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex} OR e.document_number ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM expenses e WHERE ${where}`, values);
    const total = Number(countResult.rows[0]?.total || 0);

    const result = await query(`
      SELECT e.*, ec.name as category_name, ec.color as category_color,
             cc.name as cost_center_name, cc.code as cost_center_code,
             p.full_name as created_by_name
      FROM expenses e
      LEFT JOIN expense_categories ec ON ec.id = e.category_id
      LEFT JOIN cost_centers cc ON cc.id = e.cost_center_id
      LEFT JOIN profiles p ON p.id = e.created_by
      WHERE ${where}
      ORDER BY e.expense_date DESC, e.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...values, limit, offset]);

    return successResponse({
      data: result.rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const {
      expense_date, amount, tax_amount, category_id, supplier_name, supplier_rut,
      document_type, document_number, description, notes, cost_center_id, status
    } = body;

    const totalAmount = (Number(amount) || 0) + (Number(tax_amount) || 0);
    const expenseNumber = `GAS-${Date.now().toString(36).toUpperCase()}`;

    const result = await query(`
      INSERT INTO expenses (company_id, expense_number, expense_date, amount, tax_amount, total_amount,
        category_id, supplier_name, supplier_rut, document_type, document_number, description, notes, cost_center_id, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, current_user_id())
      RETURNING *
    `, [
      companyId, expenseNumber, expense_date || new Date().toISOString().split('T')[0],
      amount || 0, tax_amount || 0, totalAmount,
      category_id, supplier_name, supplier_rut, document_type || 'ticket',
      document_number, description, notes, cost_center_id, status || 'draft'
    ]);

    return successResponse({ data: result.rows[0] }, 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

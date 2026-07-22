import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: routes } = await query(
      `SELECT dr.*, e.name as employee_name
       FROM delivery_routes dr
       LEFT JOIN employees e ON e.id = dr.employee_id
       WHERE dr.company_id = $1
       ORDER BY dr.route_date DESC, dr.created_at DESC`,
      [companyId]
    );

    return successResponse(routes);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { name, employee_id, route_date, stops } = body;

    if (!name || !employee_id || !route_date) {
      return errorResponse('name, employee_id, route_date son requeridos', 400);
    }

    const { rows } = await query(
      `INSERT INTO delivery_routes (company_id, name, employee_id, route_date, stops)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [companyId, name, employee_id, route_date, JSON.stringify(stops || [])]
    );

    return successResponse(rows[0], 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

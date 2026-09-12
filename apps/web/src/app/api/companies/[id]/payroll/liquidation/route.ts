import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { calculateTermination } from '@/lib/payroll/liquidation';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);
    if (companyId !== params.id) return errorResponse('Acceso denegado', 403);

    const body = await request.json();
    const { employee_id, termination_type, termination_date, notice_given } = body;

    if (!employee_id || !termination_type || !termination_date) {
      return errorResponse('employee_id, termination_type, and termination_date are required', 400);
    }

    const validTypes = ['despido_sin_causa', 'despido_con_causa', 'renuncia', 'mutuo_acuerdo'];
    if (!validTypes.includes(termination_type)) {
      return errorResponse('Invalid termination_type', 400);
    }

    // Validate employee belongs to this company
    const { rows: empRows } = await query(
      `SELECT id FROM employees WHERE id = $1 AND company_id = $2`,
      [employee_id, companyId]
    );
    if (!empRows[0]) return errorResponse('Empleado no encontrado en esta empresa', 404);

    const result = await calculateTermination(companyId, {
      employee_id,
      termination_type,
      termination_date,
      notice_given,
    });

    return successResponse(result);
  } catch (e: any) {
    return errorResponse(e.message || 'Internal server error', 500);
  }
}

import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT pm.*, p.full_name as user_name, p.email, p.avatar_url
       FROM project_members pm
       JOIN profiles p ON p.id = pm.user_id
       WHERE pm.project_id = $1 AND pm.company_id = $2
       ORDER BY pm.role, p.full_name`,
      [params.projectId, companyId]
    );

    return successResponse(result.rows);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { user_id, role } = body;

    if (!user_id) return errorResponse('user_id required', 400);

    const projectCheck = await query(
      'SELECT id FROM projects WHERE id = $1 AND company_id = $2',
      [params.projectId, companyId]
    );
    if (projectCheck.rows.length === 0) return errorResponse('Project not found', 404);

    const userCheck = await query(
      'SELECT id FROM profiles WHERE id = $1',
      [user_id]
    );
    if (userCheck.rows.length === 0) return errorResponse('User not found', 404);

    const result = await query(
      `INSERT INTO project_members (company_id, project_id, user_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (project_id, user_id) DO UPDATE SET role = $4
       RETURNING *`,
      [companyId, params.projectId, user_id, role || 'member']
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return errorResponse('userId required', 400);

    const result = await query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 AND company_id = $3 RETURNING id',
      [params.projectId, userId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Member not found', 404);

    return successResponse({ message: 'Member removed' });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

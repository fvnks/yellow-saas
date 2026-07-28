import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = params.id;
    const body = await request.json();
    const { module_name } = body;

    if (!module_name) {
      return errorResponse('module_name es requerido', 400);
    }

    // Check if module exists in catalog
    const catalogResult = await query(
      `SELECT * FROM module_catalog WHERE name = $1 AND is_active = true`,
      [module_name]
    );
    if (catalogResult.rows.length === 0) {
      return errorResponse('Módulo no encontrado o no disponible', 404);
    }
    const moduleInfo = catalogResult.rows[0];

    // Check if already activated
    const existingResult = await query(
      `SELECT id, status FROM module_activations WHERE company_id = $1 AND module_name = $2`,
      [companyId, module_name]
    );
    if (existingResult.rows.length > 0 && existingResult.rows[0].status === 'active') {
      return errorResponse('Módulo ya está activo', 409);
    }

    // Activate or reactivate
    const result = await query(
      `INSERT INTO module_activations (company_id, module_name, status, activated_at)
       VALUES ($1, $2, 'active', now())
       ON CONFLICT (company_id, module_name) DO UPDATE SET
         status = 'active',
         activated_at = now(),
         cancelled_at = NULL,
         expires_at = NULL
       RETURNING *`,
      [companyId, module_name]
    );

    return successResponse({
      activation: result.rows[0],
      module: {
        name: moduleInfo.name,
        label: moduleInfo.label,
        price_monthly: moduleInfo.price_monthly,
        price_yearly: moduleInfo.price_yearly,
      },
    });
  } catch (err) {
    console.error('Activate module error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = params.id;
    const { searchParams } = new URL(request.url);
    const moduleName = searchParams.get('module_name');

    if (!moduleName) {
      return errorResponse('module_name es requerido', 400);
    }

    const result = await query(
      `UPDATE module_activations SET status = 'cancelled', cancelled_at = now()
       WHERE company_id = $1 AND module_name = $2 AND status = 'active'
       RETURNING *`,
      [companyId, moduleName]
    );

    if (result.rows.length === 0) {
      return errorResponse('Módulo no encontrado o ya está inactivo', 404);
    }

    return successResponse({ activation: result.rows[0] });
  } catch (err) {
    console.error('Deactivate module error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal server error', 500);
  }
}

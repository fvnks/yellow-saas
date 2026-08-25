import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string; returnId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: returnData } = await query(
      `SELECT pr.*, s.name as supplier_name
       FROM purchase_returns pr
       JOIN suppliers s ON s.id = pr.supplier_id
       WHERE pr.id = $1 AND pr.company_id = $2`,
      [params.returnId, companyId]
    );
    if (returnData.length === 0) return errorResponse('Devolución no encontrada', 404);

    const { rows: items } = await query(
      `SELECT pri.*, p.name as product_name, p.sku
       FROM purchase_return_items pri
       LEFT JOIN products p ON p.id = pri.product_id
       WHERE pri.return_id = $1 AND pri.company_id = $2`,
      [params.returnId, companyId]
    );

    return successResponse({ ...returnData[0], items });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string; returnId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    if (body.status) {
      await query(`UPDATE purchase_returns SET status = $1, updated_at = NOW() WHERE id = $2 AND company_id = $3`, [body.status, params.returnId, companyId]);
    }

    return successResponse({ success: true });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; returnId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    await query(`DELETE FROM purchase_return_items WHERE return_id = $1 AND company_id = $2`, [params.returnId, companyId]);
    await query(`DELETE FROM purchase_returns WHERE id = $1 AND company_id = $2`, [params.returnId, companyId]);

    return successResponse({ success: true });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId } from '@/api/lib/helpers';

// GET: Fetch recent DTE purchase invoices available to link as common expense items
export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return NextResponse.json({ success: false, error: 'Company ID not found' }, { status: 400 });

    const dtesRes = await query(
      `SELECT pi.id, pi.invoice_number, pi.supplier_id, s.name as supplier_name,
              pi.total_amount, pi.invoice_date, pi.notes
       FROM purchase_invoices pi
       LEFT JOIN suppliers s ON s.id = pi.supplier_id
       WHERE pi.company_id = $1
       ORDER BY pi.invoice_date DESC
       LIMIT 30`,
      [companyId]
    );

    return NextResponse.json({ success: true, data: dtesRes.rows });
  } catch (error: any) {
    // If purchase_invoices table is not present or query fails, return empty list gracefully
    return NextResponse.json({ success: true, data: [] });
  }
}

import { NextResponse } from 'next/server';
import { query } from '@/api/lib/db';

// GET: Fetch recent DTE purchase invoices available to link as common expense items
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

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

import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(request.url);
    const month = parseInt(url.searchParams.get('month') || new Date().getMonth().toString());
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);

    const ivaCollected = await query(
      `SELECT 
        SUM(iva) as total_iva,
        COUNT(*) as invoice_count
       FROM invoices 
       WHERE company_id = $1 
         AND fecha_emision BETWEEN $2 AND $3
         ANDsii_status = 'accepted'`,
      [companyId, start, end]
    );

    const ivaPaid = await query(
      `SELECT 
        SUM(iva) as total_iva,
        COUNT(*) as invoice_count
       FROM purchase_invoices 
       WHERE company_id = $1 
         AND fecha_emision BETWEEN $2 AND $3
         AND sii_status = 'accepted'`,
      [companyId, start, end]
    );

    const igrh = await query(
      `SELECT 
        SUM(amount) as total_ingresos,
        COUNT(*) as transaction_count
       FROM income_transactions
       WHERE company_id = $1 
         AND date BETWEEN $2 AND $3`,
      [companyId, start, end]
    );

    return successResponse({
      period: { month, year, start: start.toISOString(), end: end.toISOString() },
      iva: {
        collected: ivaCollected.rows[0] || { total_iva: 0, invoice_count: 0 },
        paid: ivaPaid.rows[0] || { total_iva: 0, invoice_count: 0 },
        net_payable: (ivaCollected.rows[0]?.total_iva || 0) - (ivaPaid.rows[0]?.total_iva || 0),
      },
      igh: igrh.rows[0] || { total_ingresos: 0, transaction_count: 0 },
    });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { month, year } = body;

    if (!month || !year) {
      return errorResponse('month and year are required', 400);
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const ivaResults = await Promise.all([
      query(
        `SELECT COALESCE(SUM(iva), 0) as total FROM invoices WHERE company_id = $1 AND fecha_emision BETWEEN $2 AND $3 AND sii_status = 'accepted'`,
        [companyId, start, end]
      ),
      query(
        `SELECT COALESCE(SUM(iva), 0) as total FROM purchase_invoices WHERE company_id = $1 AND fecha_emision BETWEEN $2 AND $3 AND sii_status = 'accepted'`,
        [companyId, start, end]
      ),
    ]);

    const ivaCollected = parseInt(ivaResults[0].rows[0].total) || 0;
    const ivaPaid = parseInt(ivaResults[1].rows[0].total) || 0;
    const ivaPayable = ivaCollected - ivaPaid;

    const grossIncome = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM income_transactions 
       WHERE company_id = $1 AND date BETWEEN $2 AND $3`,
      [companyId, start, end]
    );

    const igrhRate = 8 / 100;
    const igrhPayable = parseInt(grossIncome.rows[0].total) * igrhRate;

    const results = await query(
      `INSERT INTO monthly_tax_calculations 
        (company_id, month, year, iva_collected, iva_paid, iva_payable, gross_income, igrh_rate, igrh_payable, calculated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (company_id, month, year) DO UPDATE SET
        iva_collected = EXCLUDED.iva_collected,
        iva_paid = EXCLUDED.iva_paid,
        iva_payable = EXCLUDED.iva_payable,
        gross_income = EXCLUDED.gross_income,
        igrh_payable = EXCLUDED.ighr_payable,
        updated_at = NOW()
       RETURNING *`,
      [companyId, month, year, ivaCollected, ivaPaid, ivaPayable, grossIncome.rows[0].total, igrhRate, igrhPayable]
    );

    return successResponse(results.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

import { query } from '@/api/lib/db';
import { IVA_RATE } from '@/lib/erp-config';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || new Date().toISOString().substring(0, 7);
    const [year, month] = period.split('-').map(Number);

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const [ivaCollected, ivaPaid, grossIncome, paymentProvisional] = await Promise.all([
      query(
        `SELECT COALESCE(SUM(iva), 0) as total FROM invoices 
         WHERE company_id = $1 AND fecha_emision BETWEEN $2 AND $3 AND sii_status = 'accepted'`,
        [companyId, start, end]
      ),
      query(
        `SELECT COALESCE(SUM(iva), 0) as total FROM purchase_invoices 
         WHERE company_id = $1 AND fecha_emision BETWEEN $2 AND $3 AND sii_status = 'accepted'`,
        [companyId, start, end]
      ),
      query(
        `SELECT COALESCE(SUM(amount), 0) as total FROM income_transactions 
         WHERE company_id = $1 AND date BETWEEN $2 AND $3`,
        [companyId, start, end]
      ),
      query(
        `SELECT COALESCE(SUM(amount), 0) as total FROM expenses 
         WHERE company_id = $1 AND date BETWEEN $2 AND $3`,
        [companyId, start, end]
      ),
    ]);

    const ivaCollectedAmount = parseInt(ivaCollected.rows[0].total) || 0;
    const ivaPaidAmount = parseInt(ivaPaid.rows[0].total) || 0;
    const netIVA = ivaCollectedAmount - ivaPaidAmount;
    const grossIncomeAmount = parseInt(grossIncome.rows[0].total) || 0;
    const expensesAmount = parseInt(paymentProvisional.rows[0].total) || 0;

    const ppmRate = 1.5 / 100;
    const ppmAmount = Math.floor(grossIncomeAmount * ppmRate);

    const igrhRate = 8 / 100;
    const igrhPayable = Math.floor(grossIncomeAmount * igrhRate);

    const totalPayable = Math.max(0, netIVA) + ppmAmount + igrhPayable;

    return successResponse({
      period,
      summary: {
        debitIva: ivaCollectedAmount,
        creditIva: ivaPaidAmount,
        netIVA,
        grossIncome: grossIncomeAmount,
        expenses: expensesAmount,
        ppmAmount,
        igrhPayable,
        totalF29Payable: totalPayable,
        totalSalesNet: ivaCollectedAmount / (1 + IVA_RATE),
        totalPurchasesNet: ivaPaidAmount / (1 + IVA_RATE),
      },
      linesSII: [
        { code: '001', description: 'Ventas Netas del Período', amount: ivaCollectedAmount / (1 + IVA_RATE) },
        { code: '010', description: 'IVA Débito Fiscal (19%)', amount: ivaCollectedAmount },
        { code: '020', description: 'Compras Netas del Período', amount: ivaPaidAmount / (1 + IVA_RATE) },
        { code: '030', description: 'IVA Crédito Fiscal (19%)', amount: ivaPaidAmount },
        { code: '091', description: 'IVA a Pagar / (Crédito)', amount: netIVA },
        { code: '110', description: 'PPM 1.5% sobre Ingresos', amount: ppmAmount },
        { code: '120', description: 'IGRH 8% sobre Ingresos', amount: igrhPayable },
        { code: '999', description: 'TOTAL A PAGAR', amount: totalPayable },
      ],
    });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

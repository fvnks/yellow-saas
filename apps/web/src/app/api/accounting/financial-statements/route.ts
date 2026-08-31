import { NextResponse } from 'next/server';
import { query } from '@/api/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';
    const period = searchParams.get('period') || '2026-03';

    const mockBalance = [
      { code: '1.1.01', name: 'Caja', debit_before: 500000, credit_before: 0, debit_period: 2500000, credit_period: 2100000, debit_balance: 900000, credit_balance: 0, debit_result: 0, credit_result: 0 },
      { code: '1.1.02', name: 'Banco Estado Cta Cte', debit_before: 14500000, credit_before: 0, debit_period: 3850000, credit_period: 12900000, debit_balance: 5450000, credit_balance: 0, debit_result: 0, credit_result: 0 },
      { code: '1.1.03', name: 'Clientes por Cobrar', debit_before: 8200000, credit_before: 0, debit_period: 6050000, credit_period: 3850000, debit_balance: 10400000, credit_balance: 0, debit_result: 0, credit_result: 0 },
      { code: '1.2.01', name: 'Mercaderías', debit_before: 22000000, credit_before: 0, debit_period: 5600000, credit_period: 4200000, debit_balance: 23400000, credit_balance: 0, debit_result: 0, credit_result: 0 },
      { code: '1.3.01', name: 'Activo Fijo Neto', debit_before: 39071429, credit_before: 0, debit_period: 0, credit_period: 521429, debit_balance: 38550000, credit_balance: 0, debit_result: 0, credit_result: 0 },
      { code: '2.1.01', name: 'Proveedores', debit_before: 0, credit_before: 6800000, debit_period: 3200000, credit_period: 4500000, debit_balance: 0, credit_balance: 8100000, debit_result: 0, credit_result: 0 },
      { code: '2.1.02', name: 'IVA Débito Fiscal', debit_before: 0, credit_before: 1200000, debit_period: 1200000, credit_period: 406975, debit_balance: 0, credit_balance: 406975, debit_result: 0, credit_result: 0 },
      { code: '2.1.03', name: 'Remuneraciones por Pagar', debit_before: 0, credit_before: 8500000, debit_period: 8500000, credit_period: 8800000, debit_balance: 0, credit_balance: 8800000, debit_result: 0, credit_result: 0 },
      { code: '3.1.01', name: 'Capital', debit_before: 0, credit_before: 50000000, debit_period: 0, credit_period: 0, debit_balance: 0, credit_balance: 50000000, debit_result: 0, credit_result: 0 },
      { code: '3.1.02', name: 'Resultados Acumulados', debit_before: 0, credit_before: 17771429, debit_period: 0, credit_period: 0, debit_balance: 0, credit_balance: 17771429, debit_result: 0, credit_result: 0 },
      { code: '4.1.01', name: 'Ventas Nacionales', debit_before: 0, credit_before: 0, debit_period: 0, credit_period: 2562857, debit_balance: 0, credit_balance: 0, debit_result: 0, credit_result: 2562857 },
      { code: '5.1.01', name: 'Costo de Ventas', debit_before: 0, credit_before: 0, debit_period: 1680000, credit_period: 0, debit_balance: 0, credit_balance: 0, debit_result: 1680000, credit_result: 0 },
      { code: '5.2.01', name: 'Remuneraciones', debit_before: 0, credit_before: 0, debit_period: 8800000, credit_period: 0, debit_balance: 0, credit_balance: 0, debit_result: 8800000, credit_result: 0 },
      { code: '5.2.02', name: 'Depreciación', debit_before: 0, credit_before: 0, debit_period: 521429, credit_period: 0, debit_balance: 0, credit_balance: 0, debit_result: 521429, credit_result: 0 },
      { code: '5.3.01', name: 'Gastos Generales', debit_before: 0, credit_before: 0, debit_period: 940000, credit_period: 0, debit_balance: 0, credit_balance: 0, debit_result: 940000, credit_result: 0 }
    ];

    const incomeStatement = {
      revenue: 2562857,
      cost_of_sales: 1680000,
      gross_profit: 882857,
      operating_expenses: {
        salaries: 8800000,
        depreciation: 521429,
        general: 940000,
        total: 10261429
      },
      operating_income: -9378572,
      period
    };

    return NextResponse.json({
      success: true,
      balance: mockBalance,
      income_statement: incomeStatement
    });
  } catch (error: any) {
    console.error('Error generating financial statements:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

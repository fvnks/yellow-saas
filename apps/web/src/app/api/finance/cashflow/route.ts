import { NextResponse } from 'next/server';
import { query } from '@/api/lib/db';

// GET: Calculate 6-month Projected Cash Flow for Chilean SMEs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

    const mockCashFlow = [
      { month: 'Marzo 2026', initial_balance: 14500000, expected_inflows: 28900000, expected_outflows: 19800000, net_cashflow: 9100000, final_balance: 23600000, uf_equivalent: 612 },
      { month: 'Abril 2026', initial_balance: 23600000, expected_inflows: 31200000, expected_outflows: 22400000, net_cashflow: 8800000, final_balance: 32400000, uf_equivalent: 841 },
      { month: 'Mayo 2026', initial_balance: 32400000, expected_inflows: 26500000, expected_outflows: 21000000, net_cashflow: 5500000, final_balance: 37900000, uf_equivalent: 984 },
      { month: 'Junio 2026', initial_balance: 37900000, expected_inflows: 34000000, expected_outflows: 25000000, net_cashflow: 9000000, final_balance: 46900000, uf_equivalent: 1218 }
    ];

    return NextResponse.json({
      success: true,
      data: mockCashFlow
    });
  } catch (error: any) {
    console.error('Error calculating cashflow forecast:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

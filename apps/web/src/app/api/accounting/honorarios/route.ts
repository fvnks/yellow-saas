import { NextResponse } from 'next/server';
import { query } from '@/api/lib/db';

// GET: Fetch Electronic Fee Receipts (Boletas de Honorarios BHE SII) & 13.75% Tax Retentions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

    const mockBHE = [
      {
        id: 'bhe-001',
        folio_bhe: '1042',
        issuer_name: 'Francisco Javier Valenzuela',
        issuer_rut: '16.543.210-9',
        issue_date: '2026-03-01',
        gross_amount_clp: 1000000,
        retention_rate: '13.75%',
        retention_amount_clp: 137500,
        net_amount_clp: 862500,
        retention_payer: 'empresa', // Empresa retiene e ingresa al F29
        status: 'vigente'
      },
      {
        id: 'bhe-002',
        folio_bhe: '589',
        issuer_name: 'Andrea Lucía Morales',
        issuer_rut: '15.987.654-2',
        issue_date: '2026-03-02',
        gross_amount_clp: 650000,
        retention_rate: '13.75%',
        retention_amount_clp: 89375,
        net_amount_clp: 560625,
        retention_payer: 'empresa',
        status: 'vigente'
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockBHE
    });
  } catch (error: any) {
    console.error('Error fetching BHE honorarios data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

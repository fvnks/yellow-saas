import { NextResponse } from 'next/server';
import { query } from '@/api/lib/db';

// GET: Fetch Import Declarations (DIN Aduanas Chile) & Landed Cost History
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

    const mockImports = [
      {
        id: 'din-2026-001',
        din_number: '1890245-8',
        supplier_name: 'Shenzhen Tech Exports Co. Ltd.',
        country_origin: 'China',
        fob_usd: 25000,
        freight_usd: 3500,
        insurance_usd: 500,
        cif_usd: 29000,
        exchange_rate_clp: 950,
        cif_clp: 27550000,
        ad_valorem_clp: 1653000, // 6% CIF
        iva_import_clp: 5548570, // 19% (CIF + AdValorem)
        customs_agent_clp: 450000,
        port_terminal_clp: 280000,
        total_landed_cost_clp: 29933000,
        landed_cost_factor: 1.259, // 25.9% extra cost on FOB
        status: 'nacionalizado'
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockImports
    });
  } catch (error: any) {
    console.error('Error fetching import declarations:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { query } from '@/api/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

    const mockAssets = [
      {
        id: 'af-001',
        code: 'AF-2024-001',
        description: 'Camioneta Hyundai Porter H100 2024',
        category: 'Vehículos',
        acquisition_date: '2024-06-15',
        acquisition_cost_clp: 14500000,
        useful_life_years: 7,
        depreciation_method: 'lineal',
        monthly_depreciation: 172619,
        accumulated_depreciation: 3625000,
        book_value: 10875000,
        sii_vida_util: 7,
        status: 'activo'
      },
      {
        id: 'af-002',
        code: 'AF-2023-005',
        description: 'Servidor Dell PowerEdge R750 + UPS',
        category: 'Equipos Computacionales',
        acquisition_date: '2023-01-10',
        acquisition_cost_clp: 8200000,
        useful_life_years: 6,
        depreciation_method: 'lineal',
        monthly_depreciation: 113889,
        accumulated_depreciation: 4441667,
        book_value: 3758333,
        sii_vida_util: 6,
        status: 'activo'
      },
      {
        id: 'af-003',
        code: 'AF-2022-012',
        description: 'Maquinaria Industrial Prensa Hidráulica 50T',
        category: 'Maquinaria',
        acquisition_date: '2022-03-20',
        acquisition_cost_clp: 32000000,
        useful_life_years: 15,
        depreciation_method: 'lineal',
        monthly_depreciation: 177778,
        accumulated_depreciation: 8533333,
        book_value: 23466667,
        sii_vida_util: 15,
        status: 'activo'
      },
      {
        id: 'af-004',
        code: 'AF-2020-003',
        description: 'Mobiliario Oficina Gerencia (escritorios, sillas)',
        category: 'Muebles y Útiles',
        acquisition_date: '2020-08-01',
        acquisition_cost_clp: 4800000,
        useful_life_years: 7,
        depreciation_method: 'lineal',
        monthly_depreciation: 57143,
        accumulated_depreciation: 3828571,
        book_value: 971429,
        sii_vida_util: 7,
        status: 'activo'
      }
    ];

    const summary = {
      total_assets: mockAssets.length,
      total_acquisition_cost: mockAssets.reduce((s, a) => s + a.acquisition_cost_clp, 0),
      total_accumulated_depreciation: mockAssets.reduce((s, a) => s + a.accumulated_depreciation, 0),
      total_book_value: mockAssets.reduce((s, a) => s + a.book_value, 0),
      monthly_depreciation_expense: mockAssets.reduce((s, a) => s + a.monthly_depreciation, 0)
    };

    return NextResponse.json({
      success: true,
      data: mockAssets,
      summary
    });
  } catch (error: any) {
    console.error('Error fetching fixed assets:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

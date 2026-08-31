import { NextResponse } from 'next/server';
import { query } from '@/api/lib/db';

// GET: Fetch Production Work Orders (BOM / Recetas)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

    const mockOrders = [
      {
        id: 'op-2026-001',
        order_number: 'OP-104',
        product_name: 'Pan de Molde Artesanal 500g (Lote 100u)',
        bom_name: 'Fórmula Estándar Panadería V2',
        target_quantity: 100,
        produced_quantity: 98,
        waste_quantity: 2,
        cost_per_unit_clp: 1250,
        total_cost_clp: 122500,
        status: 'completada',
        start_date: '2026-03-01',
        end_date: '2026-03-01'
      },
      {
        id: 'op-2026-002',
        order_number: 'OP-105',
        product_name: 'Detergente Industrial Concentrado 5L',
        bom_name: 'Fórmula Química Químicos del Sur',
        target_quantity: 50,
        produced_quantity: 0,
        waste_quantity: 0,
        cost_per_unit_clp: 4500,
        total_cost_clp: 225000,
        status: 'en_proceso',
        start_date: '2026-03-02',
        end_date: null
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockOrders
    });
  } catch (error: any) {
    console.error('Error fetching production orders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

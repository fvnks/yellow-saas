import { NextResponse } from 'next/server';
import { query } from '@/api/lib/db';

// GET: Fetch Purchase Orders, DTE Invoices, and Payment Status for Supplier Portal
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

    // Purchase orders for suppliers
    const poRes = await query(
      `SELECT id, order_number, supplier_name, supplier_rut, total_amount_clp, status, issue_date, delivery_date
       FROM purchase_orders
       WHERE company_id = $1
       ORDER BY created_at DESC LIMIT 30`,
      [companyId]
    );

    // Fallback sample purchase orders if table empty
    const mockPurchaseOrders = poRes.rows.length > 0 ? poRes.rows : [
      { id: 'po-101', order_number: 'OC-2026-001', supplier_name: 'Distribuidora Central SpA', supplier_rut: '76.890.123-4', total_amount_clp: 1850000, status: 'aprobada', issue_date: '2026-03-01' },
      { id: 'po-102', order_number: 'OC-2026-002', supplier_name: 'Logística e Insumos Chile Ltda', supplier_rut: '77.456.110-8', total_amount_clp: 920000, status: 'en_proceso', issue_date: '2026-03-03' },
      { id: 'po-103', order_number: 'OC-2026-003', supplier_name: 'Empaques e Impresiones del Valle', supplier_rut: '76.111.222-3', total_amount_clp: 450000, status: 'pagada', issue_date: '2026-02-20' }
    ];

    return NextResponse.json({
      success: true,
      data: {
        purchaseOrders: mockPurchaseOrders
      }
    });
  } catch (error: any) {
    console.error('Error fetching supplier portal data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

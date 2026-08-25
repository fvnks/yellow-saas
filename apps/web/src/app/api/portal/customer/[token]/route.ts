import { query } from '@/api/lib/db';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { rows: customers } = await query(
      `SELECT id, name, trade_name, tax_id, email
       FROM customers
       WHERE portal_token = $1 AND portal_enabled = true`,
      [params.token]
    );

    if (customers.length === 0) {
      return NextResponse.json({ error: 'Portal no encontrado' }, { status: 404 });
    }

    const customer = customers[0];

    const { rows: orders } = await query(
      `SELECT so.id, so.order_number, so.status, so.total, so.created_at,
              json_agg(json_build_object(
                'product_name', p.name,
                'quantity', sod.quantity,
                'unit_price', sod.unit_price
              )) as items
       FROM sales_orders so
       LEFT JOIN sales_order_items sod ON sod.sales_order_id = so.id
       LEFT JOIN products p ON p.id = sod.product_id
       WHERE so.customer_id = $1
       GROUP BY so.id, so.order_number, so.status, so.total, so.created_at
       ORDER BY so.created_at DESC`,
      [customer.id]
    );

    const { rows: invoices } = await query(
      `SELECT id, invoice_number, status, total_amount as total, created_at
       FROM invoices
       WHERE customer_id = $1
       ORDER BY created_at DESC`,
      [customer.id]
    );

    return NextResponse.json({
      customer: {
        name: customer.name,
        trade_name: customer.trade_name,
        tax_id: customer.tax_id,
        email: customer.email,
      },
      orders: orders.map(o => ({
        order_number: o.order_number,
        status: o.status,
        total: o.total,
        created_at: o.created_at,
        items_summary: o.items?.filter((i: any) => i.product_name).map((i: any) =>
          `${i.quantity}x ${i.product_name}`
        ) || [],
      })),
      invoices: invoices.map(i => ({
        invoice_number: i.invoice_number,
        status: i.status,
        total: i.total,
        created_at: i.created_at,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Error al cargar datos del portal' }, { status: 500 });
  }
}

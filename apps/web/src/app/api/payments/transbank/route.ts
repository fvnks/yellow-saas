import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

    const mockTransactions = [
      {
        id: 'tbk-001',
        buy_order: 'ORD-2026-1092',
        authorization_code: '1213',
        payment_type: 'VD',
        payment_type_label: 'Débito Redcompra',
        amount: 2000000,
        installments: 1,
        card_last4: '6623',
        commerce_code: '597055555532',
        status: 'autorizada',
        response_code: 0,
        transaction_date: '2026-03-05T14:22:00',
        customer_name: 'Inmobiliaria Los Arrayanes SpA',
        dte_folio: 1092
      },
      {
        id: 'tbk-002',
        buy_order: 'ORD-2026-POS-5890',
        authorization_code: '8841',
        payment_type: 'VN',
        payment_type_label: 'Crédito sin cuotas',
        amount: 50000,
        installments: 1,
        card_last4: '4412',
        commerce_code: '597055555532',
        status: 'autorizada',
        response_code: 0,
        transaction_date: '2026-03-10T11:05:00',
        customer_name: 'Juan Pérez Soto',
        dte_folio: 5890
      },
      {
        id: 'tbk-003',
        buy_order: 'ORD-2026-1095',
        authorization_code: '3309',
        payment_type: 'VC',
        payment_type_label: 'Crédito en cuotas',
        amount: 1200000,
        installments: 3,
        card_last4: '7781',
        commerce_code: '597055555532',
        status: 'autorizada',
        response_code: 0,
        transaction_date: '2026-03-12T16:40:00',
        customer_name: 'Constructora Pacífico SpA',
        dte_folio: 1095
      },
      {
        id: 'tbk-004',
        buy_order: 'ORD-2026-1098',
        authorization_code: null,
        payment_type: 'VD',
        payment_type_label: 'Débito Redcompra',
        amount: 340000,
        installments: 1,
        card_last4: '2209',
        commerce_code: '597055555532',
        status: 'rechazada',
        response_code: -1,
        transaction_date: '2026-03-14T09:18:00',
        customer_name: 'Servicios Integrales Ltda',
        dte_folio: null
      }
    ];

    const summary = {
      authorized_count: mockTransactions.filter((t) => t.status === 'autorizada').length,
      authorized_amount: mockTransactions.filter((t) => t.status === 'autorizada').reduce((s, t) => s + t.amount, 0),
      rejected_count: mockTransactions.filter((t) => t.status === 'rechazada').length,
      rejected_amount: mockTransactions.filter((t) => t.status === 'rechazada').reduce((s, t) => s + t.amount, 0)
    };

    return NextResponse.json({ success: true, data: mockTransactions, summary });
  } catch (error: any) {
    console.error('Error fetching Transbank transactions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = Number(body.amount) || 10000;
    const buyOrder = `ORD-${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: `Sesión Webpay Plus iniciada. Orden ${buyOrder} por ${amount} CLP.`,
      data: {
        token: `token_demo_${Date.now()}`,
        url: 'https://webpay3gint.transbank.cl/webpayserver/initTransaction',
        buy_order: buyOrder,
        amount,
        status: 'iniciada'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

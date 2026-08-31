import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

    const mockCessions = [
      {
        id: 'ces-001',
        invoice_folio: 1092,
        dte_type: 33,
        customer_name: 'Inmobiliaria Los Arrayanes SpA',
        customer_rut: '76.990.111-2',
        invoice_amount: 2000000,
        factoring_house: 'Tanner Factoring S.A.',
        factoring_rut: '96.666.140-2',
        advance_rate: 0.85,
        advance_amount: 1700000,
        commission_rate: 0.018,
        commission_amount: 36000,
        net_received: 1664000,
        cession_date: '2026-03-06',
        due_date: '2026-04-05',
        status: 'cedida',
        aec_status: 'enviado_sii'
      },
      {
        id: 'ces-002',
        invoice_folio: 1093,
        dte_type: 33,
        customer_name: 'Consultores & Asesores Ltda',
        customer_rut: '77.333.444-9',
        invoice_amount: 1000000,
        factoring_house: 'Banco Estado Factoring',
        factoring_rut: '97.030.000-7',
        advance_rate: 0.80,
        advance_amount: 800000,
        commission_rate: 0.022,
        commission_amount: 22000,
        net_received: 778000,
        cession_date: '2026-03-10',
        due_date: '2026-04-08',
        status: 'en_evaluacion',
        aec_status: 'pendiente'
      },
      {
        id: 'ces-003',
        invoice_folio: 1088,
        dte_type: 33,
        customer_name: 'Constructora Pacífico SpA',
        customer_rut: '76.555.888-1',
        invoice_amount: 8500000,
        factoring_house: 'Tanner Factoring S.A.',
        factoring_rut: '96.666.140-2',
        advance_rate: 0.88,
        advance_amount: 7480000,
        commission_rate: 0.015,
        commission_amount: 127500,
        net_received: 7352500,
        cession_date: '2026-02-20',
        due_date: '2026-03-22',
        status: 'cobrada',
        aec_status: 'aceptado_sii'
      }
    ];

    const summary = {
      total_ceded: mockCessions.reduce((s, c) => s + c.invoice_amount, 0),
      total_advanced: mockCessions.reduce((s, c) => s + c.advance_amount, 0),
      total_commission: mockCessions.reduce((s, c) => s + c.commission_amount, 0),
      total_net_received: mockCessions.reduce((s, c) => s + c.net_received, 0),
      active_count: mockCessions.filter((c) => c.status !== 'cobrada').length
    };

    return NextResponse.json({ success: true, data: mockCessions, summary });
  } catch (error: any) {
    console.error('Error fetching factoring cessions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const invoiceAmount = Number(body.invoice_amount) || 1000000;
    const advanceRate = Number(body.advance_rate) || 0.85;
    const commissionRate = Number(body.commission_rate) || 0.018;
    const advanceAmount = Math.round(invoiceAmount * advanceRate);
    const commissionAmount = Math.round(invoiceAmount * commissionRate);

    const newCession = {
      id: `ces-${Date.now()}`,
      invoice_folio: Number(body.invoice_folio) || 1000,
      dte_type: 33,
      customer_name: body.customer_name || 'Cliente SpA',
      customer_rut: body.customer_rut || '76.123.456-7',
      invoice_amount: invoiceAmount,
      factoring_house: body.factoring_house || 'Tanner Factoring S.A.',
      factoring_rut: body.factoring_rut || '96.666.140-2',
      advance_rate: advanceRate,
      advance_amount: advanceAmount,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      net_received: advanceAmount - commissionAmount,
      cession_date: new Date().toISOString().substring(0, 10),
      due_date: body.due_date || new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      status: 'en_evaluacion',
      aec_status: 'pendiente'
    };

    return NextResponse.json({
      success: true,
      message: `Cesión AEC de Factura N° ${newCession.invoice_folio} enviada a ${newCession.factoring_house}.`,
      data: newCession
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

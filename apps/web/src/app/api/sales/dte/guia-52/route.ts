import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

    const mockGuides = [
      {
        id: 'g52-001',
        folio: 8801,
        date: '2026-03-05',
        customer_name: 'Inmobiliaria Los Arrayanes SpA',
        customer_rut: '76.990.111-2',
        destination: 'Av. Las Condes 12450, Las Condes',
        items_count: 12,
        net_amount: 1680672,
        iva_amount: 319328,
        total_amount: 2000000,
        transfer_type: '1',
        transfer_label: 'Operación constituye venta',
        referenced_invoice: 1092,
        sii_status: 'aceptado',
        dispatch_status: 'entregado'
      },
      {
        id: 'g52-002',
        folio: 8802,
        date: '2026-03-08',
        customer_name: 'Consultores & Asesores Ltda',
        customer_rut: '77.333.444-9',
        destination: 'Av. Providencia 2150, Providencia',
        items_count: 4,
        net_amount: 840336,
        iva_amount: 159664,
        total_amount: 1000000,
        transfer_type: '2',
        transfer_label: 'Ventas por efectuar',
        referenced_invoice: null,
        sii_status: 'aceptado',
        dispatch_status: 'en_transito'
      },
      {
        id: 'g52-003',
        folio: 8803,
        date: '2026-03-12',
        customer_name: 'Bodega Central Yellow House',
        customer_rut: '76.000.001-K',
        destination: 'Camino Lo Echevers 1234, Quilicura',
        items_count: 48,
        net_amount: 0,
        iva_amount: 0,
        total_amount: 0,
        transfer_type: '5',
        transfer_label: 'Traslados internos',
        referenced_invoice: null,
        sii_status: 'aceptado',
        dispatch_status: 'entregado'
      }
    ];

    return NextResponse.json({ success: true, data: mockGuides });
  } catch (error: any) {
    console.error('Error fetching DTE 52 guides:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const folio = Math.floor(8800 + Math.random() * 1000);
    const newGuide = {
      id: `g52-${Date.now()}`,
      folio,
      date: new Date().toISOString().substring(0, 10),
      customer_name: body.customer_name || 'Cliente SpA',
      customer_rut: body.customer_rut || '76.123.456-7',
      destination: body.destination || 'Santiago, Chile',
      items_count: Number(body.items_count) || 1,
      net_amount: Number(body.net_amount) || 0,
      iva_amount: Math.round((Number(body.net_amount) || 0) * 0.19),
      total_amount: Math.round((Number(body.net_amount) || 0) * 1.19),
      transfer_type: body.transfer_type || '1',
      transfer_label: body.transfer_label || 'Operación constituye venta',
      referenced_invoice: body.referenced_invoice || null,
      sii_status: 'aceptado',
      dispatch_status: 'pendiente'
    };

    return NextResponse.json({
      success: true,
      message: `Guía de Despacho Electrónica DTE 52 N° ${folio} timbrada ante el SII.`,
      data: newGuide
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

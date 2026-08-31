import { NextResponse } from 'next/server';
import { query } from '@/api/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';
    const period = searchParams.get('period') || '2026-03';

    const mockSalesBook = [
      {
        id: 'lv-001',
        dte_type: 33,
        dte_type_label: 'Factura Electrónica',
        folio: 1092,
        date: '2026-03-05',
        customer_rut: '76.990.111-2',
        customer_name: 'Inmobiliaria Los Arrayanes SpA',
        exempt_amount: 0,
        net_amount: 1680672,
        iva_amount: 319328,
        total_amount: 2000000,
        rcv_status: 'registro',
        sii_status: 'aceptado'
      },
      {
        id: 'lv-002',
        dte_type: 33,
        dte_type_label: 'Factura Electrónica',
        folio: 1093,
        date: '2026-03-08',
        customer_rut: '77.333.444-9',
        customer_name: 'Consultores & Asesores Ltda',
        exempt_amount: 0,
        net_amount: 840336,
        iva_amount: 159664,
        total_amount: 1000000,
        rcv_status: 'registro',
        sii_status: 'aceptado'
      },
      {
        id: 'lv-003',
        dte_type: 39,
        dte_type_label: 'Boleta Electrónica',
        folio: 5890,
        date: '2026-03-10',
        customer_rut: '12.345.678-5',
        customer_name: 'Juan Pérez Soto',
        exempt_amount: 0,
        net_amount: 42017,
        iva_amount: 7983,
        total_amount: 50000,
        rcv_status: 'registro',
        sii_status: 'aceptado'
      },
      {
        id: 'lv-004',
        dte_type: 61,
        dte_type_label: 'Nota de Crédito Electrónica',
        folio: 201,
        date: '2026-03-12',
        customer_rut: '76.990.111-2',
        customer_name: 'Inmobiliaria Los Arrayanes SpA',
        exempt_amount: 0,
        net_amount: -420168,
        iva_amount: -79832,
        total_amount: -500000,
        rcv_status: 'registro',
        sii_status: 'aceptado'
      },
      {
        id: 'lv-005',
        dte_type: 34,
        dte_type_label: 'Factura Exenta Electrónica',
        folio: 310,
        date: '2026-03-15',
        customer_rut: '78.100.200-K',
        customer_name: 'Fundación Educacional Nacional',
        exempt_amount: 3500000,
        net_amount: 0,
        iva_amount: 0,
        total_amount: 3500000,
        rcv_status: 'registro',
        sii_status: 'aceptado'
      }
    ];

    const totals = {
      total_exempt: mockSalesBook.reduce((s, r) => s + r.exempt_amount, 0),
      total_net: mockSalesBook.reduce((s, r) => s + r.net_amount, 0),
      total_iva: mockSalesBook.reduce((s, r) => s + r.iva_amount, 0),
      total_amount: mockSalesBook.reduce((s, r) => s + r.total_amount, 0),
      document_count: mockSalesBook.length,
      period
    };

    return NextResponse.json({
      success: true,
      data: mockSalesBook,
      totals
    });
  } catch (error: any) {
    console.error('Error fetching sales book:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

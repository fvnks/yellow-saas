import { NextResponse } from 'next/server';
import { query } from '@/api/lib/db';

// GET: Fetch Active Recurring Billing Contracts & Auto-DTE Execution
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

    const mockContracts = [
      {
        id: 'rec-001',
        contract_name: 'Mantenimiento Mensual Servidores & TI',
        customer_name: 'Inmobiliaria Los Arrayanes SpA',
        customer_rut: '76.990.111-2',
        frequency: 'mensual',
        billing_day: 5,
        next_billing_date: '2026-04-05',
        amount_clp: 450000,
        dte_type: 'factura_electronica',
        auto_send_email: true,
        status: 'activo'
      },
      {
        id: 'rec-002',
        contract_name: 'Arriendo de Impresoras & Servicio Técnico',
        customer_name: 'Consultores & Asesores Ltda',
        customer_rut: '77.333.444-9',
        frequency: 'mensual',
        billing_day: 1,
        next_billing_date: '2026-04-01',
        amount_clp: 180000,
        dte_type: 'factura_electronica',
        auto_send_email: true,
        status: 'activo'
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockContracts
    });
  } catch (error: any) {
    console.error('Error fetching recurring contracts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

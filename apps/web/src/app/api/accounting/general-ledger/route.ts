import { NextResponse } from 'next/server';
import { query } from '@/api/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';
    const accountCode = searchParams.get('account') || '1.1.01';
    const period = searchParams.get('period') || '2026-03';

    const mockLedger = [
      {
        id: 'lm-001',
        date: '2026-03-01',
        journal_entry: 'AC-2026-0301',
        description: 'Saldo Apertura Marzo 2026',
        debit: 14500000,
        credit: 0,
        balance: 14500000,
        cost_center: 'General'
      },
      {
        id: 'lm-002',
        date: '2026-03-05',
        journal_entry: 'AC-2026-0305',
        description: 'Cobro Factura N° 1092 - Inmobiliaria Los Arrayanes',
        debit: 2000000,
        credit: 0,
        balance: 16500000,
        cost_center: 'Ventas'
      },
      {
        id: 'lm-003',
        date: '2026-03-08',
        journal_entry: 'AC-2026-0308',
        description: 'Pago Proveedor OC-451 Químicos del Sur',
        debit: 0,
        credit: 3200000,
        balance: 13300000,
        cost_center: 'Compras'
      },
      {
        id: 'lm-004',
        date: '2026-03-12',
        journal_entry: 'AC-2026-0312',
        description: 'Pago Remuneraciones Marzo 2026',
        debit: 0,
        credit: 8500000,
        balance: 4800000,
        cost_center: 'RRHH'
      },
      {
        id: 'lm-005',
        date: '2026-03-15',
        journal_entry: 'AC-2026-0315',
        description: 'Cobro Boletas POS Terminal Transbank',
        debit: 1850000,
        credit: 0,
        balance: 6650000,
        cost_center: 'Ventas'
      },
      {
        id: 'lm-006',
        date: '2026-03-20',
        journal_entry: 'AC-2026-0320',
        description: 'Pago F29 IVA Período Febrero 2026',
        debit: 0,
        credit: 1200000,
        balance: 5450000,
        cost_center: 'Tributario'
      }
    ];

    const accountInfo = {
      code: accountCode,
      name: 'Banco Estado Cta Cte',
      type: 'Activo Circulante',
      period,
      opening_balance: 14500000,
      total_debit: mockLedger.reduce((s, r) => s + r.debit, 0),
      total_credit: mockLedger.reduce((s, r) => s + r.credit, 0),
      closing_balance: mockLedger[mockLedger.length - 1]?.balance || 0
    };

    return NextResponse.json({
      success: true,
      data: mockLedger,
      account: accountInfo
    });
  } catch (error: any) {
    console.error('Error fetching general ledger:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

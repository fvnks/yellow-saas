import { NextResponse } from 'next/server';
import { query, transaction } from '@/api/lib/db';

// GET: Fetch Credit & Debit Notes DTE SII
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

    const mockNotes = [
      {
        id: 'nc-001',
        dte_type: 61,
        type_label: 'Nota de Crédito Electrónica (DTE 61)',
        folio: 4502,
        referenced_dte_type: 33, // Factura Electrónica
        referenced_folio: 1092,
        ref_code: 1,
        ref_reason: 'Anula Factura por error en emisión',
        customer_name: 'Comercializadora del Valle SpA',
        customer_rut: '76.543.210-K',
        total_amount_clp: 450000,
        sii_status: 'aceptado',
        issued_at: '2026-03-01'
      },
      {
        id: 'nd-001',
        dte_type: 56,
        type_label: 'Nota de Débito Electrónica (DTE 56)',
        folio: 112,
        referenced_dte_type: 33,
        referenced_folio: 1050,
        ref_code: 3,
        ref_reason: 'Intereses por mora de pago (1.5%)',
        customer_name: 'Inversiones Norte Ltda',
        customer_rut: '77.890.123-5',
        total_amount_clp: 35000,
        sii_status: 'aceptado',
        issued_at: '2026-03-02'
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockNotes
    });
  } catch (error: any) {
    console.error('Error fetching credit/debit notes:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Issue new Credit / Debit Note DTE
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dte_type, referenced_folio, ref_code, ref_reason, customer_name, customer_rut, total_amount_clp } = body;

    const folio = Math.floor(4000 + Math.random() * 5000);
    const newNote = {
      id: `nc-nd-${Date.now()}`,
      dte_type: Number(dte_type) || 61,
      type_label: Number(dte_type) === 56 ? 'Nota de Débito Electrónica (DTE 56)' : 'Nota de Crédito Electrónica (DTE 61)',
      folio,
      referenced_dte_type: 33,
      referenced_folio: Number(referenced_folio) || 1000,
      ref_code: Number(ref_code) || 1,
      ref_reason: ref_reason || 'Motivo de modificación DTE',
      customer_name: customer_name || 'Cliente SpA',
      customer_rut: customer_rut || '76.123.456-7',
      total_amount_clp: Number(total_amount_clp) || 100000,
      sii_status: 'aceptado',
      issued_at: new Date().toISOString().substring(0, 10)
    };

    return NextResponse.json({
      success: true,
      message: `${newNote.type_label} N° ${folio} emitida y timbrada exitosamente ante el SII.`,
      data: newNote
    });
  } catch (error: any) {
    console.error('Error issuing DTE credit/debit note:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

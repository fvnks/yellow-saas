import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(req.url);
    const customerId = url.searchParams.get('customerId');

    if (!customerId) return errorResponse('customerId is required', 400);

    const { rows: customer } = await query(
      `SELECT id, name, tax_id, email, phone, address, city, credit_limit
       FROM customers WHERE id = $1 AND company_id = $2`,
      [customerId, companyId]
    );
    if (customer.length === 0) return errorResponse('Cliente no encontrado', 404);

    const { rows: invoices } = await query(
      `SELECT id, invoice_number, total_amount, paid_amount,
        total_amount - paid_amount as balance,
        invoice_date, due_date, status,
        CASE WHEN status = 'paid' THEN 'Pagada'
             WHEN status = 'partial' THEN 'Pago Parcial'
             WHEN status = 'overdue' THEN 'Vencida'
             WHEN CURRENT_DATE > due_date THEN 'Vencida'
             ELSE 'Pendiente' END as display_status
      FROM invoices
      WHERE company_id = $1 AND customer_id = $2
      ORDER BY invoice_date DESC`,
      [companyId, customerId]
    );

    const { rows: creditNotes } = await query(
      `SELECT id, note_number, total_amount, issue_date, status
       FROM credit_notes
       WHERE company_id = $1 AND customer_id = $2
       ORDER BY issue_date DESC`,
      [companyId, customerId]
    );

    const { rows: debitNotes } = await query(
      `SELECT id, note_number, total_amount, issue_date, status
       FROM debit_notes
       WHERE company_id = $1 AND customer_id = $2
       ORDER BY issue_date DESC`,
      [companyId, customerId]
    );

    const { rows: payments } = await query(
      `SELECT id, payment_number, amount, payment_date, payment_method, reference
       FROM customer_payments
       WHERE company_id = $1 AND customer_id = $2
       ORDER BY payment_date DESC`,
      [companyId, customerId]
    );

    const totalInvoiced = invoices.reduce((sum, i) => sum + parseFloat(i.total_amount), 0);
    const totalPaid = invoices.reduce((sum, i) => sum + parseFloat(i.paid_amount), 0);
    const totalBalance = totalInvoiced - totalPaid;
    const totalCreditNotes = creditNotes.reduce((sum, cn) => sum + parseFloat(cn.total_amount), 0);
    const totalDebitNotes = debitNotes.reduce((sum, dn) => sum + parseFloat(dn.total_amount), 0);

    const transactions = [
      ...invoices.map(i => ({
        type: 'invoice' as const,
        date: i.invoice_date,
        reference: i.invoice_number,
        amount: parseFloat(i.total_amount),
        paid: parseFloat(i.paid_amount),
        balance: parseFloat(i.balance),
        status: i.display_status,
      })),
      ...creditNotes.map(cn => ({
        type: 'credit_note' as const,
        date: cn.issue_date,
        reference: cn.note_number,
        amount: -parseFloat(cn.total_amount),
        paid: 0,
        balance: 0,
        status: cn.status,
      })),
      ...debitNotes.map(dn => ({
        type: 'debit_note' as const,
        date: dn.issue_date,
        reference: dn.note_number,
        amount: parseFloat(dn.total_amount),
        paid: 0,
        balance: 0,
        status: dn.status,
      })),
      ...payments.map(p => ({
        type: 'payment' as const,
        date: p.payment_date,
        reference: p.payment_number,
        amount: -parseFloat(p.amount),
        paid: 0,
        balance: 0,
        status: 'paid',
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return successResponse({
      customer: customer[0],
      summary: {
        totalInvoiced,
        totalPaid,
        totalBalance,
        totalCreditNotes,
        totalDebitNotes,
      },
      transactions,
    });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

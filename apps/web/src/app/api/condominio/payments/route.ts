import { NextResponse } from 'next/server';
import { query, transaction } from '@/api/lib/db';

// POST: Record payment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company_id, unit_id, period_id, amount_clp, payment_method, reference_number, notes } = body;
    const companyId = company_id || '00000000-0000-0000-0000-000000000001';

    if (!unit_id || !amount_clp) {
      return NextResponse.json({ success: false, error: 'Unidad y monto son requeridos' }, { status: 400 });
    }

    const result = await transaction(async (client) => {
      // Find statement for unit and period, or latest pending statement
      let stmtId: string | null = null;
      if (period_id) {
        const stmtRes = await client.query(
          `SELECT id FROM condos_unit_statements WHERE unit_id = $1 AND period_id = $2 LIMIT 1`,
          [unit_id, period_id]
        );
        if (stmtRes.rows.length > 0) stmtId = stmtRes.rows[0].id;
      }

      if (!stmtId) {
        const latestRes = await client.query(
          `SELECT id FROM condos_unit_statements WHERE unit_id = $1 ORDER BY created_at DESC LIMIT 1`,
          [unit_id]
        );
        if (latestRes.rows.length > 0) stmtId = latestRes.rows[0].id;
      }

      if (!stmtId) {
        // Create dummy statement if no period statement exists yet
        const dummyRes = await client.query(
          `INSERT INTO condos_unit_statements (company_id, period_id, unit_id, total_amount, status)
           VALUES ($1, (SELECT id FROM condos_periods WHERE company_id = $1 LIMIT 1), $2, $3, 'paid')
           RETURNING id`,
          [companyId, unit_id, Number(amount_clp)]
        );
        stmtId = dummyRes.rows[0].id;
      }

      // Record payment
      const payRes = await client.query(
        `INSERT INTO condos_payments (company_id, statement_id, unit_id, amount, amount_clp, payment_method, reference_number, notes)
         VALUES ($1, $2, $3, $4, $4, $5, $6, $7)
         RETURNING *`,
        [companyId, stmtId, unit_id, Number(amount_clp), payment_method || 'transferencia', reference_number || '', notes || '']
      );

      // Update statement amount_paid & status
      await client.query(
        `UPDATE condos_unit_statements
         SET amount_paid = amount_paid + $1,
             paid_clp = COALESCE(paid_clp, 0) + $1,
             status = CASE
               WHEN (amount_paid + $1) >= total_amount THEN 'paid'
               ELSE 'partial'
             END,
             updated_at = now()
         WHERE id = $2`,
        [Number(amount_clp), stmtId]
      );

      return payRes.rows[0];
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in POST /api/condominio/payments:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al registrar pago' }, { status: 500 });
  }
}

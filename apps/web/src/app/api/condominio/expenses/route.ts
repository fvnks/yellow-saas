import { NextResponse } from 'next/server';
import { query, transaction } from '@/api/lib/db';

// POST: Add expense item to period
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company_id, period_id, category, description, amount_clp, supplier_id, purchase_invoice_id, amount_uf } = body;
    const companyId = company_id || '00000000-0000-0000-0000-000000000001';

    if (!period_id || !category || !amount_clp) {
      return NextResponse.json({ success: false, error: 'Faltan parámetros requeridos (period_id, category, amount_clp)' }, { status: 400 });
    }

    const result = await transaction(async (client) => {
      // Find property from period
      const pRes = await client.query('SELECT property_id FROM condos_periods WHERE id = $1', [period_id]);
      if (pRes.rows.length === 0) {
        throw new Error('Período de gastos no encontrado');
      }
      const propertyId = pRes.rows[0].property_id;

      // Insert item
      const itemRes = await client.query(
        `INSERT INTO condos_expense_items (company_id, property_id, period_id, category, name, description, amount, amount_clp, amount_uf, supplier_id, purchase_invoice_id)
         VALUES ($1, $2, $3, $4, $5, $5, $6, $6, $7, $8, $9)
         RETURNING *`,
        [companyId, propertyId, period_id, category, description || category, Number(amount_clp), Number(amount_uf) || 0, supplier_id || null, purchase_invoice_id || null]
      );

      // Recalculate period total expenses
      await client.query(
        `UPDATE condos_periods
         SET total_expenses_clp = (SELECT COALESCE(SUM(amount_clp), 0) FROM condos_expense_items WHERE period_id = $1),
             updated_at = now()
         WHERE id = $1`,
        [period_id]
      );

      return itemRes.rows[0];
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in POST /api/condominio/expenses:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al guardar gasto' }, { status: 500 });
  }
}

// DELETE: Remove expense item
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de ítem de gasto requerido' }, { status: 400 });
    }

    await transaction(async (client) => {
      const itemRes = await client.query('SELECT period_id FROM condos_expense_items WHERE id = $1', [id]);
      if (itemRes.rows.length === 0) return;
      const periodId = itemRes.rows[0].period_id;

      await client.query('DELETE FROM condos_expense_items WHERE id = $1', [id]);

      // Recalculate period total
      await client.query(
        `UPDATE condos_periods
         SET total_expenses_clp = (SELECT COALESCE(SUM(amount_clp), 0) FROM condos_expense_items WHERE period_id = $1),
             updated_at = now()
         WHERE id = $1`,
        [periodId]
      );
    });

    return NextResponse.json({ success: true, message: 'Gasto eliminado' });
  } catch (error: any) {
    console.error('Error in DELETE /api/condominio/expenses:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al eliminar gasto' }, { status: 500 });
  }
}

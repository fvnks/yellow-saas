import { query, transaction } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, getCompanyIvaRate } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customer_id');

    let sql = `
      SELECT dn.*, c.name as customer_name, c.tax_id as customer_rut,
        i.invoice_number, i.total_amount as invoice_total
      FROM debit_notes dn
      JOIN customers c ON c.id = dn.customer_id
      LEFT JOIN invoices i ON i.id = dn.invoice_id
      WHERE dn.company_id = $1
    `;
    const sqlParams: any[] = [companyId];
    let idx = 2;

    if (status) { sql += ` AND dn.status = $${idx}`; sqlParams.push(status); idx++; }
    if (customerId) { sql += ` AND dn.customer_id = $${idx}`; sqlParams.push(customerId); idx++; }

    sql += ' ORDER BY dn.created_at DESC';

    const { rows } = await query(sql, sqlParams);
    return successResponse(rows);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { invoice_id, customer_id, reason, debit_date, notes, items = [] } = body;

    if (!customer_id || !reason) {
      return errorResponse('customer_id and reason required', 400);
    }

    const custCheck = await query(
      `SELECT id FROM customers WHERE company_id = $1 AND id = $2`,
      [companyId, customer_id],
    );
    if (custCheck.rows.length === 0) return errorResponse('Cliente no encontrado', 404);
    if (invoice_id) {
      const invCheck = await query(
        `SELECT id FROM invoices WHERE company_id = $1 AND id = $2`,
        [companyId, invoice_id],
      );
      if (invCheck.rows.length === 0) return errorResponse('Factura no encontrada', 404);
    }

    const note = await transaction(async (client) => {
      const lockHash = await client.query<{ h: bigint }>(
        `SELECT ('x' || substr(md5($1 || ':debit_notes:number'), 1, 16))::bit(64)::bigint AS h`,
        [companyId],
      );
      await client.query(`SELECT pg_advisory_xact_lock($1)`, [lockHash.rows[0].h.toString()]);

      const { rows: cntRows } = await client.query(
        `SELECT COUNT(*)::int AS c FROM debit_notes WHERE company_id = $1`,
        [companyId],
      );
      const nextNum = `ND-${String((cntRows[0]?.c ?? 0) + 1).padStart(6, '0')}`;

      const subtotal = items.reduce((sum: number, item: any) => {
        return sum + (Number(item.quantity || 0) * Number(item.unit_price || 0) * (1 - (Number(item.discount_percent) || 0) / 100));
      }, 0);
      const ivaRate = await getCompanyIvaRate(companyId);
      const taxAmount = subtotal * ivaRate;
      const totalAmount = subtotal + taxAmount;

      const { rows } = await client.query(
        `INSERT INTO debit_notes (company_id, invoice_id, customer_id, number, debit_date, reason, subtotal, tax_amount, total_amount, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [companyId, invoice_id || null, customer_id, nextNum, debit_date || new Date().toISOString().split('T')[0], reason, subtotal, taxAmount, totalAmount, notes || ''],
      );

      for (const item of items) {
        await client.query(
          `INSERT INTO debit_note_items (company_id, debit_note_id, product_id, description, quantity, unit_price, discount_percent, tax_rate)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [companyId, rows[0].id, item.product_id || null, item.description || '', Number(item.quantity) || 1, Number(item.unit_price) || 0, Number(item.discount_percent) || 0, Number(item.tax_rate) || 19],
        );
      }

      if (invoice_id && totalAmount > 0) {
        await client.query(
          'UPDATE invoices SET paid_amount = paid_amount - $1 WHERE id = $2 AND company_id = $3',
          [totalAmount, invoice_id, companyId],
        );
      }

      return rows[0];
    });

    return successResponse(note, 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

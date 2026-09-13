import { query, transaction } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; countId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const countCheck = await query(
      `SELECT ic.*, 
        (SELECT COUNT(*) FROM inventory_count_items WHERE count_id = ic.id AND counted_quantity IS NULL) as uncounted
       FROM inventory_counts ic WHERE ic.id = $1 AND ic.company_id = $2`,
      [params.countId, companyId]
    );

    if (countCheck.rows.length === 0) return errorResponse('Count not found', 404);

    const count = countCheck.rows[0];
    if (count.status !== 'in_progress') return errorResponse('Count must be in progress to complete', 400);
    if (parseInt(count.uncounted) > 0) return errorResponse('All items must be counted before completing', 400);

    await transaction(async (client) => {
      // Create stock adjustments for items with differences
      const items = await client.query(
        `SELECT ici.*, p.cost_price
         FROM inventory_count_items ici
         JOIN products p ON ici.product_id = p.id
         WHERE ici.count_id = $1 AND ici.counted_quantity IS NOT NULL AND (ici.counted_quantity - ici.system_quantity) != 0`,
        [params.countId]
      );

      for (const item of items.rows) {
        const diff = Number(item.counted_quantity) - Number(item.system_quantity);

        // Create stock movement
        await client.query(
          `INSERT INTO stock_movements (company_id, product_id, warehouse_id, type, quantity, unit_cost, notes, created_by)
           VALUES ($1, $2, $3, 'adjustment', $4, $5, $6, $7)`,
          [companyId, item.product_id, count.warehouse_id, diff, item.cost_price || 0, `Ajuste por conteo ${count.count_number}`, count.created_by]
        );

        // Update stock levels
        const stockExists = await client.query(
          `SELECT id FROM stock_levels WHERE company_id = $1 AND product_id = $2 AND warehouse_id = $3`,
          [companyId, item.product_id, count.warehouse_id]
        );

        if (stockExists.rows.length > 0) {
          await client.query(
            `UPDATE stock_levels SET quantity = quantity + $4, updated_at = NOW()
             WHERE company_id = $1 AND product_id = $2 AND warehouse_id = $3`,
            [companyId, item.product_id, count.warehouse_id, diff]
          );
        } else if (diff > 0) {
          await client.query(
            `INSERT INTO stock_levels (company_id, product_id, warehouse_id, quantity)
             VALUES ($1, $2, $3, $4)`,
            [companyId, item.product_id, count.warehouse_id, diff]
          );
        }

        // Update item status
        await client.query(
          `UPDATE inventory_count_items SET status = 'adjusted' WHERE id = $1`,
          [item.id]
        );
      }

      // Update count status
      await client.query(
        `UPDATE inventory_counts SET status = 'completed', completed_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [params.countId]
      );
    });

    return successResponse({ message: 'Count completed and adjustments posted' });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Failed to complete count', 500);
  }
}

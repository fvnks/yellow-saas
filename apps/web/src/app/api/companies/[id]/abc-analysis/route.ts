import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: rules } = await query(
      'SELECT * FROM inventory_abc_rules WHERE company_id = $1 ORDER BY created_at DESC',
      [companyId]
    );

    const activeRule = rules.find((r: any) => r.is_active) || rules[0];
    let results: any[] = [];
    let summary: any = null;

    if (activeRule) {
      const { rows } = await query(
        `SELECT ir.*, p.name as product_name, p.sku
         FROM inventory_abc_results ir
         JOIN products p ON p.id = ir.product_id
         WHERE ir.rule_id = $1
         ORDER BY ir.rank`,
        [activeRule.id]
      );
      results = rows;

      const { rows: sumRows } = await query(
        `SELECT classification, COUNT(*) as count, SUM(total_movement_value) as total_value
         FROM inventory_abc_results WHERE rule_id = $1
         GROUP BY classification ORDER BY classification`,
        [activeRule.id]
      );
      summary = sumRows;
    }

    return successResponse({ rules, activeRule, results, summary });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { a_threshold = 80, b_threshold = 95, period_months = 12 } = body;

    const { rows: ruleRows } = await query(
      `INSERT INTO inventory_abc_rules (company_id, a_threshold, b_threshold, period_months)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [companyId, a_threshold, b_threshold, period_months]
    );
    const rule = ruleRows[0];

    await query(
      'UPDATE inventory_abc_rules SET is_active = FALSE WHERE company_id = $1 AND id != $2',
      [companyId, rule.id]
    );

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - period_months);

    const { rows: movements } = await query(
      `SELECT product_id,
        SUM(ABS(quantity) * COALESCE(unit_cost, 0)) as total_value,
        COUNT(*) as movement_count
       FROM stock_movements
       WHERE company_id = $1 AND created_at >= $2
       GROUP BY product_id
       ORDER BY total_value DESC`,
      [companyId, startDate.toISOString()]
    );

    if (movements.length === 0) {
      await query('UPDATE inventory_abc_rules SET last_run_at = NOW(), is_active = TRUE WHERE id = $1', [rule.id]);
      return successResponse({ rule, results: [], summary: [] });
    }

    const totalValue = movements.reduce((sum: number, m: any) => sum + parseFloat(m.total_value), 0);
    let cumulative = 0;

    for (let i = 0; i < movements.length; i++) {
      const m = movements[i];
      cumulative += (parseFloat(m.total_value) / totalValue) * 100;
      let classification = 'C';
      if (cumulative <= a_threshold) classification = 'A';
      else if (cumulative <= b_threshold) classification = 'B';

      await query(
        `INSERT INTO inventory_abc_results (company_id, rule_id, product_id, total_movement_value, movement_count, classification, cumulative_pct, rank)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [companyId, rule.id, m.product_id, m.total_value, m.movement_count, classification, cumulative.toFixed(2), i + 1]
      );
    }

    await query('UPDATE inventory_abc_rules SET last_run = NOW(), is_active = TRUE WHERE id = $1', [rule.id]);

    const { rows: results } = await query(
      `SELECT ir.*, p.name as product_name, p.sku
       FROM inventory_abc_results ir
       JOIN products p ON p.id = ir.product_id
       WHERE ir.rule_id = $1
       ORDER BY ir.rank`,
      [rule.id]
    );

    const { rows: summary } = await query(
      `SELECT classification, COUNT(*) as count, SUM(total_movement_value) as total_value
       FROM inventory_abc_results WHERE rule_id = $1
       GROUP BY classification ORDER BY classification`,
      [rule.id]
    );

    return successResponse({ rule, results, summary });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

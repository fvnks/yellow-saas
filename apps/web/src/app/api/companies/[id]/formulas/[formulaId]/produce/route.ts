import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

export async function POST(request: NextRequest, { params }: { params: { id: string; formulaId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { quantity, warehouse_id, notes } = body;

    if (!quantity || quantity <= 0) return errorResponse('quantity debe ser mayor a 0', 400);

    // Get formula with ingredients
    const { rows: formulaRows } = await query(
      `SELECT f.* FROM formulas f WHERE f.id = $1 AND f.company_id = $2 AND f.is_active = true`,
      [params.formulaId, companyId]
    );

    if (formulaRows.length === 0) return errorResponse('Receta no encontrada o inactiva', 404);

    const formula = formulaRows[0];

    const { rows: ingredients } = await query(
      `SELECT fi.*, rp.name as product_name
       FROM formula_ingredients fi
       JOIN recipe_products rp ON rp.id = fi.product_id
       WHERE fi.formula_id = $1`,
      [params.formulaId]
    );

    if (ingredients.length === 0) return errorResponse('La receta no tiene ingredientes', 400);

    // Check stock availability and deduct
    const deductionResults: { product: string; required: number; available: number; sufficient: boolean }[] = [];

    for (const ing of ingredients) {
      const requiredQty = Number(ing.quantity) * Number(quantity);

      // Get current stock across all warehouses (or specific warehouse)
      let stockQuery = `SELECT COALESCE(SUM(quantity), 0) as total FROM stock_levels WHERE company_id = $1 AND product_id = $2`;
      const stockParams: any[] = [companyId, ing.product_id];

      if (warehouse_id) {
        stockQuery += ` AND warehouse_id = $3`;
        stockParams.push(warehouse_id);
      }

      const { rows: stockRows } = await query(stockQuery, stockParams);
      const available = Number(stockRows[0]?.total || 0);

      deductionResults.push({
        product: ing.product_name,
        required: requiredQty,
        available,
        sufficient: available >= requiredQty,
      });

      if (available < requiredQty) {
        return errorResponse(
          `Stock insuficiente para ${ing.product_name}: requerido ${requiredQty}, disponible ${available}`,
          400
        );
      }
    }

    // All stock checks passed, now deduct
    for (const ing of ingredients) {
      const requiredQty = Number(ing.quantity) * Number(quantity);

      if (warehouse_id) {
        // Deduct from specific warehouse
        await query(
          `UPDATE stock_levels SET quantity = quantity - $1, updated_at = NOW()
           WHERE company_id = $2 AND product_id = $3 AND warehouse_id = $4`,
          [requiredQty, companyId, ing.product_id, warehouse_id]
        );
      } else {
        // Deduct from warehouses with stock (FIFO - oldest first)
        let remaining = requiredQty;
        const { rows: stockLocations } = await query(
          `SELECT id, quantity FROM stock_levels
           WHERE company_id = $1 AND product_id = $2 AND quantity > 0
           ORDER BY last_movement_at ASC, created_at ASC`,
          [companyId, ing.product_id]
        );

        for (const loc of stockLocations) {
          if (remaining <= 0) break;
          const deduct = Math.min(Number(loc.quantity), remaining);
          await query(
            `UPDATE stock_levels SET quantity = quantity - $1, updated_at = NOW() WHERE id = $2`,
            [deduct, loc.id]
          );
          remaining -= deduct;
        }
      }
    }

    // Log production
    const { rows: productionRows } = await query(
      `INSERT INTO formula_productions (company_id, formula_id, quantity, warehouse_id, notes, produced_by)
       VALUES ($1, $2, $3, $4, $5, NULL)
       RETURNING *`,
      [companyId, params.formulaId, quantity, warehouse_id || null, notes || null]
    );

    // If formula has an output product, add stock
    if (formula.output_product_id) {
      const outputQty = Number(formula.yield_quantity || 1) * Number(quantity);
      if (warehouse_id) {
        await query(
          `INSERT INTO stock_levels (company_id, product_id, warehouse_id, quantity)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (company_id, product_id, warehouse_id)
           DO UPDATE SET quantity = stock_levels.quantity + $4, updated_at = NOW()`,
          [companyId, formula.output_product_id, warehouse_id, outputQty]
        );
      } else {
        // Add to first/default warehouse
        const { rows: whRows } = await query(
          `SELECT id FROM warehouses WHERE company_id = $1 AND is_active = true ORDER BY is_default DESC LIMIT 1`,
          [companyId]
        );
        if (whRows.length > 0) {
          await query(
            `INSERT INTO stock_levels (company_id, product_id, warehouse_id, quantity)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (company_id, product_id, warehouse_id)
             DO UPDATE SET quantity = stock_levels.quantity + $4, updated_at = NOW()`,
            [companyId, formula.output_product_id, whRows[0].id, outputQty]
          );
        }
      }
    }

    return successResponse({
      production: productionRows[0],
      deductions: deductionResults,
      message: `Producción de ${quantity} unidades completada. Ingredientes descontados.`,
    }, 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

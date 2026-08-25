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

    // Check stock availability from recipe_products.stock
    const deductionResults: { product: string; required: number; available: number; sufficient: boolean }[] = [];

    for (const ing of ingredients) {
      const requiredQty = Number(ing.quantity) * Number(quantity);

      const { rows: stockRows } = await query(
        `SELECT COALESCE(stock, 0) as available FROM recipe_products WHERE id = $1 AND company_id = $2`,
        [ing.product_id, companyId]
      );
      const available = Number(stockRows[0]?.available || 0);

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

    // All stock checks passed, now deduct from recipe_products.stock
    for (const ing of ingredients) {
      const requiredQty = Number(ing.quantity) * Number(quantity);
      await query(
        `UPDATE recipe_products SET stock = stock - $1, updated_at = NOW() WHERE id = $2 AND company_id = $3`,
        [requiredQty, ing.product_id, companyId]
      );
    }

    // Log production
    const { rows: productionRows } = await query(
      `INSERT INTO formula_productions (company_id, formula_id, quantity, warehouse_id, notes, produced_by)
       VALUES ($1, $2, $3, $4, $5, NULL)
       RETURNING *`,
      [companyId, params.formulaId, quantity, warehouse_id || null, notes || null]
    );

    // If formula has an output product, add stock to recipe_products
    if (formula.output_product_id) {
      const outputQty = Number(formula.yield_quantity || 1) * Number(quantity);
      await query(
        `UPDATE recipe_products SET stock = stock + $1, updated_at = NOW() WHERE id = $2 AND company_id = $3`,
        [outputQty, formula.output_product_id, companyId]
      );
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

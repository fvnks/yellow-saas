import { query } from '../../../../lib/db';
import { getCompanyId, successResponse, errorResponse } from '../../../../lib/helpers';
import { NextRequest } from 'next/server';

interface ImportRow {
  name: string;
  sku: string;
  description?: string;
  type?: string;
  unit_of_measure?: string;
  cost_price?: number;
  sale_price?: number;
  min_stock?: number;
  max_stock?: number;
  barcode?: string;
  category?: string;
  tax_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { rows } = body as { rows: ImportRow[] };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return errorResponse('No rows to import', 400);
    }

    if (rows.length > 500) {
      return errorResponse('Maximum 500 products per import', 400);
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      if (!row.name || !row.sku) {
        errors.push(`Row ${i + 1}: name and sku are required`);
        skipped++;
        continue;
      }

      // Check for duplicate SKU
      const existing = await query(
        `SELECT id FROM products WHERE company_id = $1 AND sku = $2`,
        [companyId, row.sku]
      );

      if (existing.rows.length > 0) {
        errors.push(`Row ${i + 1}: SKU "${row.sku}" already exists`);
        skipped++;
        continue;
      }

      // Find or create category
      let categoryId = null;
      if (row.category) {
        const catResult = await query(
          `SELECT id FROM inventory_categories WHERE company_id = $1 AND name = $2`,
          [companyId, row.category]
        );
        if (catResult.rows.length > 0) {
          categoryId = catResult.rows[0].id;
        } else {
          const newCat = await query(
            `INSERT INTO inventory_categories (company_id, name) VALUES ($1, $2) RETURNING id`,
            [companyId, row.category]
          );
          categoryId = newCat.rows[0].id;
        }
      }

      // Find tax_id
      let taxId = null;
      if (row.tax_id) {
        const taxResult = await query(
          `SELECT id FROM taxes WHERE company_id = $1 AND (name ILIKE $2 OR code ILIKE $2)`,
          [companyId, row.tax_id]
        );
        if (taxResult.rows.length > 0) {
          taxId = taxResult.rows[0].id;
        }
      }

      await query(
        `INSERT INTO products (
          company_id, name, sku, description, type, unit_of_measure,
          cost_price, sale_price, min_stock, max_stock, barcode,
          category_id, tax_id, track_stock, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, true)`,
        [
          companyId, row.name, row.sku, row.description || null,
          row.type || 'product', row.unit_of_measure || 'unit',
          row.cost_price || 0, row.sale_price || 0,
          row.min_stock || 0, row.max_stock || 0,
          row.barcode || null, categoryId, taxId,
        ]
      );

      imported++;
    }

    return successResponse({
      imported,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

const ALLOWED_TABLES = ['customers'];

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { table, data } = body;

    if (!table || !ALLOWED_TABLES.includes(table)) {
      return errorResponse(`Invalid table. Allowed: ${ALLOWED_TABLES.join(', ')}`, 400);
    }

    if (!Array.isArray(data) || data.length === 0) {
      return errorResponse('Data must be a non-empty array', 400);
    }

    const errors: string[] = [];
    let imported = 0;

    if (table === 'customers') {
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          if (!row.name) {
            errors.push(`Row ${i + 1}: name is required`);
            continue;
          }

          await query(
            `INSERT INTO customers (
              company_id, name, code, trade_name, tax_id, tax_id_type,
              address, city, region, country, postal_code, phone, email,
              website, contact_person, contact_phone, contact_email,
              payment_terms, credit_limit, tax_exempt, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
            [
              companyId,
              row.name,
              row.code || null,
              row.trade_name || null,
              row.tax_id || null,
              row.tax_id_type || 'RUT',
              row.address || null,
              row.city || null,
              row.region || null,
              row.country || 'CL',
              row.postal_code || null,
              row.phone || null,
              row.email || null,
              row.website || null,
              row.contact_person || null,
              row.contact_phone || null,
              row.contact_email || null,
              row.payment_terms || 0,
              row.credit_limit || 0,
              row.tax_exempt || false,
              row.notes || null,
            ]
          );
          imported++;
        } catch (err: any) {
          errors.push(`Row ${i + 1}: ${err.message}`);
        }
      }
    }

    return successResponse({ imported, errors });
  } catch {
    return errorResponse('Import failed', 500);
  }
}

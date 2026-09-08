import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { generateDTE, DTEData } from '@/lib/dte-templates';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(request.url);
    const documentId = url.searchParams.get('document_id');
    const type = url.searchParams.get('type') as '33' | '46' | '56' | '55';

    if (!documentId) {
      return errorResponse('document_id is required', 400);
    }

    const doc = await query(
      `SELECT id, type, folio, fecha_emision, 
              seller_id, buyer_id, subtotal, descuento, monto_net, iva, monto_total,
              payment_method, payment_terms, observations
       FROM invoices WHERE id = $1 AND company_id = $2`,
      [documentId, companyId]
    );

    if (doc.rows.length === 0) {
      return errorResponse('Invoice not found', 404);
    }

    const invoice = doc.rows[0];

    const seller = await query(
      `SELECT name, tax_id as rut, address, city, region, phone, email FROM companies WHERE id = $1`,
      [companyId]
    );

    const buyer = await query(
      `SELECT name, tax_id as rut, address, city, region, phone, email FROM customers WHERE id = $1`,
      [invoice.seller_id]
    );

    const items = await query(
      `SELECT quantity, description, unit_price, discount, total 
       FROM invoice_items WHERE invoice_id = $1`,
      [documentId]
    );

    const dteData: DTEData = {
      id: invoice.id,
      type: invoice.type || '33',
      folio: invoice.folio,
      date: invoice.fecha_emision,
      seller: {
        id: companyId,
        name: seller.rows[0]?.name || '',
        rut: seller.rows[0]?.rut || '',
        address: seller.rows[0]?.address || '',
        city: seller.rows[0]?.city || '',
        region: seller.rows[0]?.region || '',
        phone: seller.rows[0]?.phone || '',
        email: seller.rows[0]?.email || '',
      },
      buyer: {
        id: invoice.buyer_id,
        name: buyer.rows[0]?.name || '',
        rut: buyer.rows[0]?.rut || '',
        address: buyer.rows[0]?.address || '',
        city: buyer.rows[0]?.city || '',
        region: buyer.rows[0]?.region || '',
        phone: buyer.rows[0]?.phone || '',
        email: buyer.rows[0]?.email || '',
      },
      items: items.rows.map(item => ({
        qty: item.quantity,
        unit: 'KGM',
        description: item.description,
        price: item.unit_price,
        discount: item.discount,
        total: item.total,
      })),
      subtotal: invoice.subtotal,
      discount: invoice.descuento,
      taxable: invoice.monto_net,
      iva: invoice.iva,
      total: invoice.monto_total,
      payment: invoice.payment_method ? {
        method: invoice.payment_method,
        terms: invoice.payment_terms?.toString() || '0',
      } : undefined,
      observations: invoice.observations,
    };

    const xml = generateDTE(dteData.type, dteData);

    return successResponse({
      xml,
      type: dteData.type,
      folio: dteData.folio,
      total: dteData.total,
    });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { document_id, document_type, xml } = body;

    if (!document_id || !xml) {
      return errorResponse('document_id and xml are required', 400);
    }

    await query(
      `UPDATE invoices SET 
        sii_xml = $1,
        sii_status = 'pending',
        sii_sent_at = NOW()
       WHERE id = $2 AND company_id = $3`,
      [xml, document_id, companyId]
    );

    return successResponse({ 
      message: 'DTE XML saved successfully',
      document_id,
    });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

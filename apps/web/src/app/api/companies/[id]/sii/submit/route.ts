import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { generateDTE, DTEData } from '@/lib/dte-templates';
import { getCertificateForSigning, getSiiToken, sendDteToSii, signXml, getNextFolio, storeCaf } from '@/lib/sii-certificate';

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { document_id, document_type = '33', force_folio } = body;

    if (!document_id) {
      return errorResponse('document_id is required', 400);
    }

    // Get company config
    const company = await query(
      `SELECT sii_test_mode, name, tax_id, sii_cert_subject, sii_document_type_default 
       FROM companies WHERE id = $1`,
      [companyId]
    );

    if (!company.rows.length) {
      return errorResponse('Company not found', 404);
    }

    const config = company.rows[0];
    const isTest = config.sii_test_mode !== false;

    // Check certificate is configured
    if (!config.sii_cert_subject) {
      return errorResponse('Digital certificate not configured. Upload a .p12 certificate in SII settings.', 400);
    }

    // Get document
    const doc = await query(
      `SELECT id, invoice_number, customer_id, invoice_date, subtotal, tax_amount, total_amount, 
              sii_status, sii_xml, document_type
       FROM invoices WHERE id = $1 AND company_id = $2`,
      [document_id, companyId]
    );

    if (doc.rows.length === 0) {
      return errorResponse('Invoice not found', 404);
    }

    const invoice = doc.rows[0];
    const tipoDte = document_type || invoice.document_type || config.sii_document_type_default || '33';

    if (invoice.sii_status === 'accepted') {
      return successResponse({ message: 'DTE already accepted by SII', status: invoice.sii_status });
    }

    // Get next folio (from CAF range)
    let folio = force_folio || parseInt(invoice.invoice_number.replace(/\D/g, '')) || 0;
    if (!folio) {
      const nextFolio = await getNextFolio(companyId, tipoDte);
      if (!nextFolio) {
        return errorResponse('No folios available in CAF range. Upload new CAF.', 400);
      }
      folio = nextFolio;
    }

    // Get seller (company) data
    const seller = await query(
      `SELECT name, tax_id as rut, address, city, region, phone, email, giro 
       FROM companies WHERE id = $1`,
      [companyId]
    );

    // Get buyer (customer) data
    const buyer = await query(
      `SELECT name, tax_id as rut, address, city, region, phone, email, giro 
       FROM customers WHERE id = $1`,
      [invoice.customer_id]
    );

    // Get items
    const items = await query(
      `SELECT quantity, description, unit_price, discount_percent, line_total, unit_of_measure
       FROM invoice_items WHERE invoice_id = $1`,
      [document_id]
    );

    const dteData: DTEData = {
      id: invoice.id,
      type: tipoDte as '33' | '46' | '56' | '55',
      folio,
      date: invoice.invoice_date.split('T')[0],
      seller: {
        id: companyId,
        name: seller.rows[0]?.name || config.name,
        rut: seller.rows[0]?.rut || config.tax_id,
        address: seller.rows[0]?.address || '',
        city: seller.rows[0]?.city || '',
        region: seller.rows[0]?.region || '',
        phone: seller.rows[0]?.phone || '',
        email: seller.rows[0]?.email || '',
      },
      buyer: {
        id: invoice.customer_id,
        name: buyer.rows[0]?.name || '',
        rut: buyer.rows[0]?.rut || '',
        address: buyer.rows[0]?.address || '',
        city: buyer.rows[0]?.city || '',
        region: buyer.rows[0]?.region || '',
        phone: buyer.rows[0]?.phone || '',
        email: buyer.rows[0]?.email || '',
      },
      items: items.rows.map(item => ({
        qty: Number(item.quantity),
        unit: item.unit_of_measure || 'UN',
        description: item.description,
        price: Number(item.unit_price),
        discount: Number(item.discount_percent) || 0,
        total: Number(item.line_total),
      })),
      subtotal: Number(invoice.subtotal),
      discount: 0,
      taxable: Number(invoice.subtotal),
      iva: Number(invoice.tax_amount),
      total: Number(invoice.total_amount),
      payment: invoice.payment_terms ? {
        method: '0',
        terms: invoice.payment_terms.toString(),
      } : undefined,
      observations: undefined,
    };

    // Generate DTE XML
    const xml = generateDTE(dteData.type, dteData);

    // Sign XML with digital certificate
    const certData = await getCertificateForSigning(companyId);
    if (!certData) {
      return errorResponse('Failed to load certificate for signing. Re-upload certificate.', 500);
    }

    // Sign the XML
    const { signedXml, signature } = signXml(xml, certData.privateKey, certData.certificate);

    // Save signed XML to invoice
    await query(
      `UPDATE invoices SET 
        sii_xml = $1,
        sii_signature = $2,
        sii_status = 'signed',
        folio = $3,
        updated_at = NOW()
       WHERE id = $4 AND company_id = $5`,
      [signedXml, signature, folio, document_id, companyId]
    );

    // Submit to SII (real submission)
    let trackId = '';
    let siiStatus = 'pending';
    let siiError = null;

    try {
      const result = await sendDteToSii(companyId, signedXml, tipoDte, isTest);
      trackId = result.trackId;
      siiStatus = result.status === 'accepted' ? 'accepted' : 'pending';
    } catch (err) {
      console.error('SII submission error:', err);
      siiError = err instanceof Error ? err.message : 'SII submission failed';
      siiStatus = 'error';
    }

    // Update invoice with SII response
    await query(
      `UPDATE invoices SET 
        sii_status = $1,
        sii_track_id = $2,
        sii_sent_at = NOW(),
        sii_response_at = NOW(),
        sii_error = $3,
        updated_at = NOW()
       WHERE id = $4 AND company_id = $5`,
      [siiStatus, trackId, siiError, document_id, companyId]
    );

    await query(
      `UPDATE companies SET sii_last_submission_at = NOW() WHERE id = $1`,
      [companyId]
    );

    return successResponse({
      message: siiError ? 'DTE signed but SII submission failed' : 'DTE signed and submitted to SII',
      status: siiStatus,
      track_id: trackId,
      folio,
      signed: true,
      error: siiError,
      simulated: false,
    });
  } catch (err) {
    console.error('SII submit error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal server error', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(request.url);
    const documentId = url.searchParams.get('document_id');

    if (documentId) {
      const doc = await query(
        `SELECT id, invoice_number, folio, sii_status, sii_track_id, sii_sent_at, sii_response_at, sii_error, sii_xml
         FROM invoices WHERE id = $1 AND company_id = $2`,
        [documentId, companyId]
      );
      return successResponse(doc.rows[0]);
    }

    const result = await query(
      `SELECT id, invoice_number, folio, sii_status, sii_sent_at, sii_error 
       FROM invoices WHERE company_id = $1 
       ORDER BY sii_sent_at DESC LIMIT 20`,
      [companyId]
    );

    return successResponse(result.rows);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}
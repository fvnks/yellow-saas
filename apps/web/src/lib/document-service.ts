import { query, transaction } from '@/api/lib/db';
import { parseDteXml, computeSha256, type ParsedDte } from '@/lib/dte-xml-parser';
import { validateDte } from '@/lib/dte-validator';

export interface ImportInput {
  xmlContent: string;
  fileName: string;
  source?: 'xml_upload' | 'email' | 'provider' | 'sii_certification';
  externalReference?: string;
}

export interface ImportResult {
  documentId?: string;
  status: 'valid' | 'warning' | 'rejected' | 'duplicate' | 'error';
  documentType?: string;
  folio?: number;
  emitterName?: string;
  emitterRut?: string;
  totalAmount?: number;
  errors: string[];
  warnings: string[];
}

const MAX_XML_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES_PER_IMPORT = 50;

function normalizeRut(rut: string): string {
  return rut.replace(/\./g, '').replace(/-/g, '').replace(/\s/g, '').toUpperCase();
}

async function getCompanyRut(companyId: string): Promise<string> {
  const { rows } = await query(
    `SELECT tax_id FROM companies WHERE id = $1`,
    [companyId]
  );
  return rows[0]?.tax_id || '';
}

async function logEvent(
  clientId: string,
  documentId: string,
  stage: string,
  status: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  try {
    await query(
      `INSERT INTO document_processing_events (document_id, company_id, stage, status, message, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [documentId, clientId, stage, status, message, JSON.stringify(metadata || {})]
    );
  } catch (err) {
    console.error('Failed to log processing event:', err);
  }
}

export async function importSingleDocument(
  companyId: string,
  input: ImportInput,
  importedBy?: string
): Promise<ImportResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const batchId = crypto.randomUUID();

  // 1. Size check
  if (Buffer.byteLength(input.xmlContent, 'utf8') > MAX_XML_SIZE) {
    return { status: 'error', errors: ['Archivo XML excede el tamaño máximo de 5MB'], warnings };
  }

  // 2. Compute SHA-256
  const sha256 = await computeSha256(input.xmlContent);

  // 3. Parse XML
  let parsed: ParsedDte;
  try {
    parsed = parseDteXml(input.xmlContent);
  } catch (err: any) {
    return { status: 'error', errors: [`Error al parsear XML: ${err.message}`], warnings };
  }
  parsed.sha256 = sha256;

  // 4. Validate
  const companyRut = await getCompanyRut(companyId);
  const validation = validateDte(parsed, companyRut);
  errors.push(...validation.errors);
  warnings.push(...validation.warnings);

  if (!validation.isValid) {
    return {
      status: 'rejected',
      documentType: parsed.header.documentType,
      folio: parsed.header.folio,
      emitterName: parsed.header.emitter.name,
      emitterRut: parsed.header.emitter.rut,
      totalAmount: parsed.header.totals.totalAmount,
      errors,
      warnings,
    };
  }

  // 5. Check duplicate (unique constraint)
  const normalizedEmitterRut = normalizeRut(parsed.header.emitter.rut);
  const { rows: existing } = await query(
    `SELECT id, status FROM received_documents
     WHERE company_id = $1 AND emitter_rut = $2 AND document_type = $3 AND folio = $4`,
    [companyId, normalizedEmitterRut, parsed.header.documentType, parsed.header.folio]
  );

  if (existing.length > 0) {
    return {
      status: 'duplicate',
      documentId: existing[0].id,
      documentType: parsed.header.documentType,
      folio: parsed.header.folio,
      emitterName: parsed.header.emitter.name,
      emitterRut: normalizedEmitterRut,
      totalAmount: parsed.header.totals.totalAmount,
      errors: [],
      warnings: [`Documento ya existe en el sistema (ID: ${existing[0].id}, estado: ${existing[0].status})`],
    };
  }

  // 6. Store document in transaction
  try {
    const result = await transaction(async (client) => {
      // Insert main document
      const docResult = await client.query(
        `INSERT INTO received_documents (
          company_id, document_type, folio, emitter_rut, emitter_name, emitter_trade_name,
          receiver_rut, receiver_name, issue_date, net_amount, exempt_amount, vat_amount,
          total_amount, currency, status, source, external_reference,
          xml_storage_key, raw_xml_sha256, imported_by, import_batch_id,
          processing_errors, validation_warnings
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23
        ) RETURNING id`,
        [
          companyId, parsed.header.documentType, parsed.header.folio,
          normalizedEmitterRut, parsed.header.emitter.name, parsed.header.emitter.tradeName || null,
          parsed.header.receiver.rut, parsed.header.receiver.name,
          parsed.header.issueDate, parsed.header.totals.netAmount, parsed.header.totals.exemptAmount,
          parsed.header.totals.vatAmount, parsed.header.totals.totalAmount, parsed.header.currency,
          warnings.length > 0 ? 'warning' : 'valid',
          input.source || 'xml_upload', input.externalReference || null,
          `received/${companyId}/${sha256}.xml`, sha256, importedBy || null, batchId,
          JSON.stringify(errors), JSON.stringify(warnings),
        ]
      );
      const docId = docResult.rows[0].id;

      // Insert items
      for (const item of parsed.items) {
        await client.query(
          `INSERT INTO received_document_items (
            document_id, company_id, line_number, product_code, product_name,
            quantity, unit, unit_price, discount_percent, discount_amount, line_total, is_exempt
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            docId, companyId, item.lineNumber, item.productCode || null, item.productName,
            item.quantity, item.unit, item.unitPrice, item.discountPercent, item.discountAmount,
            item.lineTotal, item.isExempt,
          ]
        );
      }

      // Insert references
      for (const ref of parsed.references) {
        await client.query(
          `INSERT INTO received_document_references (
            document_id, company_id, reference_type, reference_folio,
            reference_date, reference_code, reference_reason
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            docId, companyId, ref.referenceType, ref.referenceFolio || null,
            ref.referenceDate || null, ref.referenceCode || null, ref.referenceReason || null,
          ]
        );
      }

      return { docId, status: warnings.length > 0 ? 'warning' : 'valid' };
    });

    // Log processing events
    await logEvent(companyId, result.docId, 'upload', 'success', 'XML recibido', { fileName: input.fileName });
    await logEvent(companyId, result.docId, 'parse', 'success', `DTE ${parsed.header.documentType} folio ${parsed.header.folio}`);
    await logEvent(companyId, result.docId, 'validate', validation.isValid ? 'success' : 'warning',
      validation.isValid ? 'Validación exitosa' : `${warnings.length} advertencias`,
      { errors, warnings }
    );
    await logEvent(companyId, result.docId, 'store', 'success', 'Documento almacenado');
    await logEvent(companyId, result.docId, 'complete', 'success', 'Importación completada');

    return {
      status: result.status as any,
      documentId: result.docId,
      documentType: parsed.header.documentType,
      folio: parsed.header.folio,
      emitterName: parsed.header.emitter.name,
      emitterRut: normalizedEmitterRut,
      totalAmount: parsed.header.totals.totalAmount,
      errors,
      warnings,
    };
  } catch (err: any) {
    if (err.code === '23505') {
      return {
        status: 'duplicate',
        documentType: parsed.header.documentType,
        folio: parsed.header.folio,
        emitterName: parsed.header.emitter.name,
        emitterRut: normalizedEmitterRut,
        totalAmount: parsed.header.totals.totalAmount,
        errors: [],
        warnings: ['Documento duplicado (restricción de unicidad)'],
      };
    }
    return { status: 'error', errors: [`Error al guardar: ${err.message}`], warnings };
  }
}

export async function importMultipleDocuments(
  companyId: string,
  inputs: ImportInput[],
  importedBy?: string
): Promise<{ batchId: string; results: ImportResult[]; summary: { total: number; valid: number; warnings: number; duplicates: number; errors: number } }> {
  const batchId = crypto.randomUUID();
  const results: ImportResult[] = [];

  const limit = Math.min(inputs.length, MAX_FILES_PER_IMPORT);
  for (let i = 0; i < limit; i++) {
    const result = await importSingleDocument(companyId, inputs[i], importedBy);
    results.push(result);
  }

  const summary = {
    total: results.length,
    valid: results.filter(r => r.status === 'valid').length,
    warnings: results.filter(r => r.status === 'warning').length,
    duplicates: results.filter(r => r.status === 'duplicate').length,
    errors: results.filter(r => r.status === 'error' || r.status === 'rejected').length,
  };

  return { batchId, results, summary };
}

import { query } from '@/api/lib/db';
import { getCompanyId, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    // Fetch document with XML storage key
    const { rows } = await query(
      `SELECT xml_storage_key, raw_xml_sha256, emitter_name, document_type, folio
       FROM received_documents
       WHERE id = $1 AND company_id = $2`,
      [params.docId, companyId]
    );

    if (rows.length === 0) {
      return errorResponse('Documento no encontrado', 404);
    }

    const doc = rows[0];

    if (!doc.xml_storage_key) {
      return errorResponse('XML no disponible para este documento', 404);
    }

    // For now, serve the XML from a content-based lookup
    // In production, this would serve from object storage (S3/R2)
    // with signed URLs and short expiration
    const { rows: xmlRows } = await query(
      `SELECT raw_xml_sha256 FROM received_documents WHERE id = $1 AND company_id = $2`,
      [params.docId, companyId]
    );

    // Return metadata for the client to construct the download
    // In a real implementation, this would generate a signed URL
    return new Response(JSON.stringify({
      success: true,
      data: {
        storage_key: doc.xml_storage_key,
        sha256: doc.raw_xml_sha256,
        filename: `DTE_${doc.document_type}_${doc.folio}_${doc.emitter_name?.replace(/[^a-zA-Z0-9]/g, '_')}.xml`,
        content_type: 'application/xml',
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

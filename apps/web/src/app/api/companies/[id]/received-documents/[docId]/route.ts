import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: documents } = await query(
      `SELECT rd.*
       FROM received_documents rd
       WHERE rd.id = $1 AND rd.company_id = $2`,
      [params.docId, companyId]
    );

    if (documents.length === 0) {
      return errorResponse('Documento no encontrado', 404);
    }

    const doc = documents[0];

    // Fetch items
    const { rows: items } = await query(
      `SELECT * FROM received_document_items
       WHERE document_id = $1 AND company_id = $2
       ORDER BY line_number ASC`,
      [params.docId, companyId]
    );

    // Fetch references
    const { rows: references } = await query(
      `SELECT * FROM received_document_references
       WHERE document_id = $1 AND company_id = $2
       ORDER BY created_at ASC`,
      [params.docId, companyId]
    );

    // Fetch processing events
    const { rows: events } = await query(
      `SELECT * FROM document_processing_events
       WHERE document_id = $1 AND company_id = $2
       ORDER BY created_at ASC`,
      [params.docId, companyId]
    );

    return successResponse({
      ...doc,
      items,
      references,
      events,
    });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `DELETE FROM received_documents WHERE id = $1 AND company_id = $2 RETURNING id`,
      [params.docId, companyId]
    );

    if (rows.length === 0) {
      return errorResponse('Documento no encontrado', 404);
    }

    return successResponse({ deleted: true });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

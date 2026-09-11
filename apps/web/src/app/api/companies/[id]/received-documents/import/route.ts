import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { importSingleDocument, importMultipleDocuments } from '@/lib/document-service';
import { NextRequest } from 'next/server';
import JSZip from 'jszip';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per XML
const MAX_FILES = 50;
const MAX_ZIP_SIZE = 50 * 1024 * 1024; // 50MB for ZIP

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const contentType = request.headers.get('content-type') || '';

    // Extract user ID from token for audit
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value;
    let importedBy: string | undefined;
    if (token) {
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        importedBy = payload.user_id || payload.sub;
      } catch (err) { console.error('Silenced error:', err); }
    }

    // Handle JSON body with base64 XML content
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { xml_content, file_name, source, external_reference } = body;

      if (!xml_content) {
        return errorResponse('Se requiere xml_content', 400);
      }

      const result = await importSingleDocument(companyId, {
        xmlContent: xml_content,
        fileName: file_name || 'document.xml',
        source: source || 'xml_upload',
        externalReference: external_reference,
      }, importedBy);

      return successResponse(result, result.status === 'error' || result.status === 'rejected' ? 422 : 200);
    }

    // Handle multipart form data (file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const files: File[] = [];
      const entries = Array.from(formData.entries());

      for (const [key, value] of entries) {
        if (key === 'files' && value instanceof File) {
          files.push(value);
        }
      }

      if (files.length === 0) {
        return errorResponse('Se requiere al menos un archivo', 400);
      }

      if (files.length > MAX_FILES) {
        return errorResponse(`Máximo ${MAX_FILES} archivos por importación`, 400);
      }

      // Check if it's a ZIP
      const firstFile = files[0];
      if (firstFile.name.endsWith('.zip') && files.length === 1) {
        const zipBuffer = Buffer.from(await firstFile.arrayBuffer());
        if (zipBuffer.length > MAX_ZIP_SIZE) {
          return errorResponse('ZIP excede el tamaño máximo de 50MB', 400);
        }

        const zip = await JSZip.loadAsync(zipBuffer);
        const xmlFiles: { name: string; content: string }[] = [];

        for (const [name, zipEntry] of Object.entries(zip.files)) {
          if (zipEntry.dir) continue;
          if (!name.toLowerCase().endsWith('.xml')) continue;
          if (xmlFiles.length >= MAX_FILES) break;

          const content = await zipEntry.async('string');
          xmlFiles.push({ name, content });
        }

        if (xmlFiles.length === 0) {
          return errorResponse('No se encontraron archivos XML en el ZIP', 400);
        }

        const inputs = xmlFiles.map(f => ({
          xmlContent: f.content,
          fileName: f.name,
          source: (firstFile.name.includes('sii') ? 'sii_certification' : 'xml_upload') as any,
        }));

        const result = await importMultipleDocuments(companyId, inputs, importedBy);
        return successResponse(result);
      }

      // Handle individual XML files
      if (files.length === 1) {
        const file = files[0];
        if (file.size > MAX_FILE_SIZE) {
          return errorResponse(`Archivo ${file.name} excede el tamaño máximo de 5MB`, 400);
        }
        const content = await file.text();
        const result = await importSingleDocument(companyId, {
          xmlContent: content,
          fileName: file.name,
          source: 'xml_upload',
        }, importedBy);
        return successResponse(result, result.status === 'error' || result.status === 'rejected' ? 422 : 200);
      }

      // Multiple XML files
      const inputs = [];
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) continue;
        const content = await file.text();
        inputs.push({
          xmlContent: content,
          fileName: file.name,
          source: 'xml_upload' as const,
        });
      }

      if (inputs.length === 0) {
        return errorResponse('Ningún archivo cumple el tamaño máximo permitido', 400);
      }

      const result = await importMultipleDocuments(companyId, inputs, importedBy);
      return successResponse(result);
    }

    return errorResponse('Content-Type no soportado. Use application/json o multipart/form-data', 415);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

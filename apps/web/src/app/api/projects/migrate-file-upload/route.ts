import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server'; export async function POST(request: NextRequest) { try { await query(`ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS file_data TEXT`); await query(`ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS mime_type TEXT`); return successResponse({ message: 'File upload columns added' }); } catch (err: any) { return errorResponse(err.message, 500); }
}

import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server'; export async function POST(request: NextRequest) { try { await query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS portal_token TEXT UNIQUE`); await query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN DEFAULT false`); await query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS portal_show_budget BOOLEAN DEFAULT false`); await query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS portal_show_costs BOOLEAN DEFAULT false`); return successResponse({ message: 'Portal columns added' }); } catch (err: any) { return errorResponse(err.message, 500); }
}

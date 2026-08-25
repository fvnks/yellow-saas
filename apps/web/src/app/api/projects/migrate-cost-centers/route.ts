import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_cost_center ON projects(cost_center_id)`);
    await query(`ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL`);
    await query(`CREATE INDEX IF NOT EXISTS idx_stock_movements_cost_center ON stock_movements(cost_center_id)`);
    return successResponse({ message: 'Cost center links added to projects and stock_movements' });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

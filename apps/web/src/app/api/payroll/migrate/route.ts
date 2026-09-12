import { successResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

/**
 * DEPRECATED — All payroll schema is now in migration 100_payroll_full_schema.sql.
 * This endpoint is kept for backward compatibility but does nothing.
 */
export async function POST(_request: NextRequest) {
  return successResponse({
    message: 'Payroll schema is now managed via migration 100_payroll_full_schema.sql. No action needed.',
  });
}

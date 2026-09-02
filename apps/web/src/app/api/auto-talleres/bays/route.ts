import { NextResponse } from 'next/server';
import { query } from '@/app/api/lib/db';
import { successResponse, errorResponse } from '@/app/api/lib/helpers';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const company_id = url.searchParams.get('company_id');
    
    if (!company_id) {
      return errorResponse('company_id is required', 400);
    }
    
    const { rows } = await query(
      'SELECT * FROM auto_bays WHERE company_id = $1 ORDER BY number',
      [company_id]
    );
    
    return successResponse(rows);
  } catch (error) {
    console.error('Error fetching bays:', error);
    return errorResponse('Failed to fetch bays', 500);
  }
}

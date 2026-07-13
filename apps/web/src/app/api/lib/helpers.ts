import { NextRequest, NextResponse } from 'next/server';
import { query } from './db';

export async function getCompanyId(request: NextRequest): Promise<string | null> {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const companiesIndex = pathParts.indexOf('companies');
  if (companiesIndex === -1 || !pathParts[companiesIndex + 1]) return null;
  return pathParts[companiesIndex + 1];
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: { message } }, { status });
}

export function paginatedResponse(data: unknown[], total: number, page: number, limit: number) {
  return NextResponse.json({
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export function parseSearchParams(request: NextRequest) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const search = url.searchParams.get('search') || '';
  const sort = url.searchParams.get('sort') || 'created_at';
  const order = url.searchParams.get('order') || 'desc';
  const offset = (page - 1) * limit;
  return { page, limit, search, sort, order, offset };
}
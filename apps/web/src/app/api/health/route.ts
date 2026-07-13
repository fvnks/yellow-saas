import { NextResponse } from 'next/server';
import { query } from '../lib/db';

export async function GET() {
  const url = process.env.DATABASE_URL;
  const masked = url ? url.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') : 'NOT SET';

  try {
    const result = await query('SELECT 1 as ok');
    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      database_url: masked,
      result: result.rows,
    });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      db: 'failed',
      database_url: masked,
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}

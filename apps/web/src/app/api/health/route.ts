import { NextResponse } from 'next/server';
import { query } from '../lib/db';

export async function GET() {
  try {
    const tables = await query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
    const profiles = await query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' ORDER BY ordinal_position`);
    const users = await query(`SELECT id, email, full_name, role, status, password_hash IS NOT NULL as has_password FROM profiles LIMIT 5`);
    return NextResponse.json({
      tables: tables.rows.map(r => r.table_name),
      profiles_columns: profiles.rows,
      users: users.rows,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

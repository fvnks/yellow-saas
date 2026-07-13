import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '../lib/db';

export async function GET() {
  try {
    const testHash = await bcrypt.hash('admin123', 12);
    const verify = await bcrypt.compare('admin123', testHash);

    const user = await query('SELECT email, password_hash FROM profiles WHERE email = $1', ['admin@yellow-erp.cl']);
    const storedHash = user.rows[0]?.password_hash;
    let verifyStored = false;
    if (storedHash) {
      verifyStored = await bcrypt.compare('admin123', storedHash);
    }

    return NextResponse.json({
      testHash,
      verify,
      storedHash,
      verifyStored,
      bcryptVersion: (bcrypt as any).version || 'unknown',
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

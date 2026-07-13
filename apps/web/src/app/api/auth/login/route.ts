import { query } from '../../lib/db';
import { successResponse, errorResponse } from '../../lib/helpers';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'yellow-erp-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    const result = await query(
      'SELECT id, email, name, company_id, role, password_hash FROM profiles WHERE email = $1 AND status = $2',
      [email, 'active']
    );

    if (result.rows.length === 0) {
      return errorResponse('Credenciales inválidas', 401);
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return errorResponse('Credenciales inválidas', 401);
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        company_id: user.company_id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return successResponse({
      token,
      company_id: user.company_id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

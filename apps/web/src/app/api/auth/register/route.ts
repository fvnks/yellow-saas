import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'yellow-erp-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, companyName, fullName, phone } = body;

    if (!email || !password || !companyName) {
      return errorResponse('Email, password, and company name are required', 400);
    }

    const existingUser = await query('SELECT id FROM profiles WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return errorResponse('Email already registered', 400);
    }

    const slug = companyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const companyResult = await query(
      `INSERT INTO companies (name, slug, plan, status, trial_ends_at)
       VALUES ($1, $2, 'free', 'trial', $3)
       RETURNING id, name, slug`,
      [companyName, slug, trialEndsAt]
    );

    const company = companyResult.rows[0];

    const passwordHash = await bcrypt.hash(password, 12);

    const userResult = await query(
      `INSERT INTO profiles (id, company_id, email, name, password_hash, role, status)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'owner', 'active')
       RETURNING id, email, name`,
      [company.id, email, fullName || email.split('@')[0], passwordHash]
    );

    const user = userResult.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        company_id: company.id,
        role: 'owner',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return successResponse({
      token,
      company_id: company.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      company: {
        name: company.name,
        slug: company.slug,
      },
    }, 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

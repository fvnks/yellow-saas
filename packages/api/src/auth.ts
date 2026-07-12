"use server";

import { createRoute, z, type Route } from 'nextjs-rf'
import { query } from '@yellow-erp/db/client';
import { createApiError, createApiResponse } from './response';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'yellow-erp-secret-key-change-in-production';

const registerSchema = z.object({
  companyName: z.string().min(2, 'El nombre de la empresa debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'La contraseña debe incluir mayúsculas, minúsculas, números y un carácter especial'),
  fullName: z.string().min(3, 'El nombre completo debe tener al menos 3 caracteres'),
  phone: z.string().optional(),
});

export const POST = createRoute(registerSchema, async (request, { data, json }) => {
  // Check if email already exists
  const existingUser = await query('SELECT id FROM profiles WHERE email = $1', [data.email]);

  if (existingUser.rows.length > 0) {
    return json(
      createApiError('El correo electrónico ya está registrado', 'EMAIL_ALREADY_EXISTS', 400),
      { status: 400 }
    );
  }

  try {
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create company record
    const companyResult = await query(
      `INSERT INTO companies (name, slug, plan, status, settings)
       VALUES ($1, $2, 'free', 'active', '{}')
       RETURNING id`,
      [data.companyName, data.companyName.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 9)]
    );

    const companyId = companyResult.rows[0].id;

    // Create profile linked to company
    const profileResult = await query(
      `INSERT INTO profiles (id, company_id, email, name, password_hash, role, status)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'owner', 'active')
       RETURNING id, email, name`,
      [companyId, data.email, data.fullName, passwordHash]
    );

    const profile = profileResult.rows[0];

    // Initialize default inventory categories for the company
    const categories = [
      { name: 'Electrónica', color: '#6366f1', icon: 'Package' },
      { name: 'Oficina', color: '#10b981', icon: 'PenTool' },
      { name: 'Mobiliario', color: '#f59e0b', icon: 'Table' },
      { name: 'Herramientas', color: '#ef4444', icon: 'Hammer' },
    ];

    for (let i = 0; i < categories.length; i++) {
      await query(
        `INSERT INTO inventory_categories (company_id, name, color, icon, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [companyId, categories[i].name, categories[i].color, categories[i].icon, i]
      );
    }

    const token = jwt.sign(
      {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        company_id: companyId,
        role: 'owner',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return json(createApiResponse({
      token,
      user: profile,
      company: { id: companyId, name: data.companyName },
    }));

  } catch (error) {
    return json(
      createApiError(
        'Error interno del servidor',
        'INTERNAL_SERVER_ERROR',
        500
      ),
      { status: 500 }
    );
  }
});

export type RegisterResponse = Route<typeof POST>['response'];

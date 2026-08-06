import { query } from '@yellow-erp/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { createApiError, createApiResponse } from './response';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('La variable de entorno JWT_SECRET es requerida. Configúrala antes de iniciar la aplicación.');
}
const JWT_SECRET: string = jwtSecret;

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

export type RegisterInput = z.infer<typeof registerSchema>;

export async function register(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { status: 400 as const, body: createApiError('Datos inválidos', 'VALIDATION_ERROR', 400, parsed.error.flatten()) };
  }

  const input = parsed.data;

  const existingUser = await query('SELECT id FROM profiles WHERE email = $1', [input.email]);
  if (existingUser.rows.length > 0) {
    return { status: 400 as const, body: createApiError('El correo electrónico ya está registrado', 'EMAIL_ALREADY_EXISTS', 400) };
  }

  try {
    const passwordHash = await bcrypt.hash(input.password, 12);

    const companyResult = await query(
      `INSERT INTO companies (name, slug, plan, status, settings)
       VALUES ($1, $2, 'free', 'active', '{}')
       RETURNING id`,
      [input.companyName, input.companyName.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 9)]
    );

    const companyId = companyResult.rows[0].id;

    const profileResult = await query(
      `INSERT INTO profiles (id, company_id, email, name, password_hash, role, status)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'owner', 'active')
       RETURNING id, email, name`,
      [companyId, input.email, input.fullName, passwordHash]
    );

    const profile = profileResult.rows[0];

    const token = jwt.sign(
      { id: profile.id, email: profile.email, name: profile.name, company_id: companyId, role: 'owner' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { status: 200 as const, body: createApiResponse({ token, user: profile, company: { id: companyId, name: input.companyName } }) };
  } catch {
    return { status: 500 as const, body: createApiError('Error interno del servidor', 'INTERNAL_SERVER_ERROR', 500) };
  }
}

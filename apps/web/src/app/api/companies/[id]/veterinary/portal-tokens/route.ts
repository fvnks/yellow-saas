import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';
import crypto from 'crypto';

const JWT_SECRET = getJwtSecret();

async function getUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies.get('auth-token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.id as string;
  } catch (err) {
    console.error('Silenced error:', err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId(req);
    const params = parseSearchParams(req);
    const { page = 1, limit = 50, search = '' } = params;
    const offset = (page - 1) * limit;

    let where = 'WHERE pt.company_id = $1';
    const args: any[] = [companyId];
    let paramIdx = 2;

    if (search) {
      where += ` AND (p.name ILIKE $${paramIdx} OR c.full_name ILIKE $${paramIdx} OR pt.token ILIKE $${paramIdx})`;
      args.push(`%${search}%`);
      paramIdx++;
    }

    const countResult = await query(`SELECT COUNT(*) FROM veterinary_portal_tokens pt LEFT JOIN veterinary_patients p ON p.id = pt.patient_id LEFT JOIN veterinary_clients c ON c.id = pt.client_id ${where}`, args);
    const total = parseInt(countResult.rows[0]?.count || '0');

    const result = await query(
      `SELECT pt.*, p.name as patient_name, p.species, p.breed,
              c.full_name as client_name, c.rut as client_rut, c.phone as client_phone
       FROM veterinary_portal_tokens pt
       LEFT JOIN veterinary_patients p ON p.id = pt.patient_id
       LEFT JOIN veterinary_clients c ON c.id = pt.client_id
       ${where}
       ORDER BY pt.created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...args, limit, offset]
    );

    return paginatedResponse(result.rows, total, page, limit);
  } catch (error: any) {
    return errorResponse(error.message || 'Error al obtener tokens', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyId(req);
    const userId = await getUserId(req);
    if (!userId) return errorResponse('No autorizado', 401);
    const body = await req.json();
    const { patient_id, client_id, expires_at } = body;

    if (!patient_id || !client_id) {
      return errorResponse('patient_id y client_id son requeridos', 400);
    }

    const token = crypto.randomBytes(32).toString('hex');

    const result = await query(
      `INSERT INTO veterinary_portal_tokens (company_id, patient_id, client_id, token, expires_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [companyId, patient_id, client_id, token, expires_at || null, userId]
    );

    return successResponse(result.rows[0], 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Error al crear token', 500);
  }
}

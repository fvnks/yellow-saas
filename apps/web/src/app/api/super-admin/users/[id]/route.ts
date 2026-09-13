import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const { id } = params;
  const body = await request.json();
  const { role, status, email, full_name, company_id, password } = body;

  const validRoles = ['owner', 'admin', 'manager', 'member', 'viewer'];
  const validStatuses = ['active', 'invited', 'suspended'];

  if (role && !validRoles.includes(role)) return errorResponse('Rol inválido', 400);
  if (status && !validStatuses.includes(status)) return errorResponse('Estado inválido', 400);

  try {
    const existing = await query('SELECT id FROM profiles WHERE id = $1', [id]);
    if (existing.rows.length === 0) return errorResponse('Usuario no encontrado', 404);

    if (company_id) {
      const compCheck = await query('SELECT id FROM companies WHERE id = $1', [company_id]);
      if (compCheck.rows.length === 0) return errorResponse('Empresa destino no encontrada', 404);
    }

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (role) { updates.push(`role = $${idx++}`); values.push(role); }
    if (status) { updates.push(`status = $${idx++}`); values.push(status); }
    if (email) { updates.push(`email = $${idx++}`); values.push(email); }
    if (full_name) { updates.push(`full_name = $${idx++}`); values.push(full_name); }
    if (company_id) { updates.push(`company_id = $${idx++}`); values.push(company_id); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${idx++}`);
      values.push(hash);
    }

    if (updates.length === 0) return errorResponse('Sin cambios para actualizar', 400);

    updates.push(`updated_at = now()`);
    values.push(id);

    await query(`UPDATE profiles SET ${updates.join(', ')} WHERE id = $${idx}`, values);

    return successResponse({ success: true, message: 'Usuario actualizado correctamente' });
  } catch (err) {
    console.error('User update error:', err);
    return errorResponse('Error al actualizar usuario', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const { id } = params;

  try {
    const existing = await query('SELECT id FROM profiles WHERE id = $1', [id]);
    if (existing.rows.length === 0) return errorResponse('Usuario no encontrado', 404);

    await query('DELETE FROM profiles WHERE id = $1', [id]);

    return successResponse({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('User delete error:', err);
    return errorResponse('Error al eliminar usuario', 500);
  }
}

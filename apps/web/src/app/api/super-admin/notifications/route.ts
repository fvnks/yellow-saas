import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  try {
    const result = await query(`
      SELECT 
        n.id, n.title, n.message, n.type, n.is_read, n.created_at,
        c.name as company_name, c.id as company_id
      FROM platform_notifications n
      LEFT JOIN companies c ON c.id = n.company_id
      ORDER BY n.created_at DESC
      LIMIT 200
    `);

    return successResponse(result.rows);
  } catch (err) {
    console.error('Notifications list error:', err);
    return errorResponse('Error al obtener notificaciones', 500);
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const body = await request.json();
  const { company_id, title, message, type } = body;

  if (!title || !message) return errorResponse('Título y mensaje son requeridos', 400);

  try {
    if (company_id) {
      await query(
        'INSERT INTO platform_notifications (company_id, title, message, type, created_by) VALUES ($1, $2, $3, $4, $5)',
        [company_id, title, message, type || 'info', admin.id]
      );
    } else {
      const companies = await query('SELECT id FROM companies');
      for (const comp of companies.rows) {
        await query(
          'INSERT INTO platform_notifications (company_id, title, message, type, created_by) VALUES ($1, $2, $3, $4, $5)',
          [comp.id, title, message, type || 'info', admin.id]
        );
      }
    }

    return successResponse({ success: true });
  } catch (err) {
    console.error('Notification create error:', err);
    return errorResponse('Error al crear notificación', 500);
  }
}

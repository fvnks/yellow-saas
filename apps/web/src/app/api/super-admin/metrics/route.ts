import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  try {
    const dbStart = Date.now();
    const [companiesResult, usersResult, trialResult, activeUsersResult, recentResult, superAdminsResult] = await Promise.all([
      query('SELECT COUNT(*) as total FROM companies'),
      query('SELECT COUNT(*) as total FROM profiles'),
      query("SELECT COUNT(*) as total FROM companies WHERE status = 'trial'"),
      query("SELECT COUNT(*) as total FROM profiles WHERE status = 'active'"),
      query("SELECT COUNT(*) as total FROM profiles WHERE created_at > now() - interval '30 days'"),
      query('SELECT COUNT(*) as total FROM super_admins WHERE is_active = true'),
    ]);

    const activeCompaniesResult = await query("SELECT COUNT(*) as total FROM companies WHERE status = 'active'");
    const dbLatency = Date.now() - dbStart;

    return successResponse({
      totalCompanies: parseInt(companiesResult.rows[0].total),
      activeCompanies: parseInt(activeCompaniesResult.rows[0].total),
      trialCompanies: parseInt(trialResult.rows[0].total),
      totalUsers: parseInt(usersResult.rows[0].total),
      activeUsers: parseInt(activeUsersResult.rows[0].total),
      recentSignups: parseInt(recentResult.rows[0].total),
      superAdmins: parseInt(superAdminsResult.rows[0].total),
      dbStatus: 'connected',
      dbLatency,
    });
  } catch (err) {
    console.error('Metrics error:', err);
    return successResponse({
      totalCompanies: 0,
      activeCompanies: 0,
      trialCompanies: 0,
      totalUsers: 0,
      activeUsers: 0,
      recentSignups: 0,
      superAdmins: 0,
      dbStatus: 'error',
      dbLatency: 0,
    });
  }
}

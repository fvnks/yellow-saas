import { NextRequest } from 'next/server';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { integration_id, config } = body;
    if (!integration_id) return errorResponse('integration_id is required');

    // Test connection based on integration type
    switch (integration_id) {
      case 'sii':
        if (!config?.sii_username || !config?.sii_password) {
          return successResponse({ success: false, message: 'Usuario y contraseña requeridos' });
        }
        // In production, would test SII API connection
        return successResponse({ success: true, message: 'Conexión SII verificada (demo)' });

      case 'stripe':
        if (!config?.stripe_secret_key) {
          return successResponse({ success: false, message: 'Secret key requerida' });
        }
        // In production, would verify Stripe API key
        return successResponse({ success: true, message: 'Stripe conectado exitosamente (demo)' });

      case 'mach':
        if (!config?.mach_api_key || !config?.mach_secret) {
          return successResponse({ success: false, message: 'API Key y Secret requeridos' });
        }
        return successResponse({ success: true, message: 'Mach conectado exitosamente (demo)' });

      case 'email':
        if (!config?.smtp_host || !config?.smtp_user || !config?.smtp_password) {
          return successResponse({ success: false, message: 'Servidor, usuario y contraseña requeridos' });
        }
        return successResponse({ success: true, message: 'Conexión SMTP verificada (demo)' });

      default:
        return errorResponse('Integración no soportada');
    }
  } catch (error: any) {
    return errorResponse(error.message || 'Error testing integration');
  }
}

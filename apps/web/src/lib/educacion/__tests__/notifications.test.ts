import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de la base de datos
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(),
}));

describe('notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Los tests de notificaciones requieren un mock más complejo de la base de datos
  // Por ahora, solo verificamos que el módulo se importa correctamente
  it('debe exportar las funciones de notificación', async () => {
    const notifications = await import('../notifications');
    
    expect(notifications.notificarComunicado).toBeDefined();
    expect(notifications.alertarInasistencia).toBeDefined();
    expect(notifications.alertarPagoVencido).toBeDefined();
    expect(notifications.alertarNotaBaja).toBeDefined();
    expect(notifications.enviarNotificacionPersonalizada).toBeDefined();
  });
});

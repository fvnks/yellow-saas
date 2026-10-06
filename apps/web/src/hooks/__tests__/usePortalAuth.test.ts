import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePortalAuth } from '../usePortalAuth';

// El router debe tener identidad estable: si `useRouter()` devuelve un objeto
// nuevo en cada render, `verifyToken` (useCallback [router]) se recrea y el
// useEffect entra en bucle infinito.
const { push, router } = vi.hoisted(() => {
  const push = vi.fn();
  return { push, router: { push } };
});

vi.mock('next/navigation', () => ({
  useRouter: () => router,
}));

const fetchMock = vi.fn();

function setCookie(value: string) {
  document.cookie = `portal_token=${value}; path=/`;
}

function clearCookie() {
  document.cookie = 'portal_token=; path=/; max-age=0';
}

/** Renderiza el hook dejando resolver los efectos async antes de continuar. */
async function renderAuthHook() {
  let hook!: { result: { current: ReturnType<typeof usePortalAuth> } };
  await act(async () => {
    hook = renderHook(() => usePortalAuth());
  });
  return hook;
}

describe('usePortalAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCookie();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    clearCookie();
    vi.unstubAllGlobals();
  });

  it('debe inicializar sin apoderado y sin error', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401 });

    const { result } = await renderAuthHook();

    expect(result.current.apoderado).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('debe redirigir al login si no hay token', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401 });

    const { result } = await renderAuthHook();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(push).toHaveBeenCalledWith('/portal-apoderado/login');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('debe verificar el token correctamente', async () => {
    setCookie('token123');

    const mockApoderado = {
      id: '1',
      nombres: 'Juan',
      apellido_paterno: 'Pérez',
      email: 'juan@email.com',
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { apoderado: mockApoderado } }),
    });

    const { result } = await renderAuthHook();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal-apoderado/verify',
      expect.objectContaining({
        headers: { Authorization: 'Bearer token123' },
      })
    );
    expect(result.current.apoderado).toEqual(mockApoderado);
    expect(result.current.error).toBeNull();
  });

  it('debe manejar errores de verificación', async () => {
    setCookie('invalid');

    fetchMock.mockResolvedValue({ ok: false, status: 401 });

    const { result } = await renderAuthHook();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.apoderado).toBeNull();
    expect(result.current.error).toBe('Token inválido');
    expect(push).toHaveBeenCalledWith('/portal-apoderado/login?expired=1');
  });

  it('debe hacer logout correctamente', async () => {
    setCookie('token123');

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { apoderado: { id: '1' } } }),
    });

    const { result } = await renderAuthHook();

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.logout();
    });

    expect(document.cookie).not.toContain('portal_token=token123');
    expect(result.current.apoderado).toBeNull();
    expect(push).toHaveBeenCalledWith('/portal-apoderado');
  });
});

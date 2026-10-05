import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEstudiantes } from '../useEstudiantes';

// Mock de fetch
global.fetch = vi.fn();

describe('useEstudiantes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe inicializar con valores por defecto', () => {
    const { result } = renderHook(() => useEstudiantes({ autoFetch: false }));

    expect(result.current.estudiantes).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.total).toBe(0);
  });

  it('debe cargar estudiantes correctamente', async () => {
    const mockEstudiantes = [
      {
        id: '1',
        rut: '12345678-9',
        nombres: 'Juan',
        apellido_paterno: 'Pérez',
        estado: 'activo',
      },
    ];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockEstudiantes, total: 1 }),
    });

    const { result } = renderHook(() => useEstudiantes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.estudiantes).toEqual(mockEstudiantes);
    expect(result.current.total).toBe(1);
  });

  it('debe manejar errores correctamente', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Error de red'));

    const { result } = renderHook(() => useEstudiantes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Error de red');
  });

  it('debe crear un estudiante correctamente', async () => {
    const nuevoEstudiante = {
      rut: '12345678-9',
      nombres: 'Juan',
      apellido_paterno: 'Pérez',
      fecha_nacimiento: '2015-01-01',
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: '1', ...nuevoEstudiante } }),
    });

    const { result } = renderHook(() => useEstudiantes({ autoFetch: false }));

    const creado = await result.current.createEstudiante(nuevoEstudiante);

    expect(creado).toEqual({ id: '1', ...nuevoEstudiante });
  });

  it('debe actualizar un estudiante correctamente', async () => {
    const estudianteActualizado = {
      nombres: 'Juan Carlos',
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: '1', ...estudianteActualizado } }),
    });

    const { result } = renderHook(() => useEstudiantes({ autoFetch: false }));

    const actualizado = await result.current.updateEstudiante('1', estudianteActualizado);

    expect(actualizado).toEqual({ id: '1', ...estudianteActualizado });
  });

  it('debe eliminar un estudiante correctamente', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Estudiante eliminado' }),
    });

    const { result } = renderHook(() => useEstudiantes({ autoFetch: false }));

    await result.current.deleteEstudiante('1');

    expect(fetch).toHaveBeenCalledWith(
      '/api/educacion/estudiantes/1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

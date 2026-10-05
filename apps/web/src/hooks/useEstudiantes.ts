'use client';

import { useState, useEffect, useCallback } from 'react';
import { Estudiante, EstudianteCreate, EstudianteUpdate } from '@/types/educacion';
import { estudiantesApi } from '@/lib/educacion/api-client';

interface UseEstudiantesOptions {
  curso_id?: string;
  estado?: string;
  search?: string;
  autoFetch?: boolean;
}

export function useEstudiantes(options: UseEstudiantesOptions = {}) {
  const { curso_id, estado, search, autoFetch = true } = options;

  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchEstudiantes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await estudiantesApi.listar({
        curso_id,
        estado,
        search,
      });
      setEstudiantes(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener estudiantes');
    } finally {
      setLoading(false);
    }
  }, [curso_id, estado, search]);

  const createEstudiante = async (data: EstudianteCreate) => {
    try {
      setLoading(true);
      setError(null);
      const response = await estudiantesApi.crear(data);
      setEstudiantes((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear estudiante');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEstudiante = async (id: string, data: EstudianteUpdate) => {
    try {
      setLoading(true);
      setError(null);
      const response = await estudiantesApi.actualizar(id, data);
      setEstudiantes((prev) =>
        prev.map((est) => (est.id === id ? response.data : est))
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estudiante');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEstudiante = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await estudiantesApi.eliminar(id);
      setEstudiantes((prev) => prev.filter((est) => est.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar estudiante');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchEstudiantes();
    }
  }, [autoFetch, fetchEstudiantes]);

  return {
    estudiantes,
    loading,
    error,
    total,
    fetchEstudiantes,
    createEstudiante,
    updateEstudiante,
    deleteEstudiante,
  };
}

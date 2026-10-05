'use client';

import { useState, useEffect, useCallback } from 'react';
import { Curso, CursoCreate, CursoUpdate } from '@/types/educacion';
import { cursosApi } from '@/lib/educacion/api-client';

interface UseCursosOptions {
  anio_lectivo?: number;
  nivel?: string;
  autoFetch?: boolean;
}

export function useCursos(options: UseCursosOptions = {}) {
  const { anio_lectivo, nivel, autoFetch = true } = options;

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCursos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cursosApi.listar({
        anio_lectivo,
        nivel,
      });
      setCursos(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener cursos');
    } finally {
      setLoading(false);
    }
  }, [anio_lectivo, nivel]);

  const createCurso = async (data: CursoCreate) => {
    try {
      setLoading(true);
      setError(null);
      const response = await cursosApi.crear(data);
      setCursos((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear curso');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCurso = async (id: string, data: CursoUpdate) => {
    try {
      setLoading(true);
      setError(null);
      const response = await cursosApi.actualizar(id, data);
      setCursos((prev) =>
        prev.map((curso) => (curso.id === id ? response.data : curso))
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar curso');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCurso = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await cursosApi.eliminar(id);
      setCursos((prev) => prev.filter((curso) => curso.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar curso');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchCursos();
    }
  }, [autoFetch, fetchCursos]);

  return {
    cursos,
    loading,
    error,
    fetchCursos,
    createCurso,
    updateCurso,
    deleteCurso,
  };
}

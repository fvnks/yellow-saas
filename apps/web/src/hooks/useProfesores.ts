'use client';

import { useState, useEffect, useCallback } from 'react';
import { Profesor, ProfesorCreate, ProfesorUpdate } from '@/types/educacion';
import { profesoresApi } from '@/lib/educacion/api-client';

interface UseProfesoresOptions {
  estado?: string;
  search?: string;
  autoFetch?: boolean;
}

export function useProfesores(options: UseProfesoresOptions = {}) {
  const { estado, search, autoFetch = true } = options;

  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfesores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await profesoresApi.listar({
        estado,
        search,
      });
      setProfesores(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener profesores');
    } finally {
      setLoading(false);
    }
  }, [estado, search]);

  const createProfesor = async (data: ProfesorCreate) => {
    try {
      setLoading(true);
      setError(null);
      const response = await profesoresApi.crear(data);
      setProfesores((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear profesor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfesor = async (id: string, data: ProfesorUpdate) => {
    try {
      setLoading(true);
      setError(null);
      const response = await profesoresApi.actualizar(id, data);
      setProfesores((prev) =>
        prev.map((prof) => (prof.id === id ? response.data : prof))
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar profesor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProfesor = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await profesoresApi.eliminar(id);
      setProfesores((prev) => prev.filter((prof) => prof.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar profesor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchProfesores();
    }
  }, [autoFetch, fetchProfesores]);

  return {
    profesores,
    loading,
    error,
    fetchProfesores,
    createProfesor,
    updateProfesor,
    deleteProfesor,
  };
}

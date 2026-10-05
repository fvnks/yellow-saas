'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calificacion, CalificacionCreate } from '@/types/educacion';
import { calificacionesApi } from '@/lib/educacion/api-client';

interface UseCalificacionesOptions {
  curso_id?: string;
  estudiante_id?: string;
  periodo?: number;
  anio_lectivo?: number;
  autoFetch?: boolean;
}

export function useCalificaciones(options: UseCalificacionesOptions = {}) {
  const { curso_id, estudiante_id, periodo, anio_lectivo, autoFetch = true } = options;

  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalificaciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await calificacionesApi.listar({
        curso_id,
        estudiante_id,
        periodo,
        anio_lectivo,
      });
      setCalificaciones(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener calificaciones');
    } finally {
      setLoading(false);
    }
  }, [curso_id, estudiante_id, periodo, anio_lectivo]);

  const crearCalificacion = async (data: CalificacionCreate) => {
    try {
      setLoading(true);
      setError(null);
      const response = await calificacionesApi.crear(data);
      setCalificaciones((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear calificación');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const crearCalificacionesMasivo = async (data: CalificacionCreate[]) => {
    try {
      setLoading(true);
      setError(null);
      const nuevasCalificaciones = [];
      for (const cal of data) {
        const response = await calificacionesApi.crear(cal);
        nuevasCalificaciones.push(response.data);
      }
      setCalificaciones((prev) => [...prev, ...nuevasCalificaciones]);
      return nuevasCalificaciones;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear calificaciones');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchCalificaciones();
    }
  }, [autoFetch, fetchCalificaciones]);

  return {
    calificaciones,
    loading,
    error,
    fetchCalificaciones,
    crearCalificacion,
    crearCalificacionesMasivo,
  };
}

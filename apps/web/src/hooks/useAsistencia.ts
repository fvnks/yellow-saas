'use client';

import { useState, useEffect, useCallback } from 'react';
import { Asistencia, AsistenciaCreate } from '@/types/educacion';
import { asistenciaApi } from '@/lib/educacion/api-client';

interface UseAsistenciaOptions {
  curso_id?: string;
  fecha?: string;
  estado?: string;
  autoFetch?: boolean;
}

export function useAsistencia(options: UseAsistenciaOptions = {}) {
  const { curso_id, fecha, estado, autoFetch = true } = options;

  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAsistencias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await asistenciaApi.listar({
        curso_id,
        fecha,
        estado,
      });
      setAsistencias(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener asistencia');
    } finally {
      setLoading(false);
    }
  }, [curso_id, fecha, estado]);

  const registrarAsistencia = async (data: AsistenciaCreate | AsistenciaCreate[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await asistenciaApi.registrar(data);
      
      if (Array.isArray(data)) {
        // Registro masivo
        setAsistencias((prev) => {
          const newAsistencias = [...prev];
          response.data.forEach((asist: Asistencia) => {
            const index = newAsistencias.findIndex(
              (a) => a.estudiante_id === asist.estudiante_id && a.fecha === asist.fecha
            );
            if (index >= 0) {
              newAsistencias[index] = asist;
            } else {
              newAsistencias.push(asist);
            }
          });
          return newAsistencias;
        });
      } else {
        // Registro individual
        setAsistencias((prev) => {
          const index = prev.findIndex(
            (a) => a.estudiante_id === data.estudiante_id && a.fecha === data.fecha
          );
          if (index >= 0) {
            const newAsistencias = [...prev];
            newAsistencias[index] = response.data;
            return newAsistencias;
          }
          return [...prev, response.data];
        });
      }
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar asistencia');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchAsistencias();
    }
  }, [autoFetch, fetchAsistencias]);

  return {
    asistencias,
    loading,
    error,
    fetchAsistencias,
    registrarAsistencia,
  };
}

'use client';

import { useState, useEffect } from 'react';

/**
 * Carga las opciones reales de estudiantes, cursos y asignaturas para los
 * desplegables de los formularios del módulo educativo.
 */
export function useEducacionOptions() {
  const [estudiantes, setEstudiantes] = useState<{ id: string; nombres: string; apellido_paterno: string; rut: string; curso_id?: string | null }[]>([]);
  const [cursos, setCursos] = useState<{ id: string; nombre: string; anio_lectivo: number }[]>([]);
  const [asignaturas, setAsignaturas] = useState<{ id: string; nombre: string; nivel?: string; horas_semanales?: number }[]>([]);
  const [profesores, setProfesores] = useState<{ id: string; nombres: string; apellido_paterno: string }[]>([]);

  useEffect(() => {
    let cancelado = false;
    Promise.all([
      fetch('/api/educacion/estudiantes?limit=500').then((r) => r.json()).catch(() => ({ data: [] })),
      fetch('/api/educacion/cursos').then((r) => r.json()).catch(() => ({ data: [] })),
      fetch('/api/educacion/asignaturas').then((r) => r.json()).catch(() => ({ data: [] })),
      fetch('/api/educacion/profesores').then((r) => r.json()).catch(() => ({ data: [] })),
    ]).then(([est, cur, asr, prof]) => {
      if (cancelado) return;
      setEstudiantes(est.data || []);
      setCursos(cur.data || []);
      setAsignaturas(asr.data || []);
      setProfesores(prof.data || []);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  return { estudiantes, cursos, asignaturas, profesores };
}

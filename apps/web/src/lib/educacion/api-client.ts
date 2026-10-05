// ============================================
// CLIENTE API PARA EL MÓDULO EDUCATIVO
// ============================================

import type {
  Estudiante,
  EstudianteCreate,
  EstudianteUpdate,
  Curso,
  CursoCreate,
  CursoUpdate,
  Profesor,
  ProfesorCreate,
  ProfesorUpdate,
  Asistencia,
  AsistenciaCreate,
  Calificacion,
  CalificacionCreate,
} from '@/types/educacion';

const BASE_URL = '/api/educacion';

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }

  return response.json();
}

// Estudiantes
export const estudiantesApi = {
  listar: (params?: { curso_id?: string; estado?: string; search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.curso_id) searchParams.append('curso_id', params.curso_id);
    if (params?.estado) searchParams.append('estado', params.estado);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    return fetchApi<{ data: Estudiante[]; total: number }>(`/estudiantes?${searchParams}`);
  },

  obtener: (id: string) => fetchApi<{ data: Estudiante }>(`/estudiantes/${id}`),

  crear: (data: EstudianteCreate) =>
    fetchApi<{ data: Estudiante }>('/estudiantes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  actualizar: (id: string, data: EstudianteUpdate) =>
    fetchApi<{ data: Estudiante }>(`/estudiantes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  eliminar: (id: string) =>
    fetchApi<{ message: string }>(`/estudiantes/${id}`, {
      method: 'DELETE',
    }),
};

// Cursos
export const cursosApi = {
  listar: (params?: { anio_lectivo?: number; nivel?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.anio_lectivo) searchParams.append('anio_lectivo', params.anio_lectivo.toString());
    if (params?.nivel) searchParams.append('nivel', params.nivel);
    return fetchApi<{ data: Curso[] }>(`/cursos?${searchParams}`);
  },

  obtener: (id: string) => fetchApi<{ data: Curso }>(`/cursos/${id}`),

  crear: (data: CursoCreate) =>
    fetchApi<{ data: Curso }>('/cursos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  actualizar: (id: string, data: CursoUpdate) =>
    fetchApi<{ data: Curso }>(`/cursos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  eliminar: (id: string) =>
    fetchApi<{ message: string }>(`/cursos/${id}`, {
      method: 'DELETE',
    }),
};

// Profesores
export const profesoresApi = {
  listar: (params?: { estado?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.estado) searchParams.append('estado', params.estado);
    if (params?.search) searchParams.append('search', params.search);
    return fetchApi<{ data: Profesor[] }>(`/profesores?${searchParams}`);
  },

  obtener: (id: string) => fetchApi<{ data: Profesor }>(`/profesores/${id}`),

  crear: (data: ProfesorCreate) =>
    fetchApi<{ data: Profesor }>('/profesores', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  actualizar: (id: string, data: ProfesorUpdate) =>
    fetchApi<{ data: Profesor }>(`/profesores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  eliminar: (id: string) =>
    fetchApi<{ message: string }>(`/profesores/${id}`, {
      method: 'DELETE',
    }),
};

// Asistencia
export const asistenciaApi = {
  listar: (params?: { curso_id?: string; fecha?: string; estado?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.curso_id) searchParams.append('curso_id', params.curso_id);
    if (params?.fecha) searchParams.append('fecha', params.fecha);
    if (params?.estado) searchParams.append('estado', params.estado);
    return fetchApi<{ data: Asistencia[] }>(`/asistencia?${searchParams}`);
  },

  registrar: (data: AsistenciaCreate | AsistenciaCreate[]) =>
    fetchApi<{ data: Asistencia | Asistencia[] }>('/asistencia', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Calificaciones
export const calificacionesApi = {
  listar: (params?: { curso_id?: string; estudiante_id?: string; periodo?: number; anio_lectivo?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.curso_id) searchParams.append('curso_id', params.curso_id);
    if (params?.estudiante_id) searchParams.append('estudiante_id', params.estudiante_id);
    if (params?.periodo) searchParams.append('periodo', params.periodo.toString());
    if (params?.anio_lectivo) searchParams.append('anio_lectivo', params.anio_lectivo.toString());
    return fetchApi<{ data: Calificacion[] }>(`/calificaciones?${searchParams}`);
  },

  crear: (data: CalificacionCreate) =>
    fetchApi<{ data: Calificacion }>('/calificaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

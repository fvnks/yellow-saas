// ============================================
// RUTAS DEL MÓDULO EDUCATIVO
// ============================================

export const EDUCACION_ROUTES = {
  // Dashboard
  dashboard: '/educacion',

  // Estudiantes
  estudiantes: {
    listar: '/educacion/estudiantes',
    crear: '/educacion/estudiantes/crear',
    editar: (id: string) => `/educacion/estudiantes/${id}/editar`,
    ver: (id: string) => `/educacion/estudiantes/${id}`,
  },

  // Apoderados
  apoderados: {
    listar: '/educacion/apoderados',
    crear: '/educacion/apoderados/crear',
    editar: (id: string) => `/educacion/apoderados/${id}/editar`,
    ver: (id: string) => `/educacion/apoderados/${id}`,
  },

  // Cursos
  cursos: {
    listar: '/educacion/cursos',
    crear: '/educacion/cursos/crear',
    editar: (id: string) => `/educacion/cursos/${id}/editar`,
    ver: (id: string) => `/educacion/cursos/${id}`,
  },

  // Profesores
  profesores: {
    listar: '/educacion/profesores',
    crear: '/educacion/profesores/crear',
    editar: (id: string) => `/educacion/profesores/${id}/editar`,
    ver: (id: string) => `/educacion/profesores/${id}`,
  },

  // Asignaturas
  asignaturas: {
    listar: '/educacion/asignaturas',
    crear: '/educacion/asignaturas/crear',
    editar: (id: string) => `/educacion/asignaturas/${id}/editar`,
    ver: (id: string) => `/educacion/asignaturas/${id}`,
  },

  // Asistencia
  asistencia: {
    listar: '/educacion/asistencia',
    registrar: '/educacion/asistencia/registrar',
    reporte: '/educacion/asistencia/reporte',
  },

  // Calificaciones
  calificaciones: {
    listar: '/educacion/calificaciones',
    ingresar: '/educacion/calificaciones/ingresar',
    libroClases: '/educacion/calificaciones/libro-clases',
    reporte: '/educacion/calificaciones/reporte',
  },

  // Comunicados
  comunicados: {
    listar: '/educacion/comunicados',
    crear: '/educacion/comunicados/crear',
    editar: (id: string) => `/educacion/comunicados/${id}/editar`,
    ver: (id: string) => `/educacion/comunicados/${id}`,
  },

  // Pensiones
  pensiones: {
    listar: '/educacion/pensiones',
    generar: '/educacion/pensiones/generar',
    registrarPago: (id: string) => `/educacion/pensiones/${id}/pagar`,
    reporte: '/educacion/pensiones/reporte',
  },

  // Matrículas
  matriculas: {
    listar: '/educacion/matriculas',
    crear: '/educacion/matriculas/crear',
    editar: (id: string) => `/educacion/matriculas/${id}/editar`,
  },

  // Eventos
  eventos: {
    listar: '/educacion/eventos',
    crear: '/educacion/eventos/crear',
    editar: (id: string) => `/educacion/eventos/${id}/editar`,
    ver: (id: string) => `/educacion/eventos/${id}`,
  },

  // Biblioteca
  biblioteca: {
    listar: '/educacion/biblioteca',
    crear: '/educacion/biblioteca/crear',
    prestamos: '/educacion/biblioteca/prestamos',
  },

  // Admisión
  admision: {
    listar: '/educacion/admision',
    crear: '/educacion/admision/crear',
    editar: (id: string) => `/educacion/admision/${id}/editar`,
  },

  // Transporte
  transporte: {
    rutas: '/educacion/transporte/rutas',
    paraderos: '/educacion/transporte/paraderos',
    asignaciones: '/educacion/transporte/asignaciones',
  },

  // Subvenciones
  subvenciones: {
    listar: '/educacion/subvenciones',
    crear: '/educacion/subvenciones/crear',
    editar: (id: string) => `/educacion/subvenciones/${id}/editar`,
  },

  // Reportes
  reportes: {
    asistencia: '/educacion/reportes/asistencia',
    calificaciones: '/educacion/reportes/calificaciones',
    morosidad: '/educacion/reportes/morosidad',
    mineduc: '/educacion/reportes/mineduc',
    estadisticas: '/educacion/reportes/estadisticas',
  },

  // Configuración
  configuracion: '/educacion/configuracion',
} as const;

// Rutas del portal del apoderado
export const PORTAL_APODERADO_ROUTES = {
  login: '/portal-apoderado',
  dashboard: '/portal-apoderado/dashboard',
  notas: '/portal-apoderado/notas',
  asistencia: '/portal-apoderado/asistencia',
  comunicados: '/portal-apoderado/comunicados',
  pagos: '/portal-apoderado/pagos',
  perfil: '/portal-apoderado/perfil',
} as const;

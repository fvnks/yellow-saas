// ============================================
// CONFIGURACIÓN DEL MÓDULO EDUCATIVO
// ============================================

export const EDUCACION_CONFIG = {
  // Configuración general
  nombre: 'Módulo Educativo',
  descripcion: 'Gestión integral de instituciones educacionales',
  version: '1.0.0',

  // Configuración de paginación
  paginacion: {
    limitePorDefecto: 20,
    opcionesLimite: [10, 20, 50, 100],
  },

  // Configuración de calificaciones
  calificaciones: {
    notaMinima: 1.0,
    notaMaxima: 7.0,
    notaAprobacion: 4.0,
    decimales: 1,
  },

  // Configuración de asistencia
  asistencia: {
    porcentajeExcelente: 95,
    porcentajeBuena: 90,
    porcentajeRegular: 85,
  },

  // Configuración de pensiones
  pensiones: {
    diaVencimiento: 5,
    mesesGeneracion: 12,
  },

  // Configuración de eventos
  eventos: {
    diasPrevioNotificacion: 7,
  },

  // Configuración de biblioteca
  biblioteca: {
    diasPrestamo: 14,
    renovacionesPermitidas: 2,
  },

  // Configuración de admisión
  admision: {
    diasRespuesta: 30,
  },

  // Configuración de transporte
  transporte: {
    tiempoEsperaMaximo: 15, // minutos
  },

  // Configuración de subvenciones
  subvenciones: {
    tipos: ['subvencion_regular', 'PIE', 'SEP', 'otros'],
  },

  // Configuración de notificaciones
  notificaciones: {
    canales: ['email', 'sms', 'push'],
    alertas: {
      inasistencia: true,
      notaBaja: true,
      pagoVencido: true,
      eventoProximo: true,
    },
  },

  // Configuración de reportes
  reportes: {
    formatos: ['pdf', 'excel', 'csv'],
    reportesDisponibles: [
      'asistencia',
      'calificaciones',
      'morosidad',
      'mineduc',
      'estadisticas',
    ],
  },

  // Configuración de integraciones
  integraciones: {
    sii: {
      activo: true,
      ambiente: 'certificacion', // 'certificacion' | 'produccion'
    },
    mineduc: {
      activo: true,
      exportacionAsistencia: true,
    },
  },

  // Configuración de seguridad
  seguridad: {
    intentosLoginMaximos: 5,
    duracionSesion: 8 * 60 * 60 * 1000, // 8 horas en milisegundos
    requiereVerificacionEmail: true,
  },

  // Configuración de archivos
  archivos: {
    tamanoMaximo: 5 * 1024 * 1024, // 5MB
    tiposPermitidos: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
  },
} as const;

// Tipos de usuario del módulo educativo
export type TipoUsuarioEducacion =
  | 'administrador'
  | 'director'
  | 'profesor'
  | 'profesor_jefe'
  | 'apoderado'
  | 'asistente';

// Permisos del módulo educativo
export const PERMISOS_EDUCACION = {
  // Estudiantes
  'estudiantes.ver': ['administrador', 'director', 'profesor', 'profesor_jefe'],
  'estudiantes.crear': ['administrador', 'director'],
  'estudiantes.editar': ['administrador', 'director'],
  'estudiantes.eliminar': ['administrador'],

  // Cursos
  'cursos.ver': ['administrador', 'director', 'profesor', 'profesor_jefe'],
  'cursos.crear': ['administrador', 'director'],
  'cursos.editar': ['administrador', 'director'],
  'cursos.eliminar': ['administrador'],

  // Profesores
  'profesores.ver': ['administrador', 'director', 'profesor', 'profesor_jefe'],
  'profesores.crear': ['administrador', 'director'],
  'profesores.editar': ['administrador', 'director'],
  'profesores.eliminar': ['administrador'],

  // Asistencia
  'asistencia.ver': ['administrador', 'director', 'profesor', 'profesor_jefe', 'apoderado'],
  'asistencia.registrar': ['administrador', 'director', 'profesor', 'profesor_jefe'],
  'asistencia.editar': ['administrador', 'director'],

  // Calificaciones
  'calificaciones.ver': ['administrador', 'director', 'profesor', 'profesor_jefe', 'apoderado'],
  'calificaciones.ingresar': ['administrador', 'director', 'profesor', 'profesor_jefe'],
  'calificaciones.editar': ['administrador', 'director'],

  // Pensiones
  'pensiones.ver': ['administrador', 'director', 'apoderado'],
  'pensiones.generar': ['administrador', 'director'],
  'pensiones.registrar_pago': ['administrador', 'director'],

  // Comunicados
  'comunicados.ver': ['administrador', 'director', 'profesor', 'profesor_jefe', 'apoderado'],
  'comunicados.crear': ['administrador', 'director', 'profesor_jefe'],
  'comunicados.editar': ['administrador', 'director'],

  // Eventos
  'eventos.ver': ['administrador', 'director', 'profesor', 'profesor_jefe', 'apoderado'],
  'eventos.crear': ['administrador', 'director', 'profesor_jefe'],
  'eventos.editar': ['administrador', 'director'],

  // Biblioteca
  'biblioteca.ver': ['administrador', 'director', 'profesor', 'profesor_jefe', 'apoderado'],
  'biblioteca.gestionar': ['administrador', 'director'],

  // Admisión
  'admision.ver': ['administrador', 'director'],
  'admision.gestionar': ['administrador', 'director'],

  // Transporte
  'transporte.ver': ['administrador', 'director', 'apoderado'],
  'transporte.gestionar': ['administrador', 'director'],

  // Subvenciones
  'subvenciones.ver': ['administrador', 'director'],
  'subvenciones.gestionar': ['administrador', 'director'],

  // Reportes
  'reportes.ver': ['administrador', 'director'],
  'reportes.exportar': ['administrador', 'director'],

  // Configuración
  'configuracion.ver': ['administrador', 'director'],
  'configuracion.editar': ['administrador'],
} as const;

// Función para verificar permisos
export function tienePermiso(
  tipoUsuario: TipoUsuarioEducacion,
  permiso: keyof typeof PERMISOS_EDUCACION
): boolean {
  const permisos = PERMISOS_EDUCACION[permiso];
  return permisos.includes(tipoUsuario as any);
}

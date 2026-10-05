// ============================================
// CONSTANTES DEL MÓDULO EDUCATIVO
// ============================================

export const NIVELES_EDUCACION = [
  { value: 'parvularia', label: 'Parvularia' },
  { value: 'basica', label: 'Educación Básica' },
  { value: 'media', label: 'Educación Media' },
] as const;

export const JORNADAS = [
  { value: 'manana', label: 'Mañana' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'completa', label: 'Completa' },
] as const;

export const ESTADOS_ESTUDIANTE = [
  { value: 'activo', label: 'Activo', color: 'bg-green-100 text-green-800' },
  { value: 'suspendido', label: 'Suspendido', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'retirado', label: 'Retirado', color: 'bg-red-100 text-red-800' },
] as const;

export const ESTADOS_ASISTENCIA = [
  { value: 'presente', label: 'Presente', color: 'text-green-600' },
  { value: 'ausente', label: 'Ausente', color: 'text-red-600' },
  { value: 'atrasado', label: 'Atrasado', color: 'text-yellow-600' },
  { value: 'justificado', label: 'Justificado', color: 'text-blue-600' },
] as const;

export const TIPOS_EVALUACION = [
  { value: 'prueba', label: 'Prueba' },
  { value: 'trabajo', label: 'Trabajo' },
  { value: 'participacion', label: 'Participación' },
  { value: 'examen', label: 'Examen' },
] as const;

export const TIPOS_EVENTO = [
  { value: 'reunion', label: 'Reunión' },
  { value: 'celebracion', label: 'Celebración' },
  { value: 'salida_pedagogica', label: 'Salida Pedagógica' },
  { value: 'otro', label: 'Otro' },
] as const;

export const TIPOS_COMUNICADO = [
  { value: 'general', label: 'General' },
  { value: 'por_curso', label: 'Por Curso' },
  { value: 'por_nivel', label: 'Por Nivel' },
] as const;

export const TIPOS_SUBVENCION = [
  { value: 'subvencion_regular', label: 'Subvención Regular' },
  { value: 'PIE', label: 'PIE (Programa de Integración Escolar)' },
  { value: 'SEP', label: 'SEP (Subvención Escolar Preferencial)' },
  { value: 'otros', label: 'Otros' },
] as const;

export const MESES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
] as const;

export const NOTA_MINIMA = 1.0;
export const NOTA_MAXIMA = 7.0;
export const NOTA_APROBACION = 4.0;

export const PORCENTAJE_ASISTENCIA_EXCELENTE = 95;
export const PORCENTAJE_ASISTENCIA_BUENA = 90;
export const PORCENTAJE_ASISTENCIA_REGULAR = 85;

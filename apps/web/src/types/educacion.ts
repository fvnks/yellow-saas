// ============================================
// TIPOS DEL MÓDULO EDUCATIVO
// ============================================

// Estudiantes
export interface Estudiante {
  id: string;
  company_id: string;
  rut: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  direccion?: string;
  telefono?: string;
  email?: string;
  curso_id?: string;
  estado: 'activo' | 'retirado' | 'suspendido';
  fecha_ingreso?: string;
  fecha_retiro?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface EstudianteCreate {
  rut: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  direccion?: string;
  telefono?: string;
  email?: string;
  curso_id?: string;
  observaciones?: string;
}

export interface EstudianteUpdate {
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  fecha_nacimiento?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  direccion?: string;
  telefono?: string;
  email?: string;
  curso_id?: string;
  estado?: 'activo' | 'retirado' | 'suspendido';
  observaciones?: string;
}

// Apoderados
export interface Apoderado {
  id: string;
  company_id: string;
  rut: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ocupacion?: string;
  created_at: string;
  updated_at: string;
}

export interface ApoderadoCreate {
  rut: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ocupacion?: string;
}

export interface ApoderadoUpdate {
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ocupacion?: string;
}

// Relación Estudiante-Apoderado
export interface EstudianteApoderado {
  id: string;
  estudiante_id: string;
  apoderado_id: string;
  tipo: 'padre' | 'madre' | 'tutor' | 'apoderado_suplente';
  es_apoderado_principal: boolean;
  autorizado_retiro: boolean;
  created_at: string;
}

// Cursos
export interface Curso {
  id: string;
  company_id: string;
  nombre: string;
  nivel: 'parvularia' | 'basica' | 'media';
  jornada?: 'manana' | 'tarde' | 'completa';
  profesor_jefe_id?: string;
  anio_lectivo: number;
  cupo_maximo?: number;
  sala?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  // Campos enriquecidos desde JOINs
  profesor_jefe_nombres?: string;
  profesor_jefe_apellido?: string;
  total_estudiantes?: number;
}

export interface CursoCreate {
  nombre: string;
  nivel: 'parvularia' | 'basica' | 'media';
  jornada?: 'manana' | 'tarde' | 'completa';
  profesor_jefe_id?: string;
  anio_lectivo: number;
  cupo_maximo?: number;
  sala?: string;
}

export interface CursoUpdate {
  nombre?: string;
  nivel?: 'parvularia' | 'basica' | 'media';
  jornada?: 'manana' | 'tarde' | 'completa';
  profesor_jefe_id?: string;
  cupo_maximo?: number;
  sala?: string;
  activo?: boolean;
}

// Profesores
export interface Profesor {
  id: string;
  company_id: string;
  rut: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  email?: string;
  telefono?: string;
  especialidad?: string;
  titulo?: string;
  fecha_ingreso?: string;
  estado: 'activo' | 'inactivo';
  created_at: string;
  updated_at: string;
  // Campos enriquecidos desde JOINs
  cursos_jefe?: number;
  asignaturas?: number;
}

export interface ProfesorCreate {
  rut: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  email?: string;
  telefono?: string;
  especialidad?: string;
  titulo?: string;
  fecha_ingreso?: string;
}

export interface ProfesorUpdate {
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  email?: string;
  telefono?: string;
  especialidad?: string;
  titulo?: string;
  estado?: 'activo' | 'inactivo';
}

// Asignaturas
export interface Asignatura {
  id: string;
  company_id: string;
  codigo?: string;
  nombre: string;
  nivel?: string;
  horas_semanales?: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface AsignaturaCreate {
  codigo?: string;
  nombre: string;
  nivel?: string;
  horas_semanales?: number;
}

export interface AsignaturaUpdate {
  codigo?: string;
  nombre?: string;
  nivel?: string;
  horas_semanales?: number;
  activo?: boolean;
}

// Asignación de asignaturas a cursos
export interface CursoAsignatura {
  id: string;
  curso_id: string;
  asignatura_id: string;
  profesor_id?: string;
  anio_lectivo: number;
  created_at: string;
}

// Asistencia
export interface Asistencia {
  id: string;
  company_id: string;
  estudiante_id: string;
  curso_id: string;
  fecha: string;
  estado: 'presente' | 'ausente' | 'atrasado' | 'justificado';
  justificacion?: string;
  justificado_por?: string;
  created_at: string;
  updated_at: string;
  // Campos enriquecidos desde JOINs
  estudiante_nombres?: string;
  estudiante_apellido?: string;
  estudiante_rut?: string;
  curso_nombre?: string;
}

export interface AsistenciaCreate {
  estudiante_id: string;
  curso_id: string;
  fecha: string;
  estado: 'presente' | 'ausente' | 'atrasado' | 'justificado';
  justificacion?: string;
}

export interface AsistenciaUpdate {
  estado?: 'presente' | 'ausente' | 'atrasado' | 'justificado';
  justificacion?: string;
}

// Calificaciones
export interface Calificacion {
  id: string;
  company_id: string;
  estudiante_id: string;
  curso_asignatura_id: string;
  periodo: number;
  anio_lectivo: number;
  nota: number;
  tipo_evaluacion: string;
  descripcion?: string;
  fecha_evaluacion?: string;
  created_at: string;
  updated_at: string;
  // Campos enriquecidos desde JOINs
  estudiante_nombres?: string;
  estudiante_apellido?: string;
  asignatura_nombre?: string;
  curso_nombre?: string;
}

export interface CalificacionCreate {
  estudiante_id: string;
  curso_asignatura_id: string;
  periodo: number;
  anio_lectivo: number;
  nota: number;
  tipo_evaluacion: string;
  descripcion?: string;
  fecha_evaluacion?: string;
}

export interface CalificacionUpdate {
  nota?: number;
  tipo_evaluacion?: string;
  descripcion?: string;
  fecha_evaluacion?: string;
}

// Anotaciones (Libro de clases)
export interface Anotacion {
  id: string;
  company_id: string;
  estudiante_id: string;
  curso_id: string;
  fecha: string;
  tipo: 'positiva' | 'negativa';
  descripcion: string;
  registrada_por?: string;
  created_at: string;
}

export interface AnotacionCreate {
  estudiante_id: string;
  curso_id: string;
  fecha: string;
  tipo: 'positiva' | 'negativa';
  descripcion: string;
}

// Comunicados
export interface Comunicado {
  id: string;
  company_id: string;
  titulo: string;
  contenido: string;
  tipo: 'general' | 'por_curso' | 'por_nivel';
  curso_id?: string;
  nivel?: string;
  fecha_publicacion: string;
  publicado_por?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  // Campos enriquecidos desde JOINs
  curso_nombre?: string;
}

export interface ComunicadoCreate {
  titulo: string;
  contenido: string;
  tipo: 'general' | 'por_curso' | 'por_nivel';
  curso_id?: string;
  nivel?: string;
}

export interface ComunicadoUpdate {
  titulo?: string;
  contenido?: string;
  activo?: boolean;
}

// Matrículas
export interface Matricula {
  id: string;
  company_id: string;
  estudiante_id: string;
  curso_id: string;
  anio_lectivo: number;
  fecha_matricula: string;
  estado: 'vigente' | 'cancelada' | 'traspasada';
  observaciones?: string;
  created_at: string;
  updated_at: string;
  // Campos enriquecidos desde JOINs
  estudiante_nombres?: string;
  estudiante_apellido?: string;
  estudiante_rut?: string;
  curso_nombre?: string;
}

export interface MatriculaCreate {
  estudiante_id: string;
  curso_id: string;
  anio_lectivo: number;
  observaciones?: string;
}

// Pensiones
export interface Pension {
  id: string;
  company_id: string;
  estudiante_id: string;
  mes: number;
  anio: number;
  monto: number;
  fecha_vencimiento: string;
  estado: 'pendiente' | 'pagada' | 'vencida' | 'anulada';
  fecha_pago?: string;
  metodo_pago?: string;
  dte_id?: string;
  created_at: string;
  updated_at: string;
  // Campos enriquecidos desde JOINs
  estudiante_nombres?: string;
  estudiante_apellido?: string;
  curso_nombre?: string;
}

export interface PensionCreate {
  estudiante_id: string;
  mes: number;
  anio: number;
  monto: number;
  fecha_vencimiento: string;
}

export interface PensionUpdate {
  estado?: 'pendiente' | 'pagada' | 'vencida' | 'anulada';
  fecha_pago?: string;
  metodo_pago?: string;
}

// Eventos
export interface Evento {
  id: string;
  company_id: string;
  titulo: string;
  descripcion?: string;
  tipo: 'reunion' | 'celebracion' | 'salida_pedagogica' | 'otro';
  fecha_inicio: string;
  fecha_termino?: string;
  curso_id?: string;
  ubicacion?: string;
  requiere_autorizacion: boolean;
  created_at: string;
  updated_at: string;
  // Campos enriquecidos desde JOINs
  curso_nombre?: string;
}

export interface EventoCreate {
  titulo: string;
  descripcion?: string;
  tipo: 'reunion' | 'celebracion' | 'salida_pedagogica' | 'otro';
  fecha_inicio: string;
  fecha_termino?: string;
  curso_id?: string;
  ubicacion?: string;
  requiere_autorizacion?: boolean;
}

// Biblioteca
export interface Libro {
  id: string;
  company_id: string;
  isbn?: string;
  titulo: string;
  autor?: string;
  editorial?: string;
  anio_publicacion?: number;
  cantidad_total: number;
  cantidad_disponible: number;
  ubicacion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface LibroCreate {
  isbn?: string;
  titulo: string;
  autor?: string;
  editorial?: string;
  anio_publicacion?: number;
  cantidad_total?: number;
  ubicacion?: string;
}

export interface Prestamo {
  id: string;
  company_id: string;
  libro_id: string;
  estudiante_id?: string;
  profesor_id?: string;
  fecha_prestamo: string;
  fecha_devolucion_esperada: string;
  fecha_devolucion_real?: string;
  estado: 'prestado' | 'devuelto' | 'atrasado' | 'perdido';
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

// Postulaciones (Admisión)
export interface Postulacion {
  id: string;
  company_id: string;
  estudiante_nombres: string;
  estudiante_apellido_paterno: string;
  estudiante_apellido_materno?: string;
  estudiante_fecha_nacimiento?: string;
  apoderado_nombres?: string;
  apoderado_apellido_paterno?: string;
  apoderado_email?: string;
  apoderado_telefono?: string;
  nivel_postulacion?: string;
  anio_postulacion?: number;
  estado: 'pendiente' | 'aceptada' | 'rechazada' | 'lista_espera';
  fecha_postulacion: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

// Transporte escolar
export interface TransporteRuta {
  id: string;
  company_id: string;
  nombre: string;
  conductor?: string;
  patente?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  // Campos enriquecidos desde JOINs
  total_paraderos?: number;
  total_estudiantes?: number;
}

export interface TransporteParadero {
  id: string;
  ruta_id: string;
  nombre: string;
  direccion?: string;
  hora_recogida?: string;
  orden: number;
  created_at: string;
}

// Subvenciones
export interface Subvencion {
  id: string;
  company_id: string;
  tipo: string;
  anio: number;
  monto?: number;
  estado?: 'solicitada' | 'aprobada' | 'recibida';
  fecha_recepcion?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

// Respuestas de API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filtros
export interface EstudianteFilters {
  curso_id?: string;
  estado?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AsistenciaFilters {
  curso_id?: string;
  fecha?: string;
  estado?: string;
}

export interface CalificacionFilters {
  curso_id?: string;
  asignatura_id?: string;
  periodo?: number;
  anio_lectivo?: number;
}

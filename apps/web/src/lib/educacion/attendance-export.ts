// ============================================
// UTILIDADES DE ASISTENCIA
// ============================================

/**
 * Calcula el porcentaje de asistencia
 */
export function calcularPorcentajeAsistencia(
  presentes: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((presentes / total) * 100);
}

/**
 * Obtiene el estado de asistencia según porcentaje
 */
export function getEstadoAsistencia(porcentaje: number): {
  label: string;
  color: string;
} {
  if (porcentaje >= 95) return { label: 'Excelente', color: 'text-green-600' };
  if (porcentaje >= 90) return { label: 'Bueno', color: 'text-blue-600' };
  if (porcentaje >= 85) return { label: 'Regular', color: 'text-yellow-600' };
  return { label: 'Deficiente', color: 'text-red-600' };
}

/**
 * Genera datos para exportación al formato Mineduc
 */
export function generarFormatoMineduc(
  estudiantes: {
    rut: string;
    nombre: string;
    curso: string;
    presentes: number;
    ausentes: number;
    atrasos: number;
  }[]
): string {
  const header = 'RUT\tNombre\tCurso\tPresentes\tAusentes\tAtrasos\t% Asistencia\n';
  const rows = estudiantes.map((est) => {
    const total = est.presentes + est.ausentes + est.atrasos;
    const porcentaje = calcularPorcentajeAsistencia(est.presentes, total);
    return `${est.rut}\t${est.nombre}\t${est.curso}\t${est.presentes}\t${est.ausentes}\t${est.atrasos}\t${porcentaje}%`;
  });
  
  return header + rows.join('\n');
}

/**
 * Agrupa asistencia por curso
 */
export function agruparAsistenciaPorCurso(
  asistencias: {
    curso_id: string;
    curso_nombre: string;
    estado: string;
  }[]
): Map<string, { curso_nombre: string; presentes: number; ausentes: number; total: number }> {
  const resultado = new Map();
  
  for (const asistencia of asistencias) {
    const existing = resultado.get(asistencia.curso_id) || {
      curso_nombre: asistencia.curso_nombre,
      presentes: 0,
      ausentes: 0,
      total: 0,
    };
    
    existing.total++;
    if (asistencia.estado === 'presente') existing.presentes++;
    if (asistencia.estado === 'ausente') existing.ausentes++;
    
    resultado.set(asistencia.curso_id, existing);
  }
  
  return resultado;
}

// ============================================
// UTILIDADES DE CALIFICACIONES
// ============================================

/**
 * Calcula el promedio de un conjunto de notas
 */
export function calcularPromedio(notas: number[]): number {
  if (notas.length === 0) return 0;
  const suma = notas.reduce((acc, nota) => acc + nota, 0);
  return Math.round((suma / notas.length) * 10) / 10;
}

/**
 * Calcula el promedio ponderado
 */
export function calcularPromedioPonderado(
  notas: { nota: number; ponderacion: number }[]
): number {
  if (notas.length === 0) return 0;
  
  const sumaPonderada = notas.reduce(
    (acc, item) => acc + item.nota * item.ponderacion,
    0
  );
  const sumaPonderaciones = notas.reduce(
    (acc, item) => acc + item.ponderacion,
    0
  );
  
  if (sumaPonderaciones === 0) return 0;
  
  return Math.round((sumaPonderada / sumaPonderaciones) * 10) / 10;
}

/**
 * Obtiene el estado de una nota (aprobado/reprobado)
 */
export function getEstadoNota(nota: number): 'aprobado' | 'reprobado' {
  return nota >= 4.0 ? 'aprobado' : 'reprobado';
}

/**
 * Obtiene el color según la nota
 */
export function getColorNota(nota: number): string {
  if (nota >= 6.0) return 'text-green-600';
  if (nota >= 4.0) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Formatea una nota con un decimal
 */
export function formatearNota(nota: number): string {
  return nota.toFixed(1);
}

/**
 * Calcula el promedio final de un estudiante por asignatura
 */
export function calcularPromedioAsignatura(
  calificaciones: { nota: number; ponderacion?: number }[]
): number {
  if (calificaciones.length === 0) return 0;
  
  const conPonderacion = calificaciones.every(c => c.ponderacion !== undefined);
  
  if (conPonderacion) {
    return calcularPromedioPonderado(
      calificaciones.map(c => ({
        nota: c.nota,
        ponderacion: c.ponderacion!,
      }))
    );
  }
  
  return calcularPromedio(calificaciones.map(c => c.nota));
}

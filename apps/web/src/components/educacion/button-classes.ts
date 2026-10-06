/**
 * Clases de botones compartidas del módulo Educación.
 *
 * Replican el estilo usado por los demás módulos (auto-talleres, condominio,
 * restaurante...): primarios en `sunshine` con `rounded-xl`, secundarios en
 * blanco con borde `slate`, e iconos de fila compactos.
 *
 * Se combinan con el componente `Button` de shadcn vía `className` (twMerge
 * resuelve los conflictos con las variantes por defecto).
 */

/** Acción primaria — "Nuevo X", "Guardar", "Generar", etc. */
export const PRIMARY_ACTION =
  'bg-sunshine hover:bg-sunshine-hover text-ink font-bold rounded-xl shadow-sm active:scale-[0.98] transition-all';

/** Acción secundaria — "Cancelar", "Ver", "Exportar", "Boleta", etc. */
export const SECONDARY_ACTION =
  'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-700 font-bold rounded-xl shadow-xs transition-all';

/** Icono de fila — acciones de tabla (ver, editar, eliminar). */
export const ICON_ACTION =
  'h-8 px-2 text-slate-500 hover:text-ink hover:bg-slate-100 rounded-lg transition-colors';

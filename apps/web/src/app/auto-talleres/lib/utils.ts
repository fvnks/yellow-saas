import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

export function formatCLP(value: number): string {
  return clpFormatter.format(value);
}

export function formatDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
}

export function formatDateTime(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return format(date, "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
}

export function formatRUT(rut: string): string {
  if (!rut) return '';
  const clean = rut.replace(/\./g, '').replace(/-/g, '');
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
}

export function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
    en_proceso: 'bg-blue-100 text-blue-700 border-blue-200',
    en_diagnostico: 'bg-purple-100 text-purple-700 border-purple-200',
    aprobado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    en_revision_calidad: 'bg-orange-100 text-orange-700 border-orange-200',
    listo_para_entrega: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    entregado: 'bg-slate-100 text-slate-700 border-slate-200',
    cancelado: 'bg-rose-100 text-rose-700 border-rose-200',
    disponible: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    ocupado: 'bg-amber-100 text-amber-700 border-amber-200',
    mantenimiento: 'bg-rose-100 text-rose-700 border-rose-200',
  };
  return classes[status] || 'bg-slate-100 text-slate-700 border-slate-200';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    en_proceso: 'En Proceso',
    en_diagnostico: 'En Diagnóstico',
    aprobado: 'Aprobado',
    en_revision_calidad: 'Revisión Calidad',
    listo_para_entrega: 'Listo para Entrega',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
    disponible: 'Disponible',
    ocupado: 'Ocupado',
    mantenimiento: 'En Mantenimiento',
  };
  return labels[status] || status;
}

export function getPriorityClass(priority: string): string {
  const classes: Record<string, string> = {
    urgente: 'bg-rose-100 text-rose-700',
    alta: 'bg-amber-100 text-amber-700',
    normal: 'bg-slate-100 text-slate-600',
    baja: 'bg-slate-50 text-slate-500',
  };
  return classes[priority] || 'bg-slate-100 text-slate-600';
}

export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    urgente: 'Urgente',
    alta: 'Alta',
    normal: 'Normal',
    baja: 'Baja',
  };
  return labels[priority] || priority;
}

export const CRM_STATUSES = [
  { value: 'new', label: 'Nuevo', color: 'bg-blue-100 text-blue-700' },
  { value: 'contacted', label: 'Contactado', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'qualified', label: 'Calificado', color: 'bg-amber-100 text-amber-700' },
  { value: 'proposal', label: 'Propuesta', color: 'bg-purple-100 text-purple-700' },
  { value: 'negotiation', label: 'Negociacion', color: 'bg-orange-100 text-orange-700' },
  { value: 'won', label: 'Ganado', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'lost', label: 'Perdido', color: 'bg-red-100 text-red-700' },
] as const;

export const CRM_SOURCES = [
  { value: 'web', label: 'Sitio Web' },
  { value: 'referral', label: 'Referido' },
  { value: 'phone', label: 'Telefono' },
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Redes Sociales' },
  { value: 'other', label: 'Otro' },
] as const;

export const PROJECT_STATUSES = [
  { value: 'planning', label: 'Planificacion' },
  { value: 'active', label: 'Activo' },
  { value: 'on_hold', label: 'En Pausa' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
] as const;

export const PROJECT_STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  planning: { label: 'Planificacion', variant: 'info' },
  active: { label: 'Activo', variant: 'success' },
  on_hold: { label: 'En Pausa', variant: 'warning' },
  completed: { label: 'Completado', variant: 'neutral' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
};

export const WEBHOOK_EVENTS = [
  'stock.changed', 'stock.low', 'stock.out',
  'batch.expiring', 'batch.expired',
  'return.created', 'return.approved', 'return.rejected', 'return.completed',
  'purchase_order.created', 'purchase_order.received',
  'sales_order.created', 'sales_order.shipped',
  'delivery_guide.created', 'delivery_guide.delivered',
  'invoice.created', 'invoice.paid', 'invoice.overdue',
  'picking.wave.created', 'picking.wave.completed',
  'picking.task.completed',
  'cycle_count.started', 'cycle_count.completed',
  'transfer.created', 'transfer.in_transit', 'transfer.delivered',
  'adjustment.created',
] as const;

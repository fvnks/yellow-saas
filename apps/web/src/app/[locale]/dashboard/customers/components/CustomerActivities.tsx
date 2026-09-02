'use client';

import { useState, useEffect } from 'react';
import { Plus, Phone, Mail, Calendar, CheckSquare, StickyNote, X, Save, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';

interface Activity {
  id: string;
  type: string;
  subject: string;
  description?: string;
  related_type?: string;
  related_id?: string;
  assigned_to?: string;
  assigned_name?: string;
  due_date?: string;
  created_at: string;
  completed_at?: string;
  created_by?: string;
}

interface Props {
  customerId: string;
}

const activityTypeConfig: Record<string, { icon: React.ReactNode; label: string; variant: 'info' | 'warning' | 'success' | 'danger' | 'neutral' }> = {
  call: { icon: <Phone className="w-4 h-4" />, label: 'Llamada', variant: 'info' },
  email: { icon: <Mail className="w-4 h-4" />, label: 'Email', variant: 'warning' },
  meeting: { icon: <Calendar className="w-4 h-4" />, label: 'Reunión', variant: 'success' },
  task: { icon: <CheckSquare className="w-4 h-4" />, label: 'Tarea', variant: 'danger' },
  note: { icon: <StickyNote className="w-4 h-4" />, label: 'Nota', variant: 'neutral' },
};

const defaultForm = {
  type: 'call',
  subject: '',
  description: '',
  due_date: '',
};

export default function CustomerActivities({ customerId }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const loadActivities = async () => {
    try {
      const api = getApiClient();
      const res = await api.getActivities({ related_type: 'customer', related_id: customerId });
      setActivities((res.data || []) as unknown as Activity[]);
    } catch {
      setActivities([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadActivities();
  }, [customerId]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleOpenNew = () => {
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setForm(defaultForm);
  };

  const handleSave = async () => {
    if (!form.subject.trim()) {
      toast.error('El asunto es obligatorio');
      return;
    }
    setSaving(true);
    try {
      const api = getApiClient();
      await api.createActivity({
        type: form.type,
        subject: form.subject,
        description: form.description,
        related_type: 'customer',
        related_id: customerId,
        due_date: form.due_date || undefined,
      });
      toast.success('Actividad creada');
      handleClose();
      loadActivities();
    } catch {
      toast.error('Error al crear actividad');
    }
    setSaving(false);
  };

  const getRelativeDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 30) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-CL');
  };

  const filteredActivities = filterType === 'all'
    ? activities
    : activities.filter(a => a.type === filterType);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
        <div className="px-6 py-4 border-b border-border">
          <div className="h-4 w-36 bg-muted rounded animate-pulse" />
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Actividades</h3>
        <button
          onClick={handleOpenNew}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Actividad
        </button>
      </div>

      <div className="px-6 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-primary text-white'
                : 'bg-muted text-foreground hover:bg-muted'
            }`}
          >
            Todas
          </button>
          {Object.entries(activityTypeConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                filterType === key
                  ? 'bg-primary text-white'
                  : 'bg-muted text-foreground hover:bg-muted'
              }`}
            >
              {config.icon}
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-8 h-8 text-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No hay actividades registradas</p>
        </div>
      ) : (
        <div className="p-6">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
            <div className="space-y-6">
              {filteredActivities.map((activity) => {
                const config = activityTypeConfig[activity.type] || activityTypeConfig.note;
                return (
                  <div key={activity.id} className="relative flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      config.variant === 'info' ? 'bg-blue-100 text-blue-600' :
                      config.variant === 'warning' ? 'bg-amber-100 text-amber-600' :
                      config.variant === 'success' ? 'bg-emerald-100 text-emerald-600' :
                      config.variant === 'danger' ? 'bg-rose-100 text-rose-600' :
                      'bg-muted text-foreground'
                    }`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 bg-muted rounded-lg p-4 border border-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                              config.variant === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              config.variant === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              config.variant === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              config.variant === 'danger' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              'bg-muted text-foreground border border-border'
                            }`}>
                              {config.label}
                            </span>
                            <h4 className="text-sm font-medium text-foreground">{activity.subject}</h4>
                          </div>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{activity.description}</p>
                          )}
                        </div>
                        <span className="text-[9px] text-muted-foreground flex-shrink-0">{getRelativeDate(activity.created_at)}</span>
                      </div>
                      {activity.assigned_to && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-medium text-primary">
                              {activity.assigned_to.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[9px] text-muted-foreground">{activity.assigned_to}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-xl w-full dark:bg-primary max-w- dark:bg-primarylg mx-4">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Nueva Actividad</h2>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Tipo</label>
                <select
                  value={form.type}
                  onChange={e => update('type', e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-colors"
                >
                  {Object.entries(activityTypeConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Asunto *</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => update('subject', e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-colors"
                  placeholder="Asunto de la actividad"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  rows={3}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-colors resize-none"
                  placeholder="Descripción de la actividad"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Fecha de Vencimiento</label>
                <input
                  type="datetime-local"
                  value={form.due_date}
                  onChange={e => update('due_date', e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="bg-card border border-border hover:bg-muted text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
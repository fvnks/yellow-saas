'use client';

import { useState, useEffect } from 'react';
import { Clock, Edit, Trash2, Plus, MessageCircle, Tag, UserPlus, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';

interface AuditEntry {
  id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: any;
  new_values: any;
  description: string;
  created_at: string;
}

interface AuditLogProps {
  projectId: string;
}

const actionConfig: Record<string, { icon: any; color: string; label: string }> = {
  create: { icon: Plus, color: 'text-emerald-500', label: 'Creó' },
  update: { icon: Edit, color: 'text-blue-500', label: 'Actualizó' },
  delete: { icon: Trash2, color: 'text-red-500', label: 'Eliminó' },
  status_change: { icon: ArrowRight, color: 'text-amber-500', label: 'Cambió estado' },
  comment: { icon: MessageCircle, color: 'text-primary', label: 'Comentó' },
  assign: { icon: UserPlus, color: 'text-blue-600', label: 'Asignó' },
  tag_add: { icon: Tag, color: 'text-teal-600', label: 'Agregó tag' },
  tag_remove: { icon: Tag, color: 'text-orange-500', label: 'Quitó tag' },
};

const entityLabels: Record<string, string> = {
  task: 'tarea',
  milestone: 'hito',
  expense: 'gasto',
  cost: 'costo',
  document: 'documento',
  risk: 'riesgo',
  change_order: 'orden de cambio',
  timer: 'timer',
  tag: 'tag',
};

export default function AuditLog({ projectId }: AuditLogProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAudit(); }, [projectId]);

  const loadAudit = async () => {
    try {
      const api = getApiClient();
      const res = await api.getProjectAuditLog(projectId);
      setEntries(Array.isArray(res) ? res : []);
    } catch (err) { toast.error('Error al cargar historial'); }
    finally { setLoading(false); }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'ahora';
    if (diffMin < 60) return `hace ${diffMin}m`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `hace ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `hace ${diffD}d`;
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getDescription = (entry: AuditEntry) => {
    if (entry.description) return entry.description;
    const config = actionConfig[entry.action] || { label: entry.action };
    const entity = entityLabels[entry.entity_type] || entry.entity_type;

    if (entry.action === 'status_change' && entry.old_values && entry.new_values) {
      return `${config.label} ${entity} de "${entry.old_values.status}" a "${entry.new_values.status}"`;
    }

    if (entry.action === 'update' && entry.new_values) {
      const fields = Object.keys(entry.new_values).filter(k => k !== 'updated_at');
      return `${config.label} ${entity}: ${fields.join(', ')}`;
    }

    return `${config.label} ${entity}`;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Historial de Cambios</h3>
        <span className="text-[10px] text-muted-foreground">{entries.length} registros</span>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
          <Clock className="w-10 h-10 text-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Sin actividad registrada</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-muted" />
          <div className="space-y-1">
            {entries.map(entry => {
              const config = actionConfig[entry.action] || { icon: Clock, color: 'text-muted-foreground', label: entry.action };
              const Icon = config.icon;
              return (
                <div key={entry.id} className="relative pl-10 py-2">
                  <div className={`absolute left-2.5 top-2.5 w-3 h-3 rounded-full bg-card border-2 ${config.color.replace('text-', 'border-')} flex items-center justify-center`}>
                    <Icon className={`w-2 h-2 ${config.color}`} />
                  </div>
                  <div className="bg-card border border-border rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{entry.user_name || 'Sistema'}</span>
                        <span className="text-[10px] text-muted-foreground">{getDescription(entry)}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{formatTime(entry.created_at)}</span>
                    </div>
                    {entry.old_values && entry.new_values && entry.action === 'update' && (
                      <div className="mt-1.5 text-[10px] text-muted-foreground">
                        {Object.entries(entry.new_values).filter(([k]) => k !== 'updated_at').map(([key, val]) => (
                          <span key={key} className="mr-2">
                            <span className="text-muted-foreground">{key}:</span>{' '}
                            <span className="line-through text-red-400">{JSON.stringify(entry.old_values[key])}</span>
                            {' → '}
                            <span className="text-emerald-600">{JSON.stringify(val)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

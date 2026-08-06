'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Badge, Input } from '@yellow-erp/ui';
import { Plus, Search, GraduationCap, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Training {
  id: string;
  title: string;
  description: string;
  trainer: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  current_participants: number;
  status: string;
  type: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  scheduled: { label: 'Programado', variant: 'info' },
  in_progress: { label: 'En Curso', variant: 'warning' },
  completed: { label: 'Completado', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
};

const typeLabels: Record<string, string> = {
  technical: 'Técnica',
  soft_skills: 'Habilidades Blandas',
  compliance: 'Cumplimiento',
  safety: 'Seguridad',
  onboarding: 'Inducción',
};

export default function TrainingTab() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', trainer: '', start_date: '', end_date: '',
    max_participants: '', type: 'technical', status: 'scheduled',
  });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/hr/training`).then(r => r.json()).catch(() => ({ data: [] }));
      setTrainings(res.data || []);
    } catch { toast.error('Error al cargar capacitaciones'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!form.title || !form.start_date) { toast.error('Título y fecha son requeridos'); return; }
    setSaving(true);
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/hr/training`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, max_participants: parseInt(form.max_participants) || 20 }),
      });
      setShowForm(false);
      setForm({ title: '', description: '', trainer: '', start_date: '', end_date: '', max_participants: '', type: 'technical', status: 'scheduled' });
      loadData(); toast.success('Capacitación creada');
    } catch { toast.error('Error al guardar'); }
    setSaving(false);
  };

  const filtered = trainings.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.trainer?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar capacitación..." value={search} onChange={e => setSearch(e.target.value)} className="w-64 pl-9" />
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nueva Capacitación
        </Button>
      </div>

      {showForm && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-medium text-foreground">Nueva Capacitación</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input label="Título" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ej: Seguridad Industrial" />
            <Input label="Capacitador" value={form.trainer} onChange={e => setForm({ ...form, trainer: e.target.value })} placeholder="Nombre del capacitador" />
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Tipo</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm">
                {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <Input label="Fecha Inicio" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            <Input label="Fecha Fin" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
            <Input label="Máx. Participantes" type="number" value={form.max_participants} onChange={e => setForm({ ...form, max_participants: e.target.value })} placeholder="20" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">Descripción</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm h-20 resize-none" placeholder="Descripción de la capacitación..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-8 text-sm text-muted-foreground">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-8 text-sm text-muted-foreground">Sin capacitaciones registradas</div>
        ) : filtered.map(t => (
          <div key={t.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
              </div>
              <Badge variant={statusConfig[t.status]?.variant || 'neutral'}>
                {statusConfig[t.status]?.label || t.status}
              </Badge>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{t.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{typeLabels[t.type] || t.type}</p>
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" /> {t.start_date} {t.end_date ? `- ${t.end_date}` : ''}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3 h-3" /> {t.current_participants || 0}/{t.max_participants || '∞'} participantes
              </div>
              {t.trainer && <p className="text-xs text-muted-foreground">Capacitador: {t.trainer}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

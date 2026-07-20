'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Search, Eye, Edit, Trash2, Phone, Mail, Calendar, Star, Filter, X, Save } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: 'Nuevo', color: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'Contactado', color: 'bg-indigo-100 text-indigo-700' },
  qualified: { label: 'Calificado', color: 'bg-amber-100 text-amber-700' },
  proposal: { label: 'Propuesta', color: 'bg-purple-100 text-purple-700' },
  negotiation: { label: 'Negociacion', color: 'bg-orange-100 text-orange-700' },
  won: { label: 'Ganado', color: 'bg-emerald-100 text-emerald-700' },
  lost: { label: 'Perdido', color: 'bg-red-100 text-red-700' },
};

const sourceOptions = [
  { value: 'web', label: 'Sitio Web' },
  { value: 'referral', label: 'Referido' },
  { value: 'phone', label: 'Telefono' },
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Redes Sociales' },
  { value: 'other', label: 'Otro' },
];

export default function CRMPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: 'web', status: 'new', estimated_value: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadLeads(); }, [statusFilter]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '200' };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.getLeads(params);
      setLeads(res.data || []);
    } catch (err) { console.error(err); setError('No se pudieron cargar los leads'); }
    setLoading(false);
  };

  const handleSearch = () => { loadLeads(); };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const api = getApiClient();
      const data = { ...form, estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : undefined };
      if (editingLead) {
        await api.updateLead(editingLead.id, data);
      } else {
        await api.createLead(data);
      }
      setShowForm(false);
      setEditingLead(null);
      setForm({ name: '', email: '', phone: '', source: 'web', status: 'new', estimated_value: '', notes: '' });
      loadLeads();
    } catch (err) { console.error(err); setError('No se pudo guardar el lead'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este lead?')) return;
    try {
      const api = getApiClient();
      await api.deleteLead(id);
      loadLeads();
    } catch (err) { console.error(err); setError('No se pudo eliminar el lead'); }
  };

  const handleEdit = (lead: any) => {
    setForm({
      name: lead.name || '', email: lead.email || '', phone: lead.phone || '',
      source: lead.source || 'web', status: lead.status || 'new',
      estimated_value: lead.estimated_value || '', notes: lead.notes || '',
    });
    setEditingLead(lead);
    setShowForm(true);
  };

  const totalValue = leads.reduce((sum, l) => sum + (parseFloat(l.estimated_value) || 0), 0);
  const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.status));
  const wonLeads = leads.filter(l => l.status === 'won');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">CRM</h1>
          <p className="text-sm text-slate-500 mt-1">Gestion de contactos y oportunidades</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingLead(null); setForm({ name: '', email: '', phone: '', source: 'web', status: 'new', estimated_value: '', notes: '' }); }}
          className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Contacto
        </button>
      </div>

      {error && <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Leads</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{leads.length}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Activos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{activeLeads.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Ganados</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{wonLeads.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Valor Pipeline</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">${(totalValue / 1000000).toFixed(1)}M</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar por nombre, email o telefono..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="all">Todos los estados</option>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Contacto</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fuente</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">Cargando...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No hay leads registrados</p>
                </td></tr>
              ) : leads.map(lead => {
                const st = statusConfig[lead.status] || statusConfig.new;
                return (
                  <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">{lead.name}</p>
                      {lead.notes && <p className="text-[10px] text-slate-400 truncate max-w-xs">{lead.notes}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {lead.email && <p className="text-xs text-slate-700 flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</p>}
                      {lead.phone && <p className="text-xs text-slate-700 flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{sourceOptions.find(s => s.value === lead.source)?.label || lead.source || '—'}</td>
                    <td className="px-4 py-3 text-xs text-right font-medium text-slate-900">
                      {lead.estimated_value ? `$${Number(lead.estimated_value).toLocaleString('es-CL')}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(lead)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                          <Edit className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                        <button onClick={() => handleDelete(lead.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{editingLead ? 'Editar Lead' : 'Nuevo Lead'}</h2>
              <button onClick={() => { setShowForm(false); setEditingLead(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Nombre *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Telefono</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Fuente</label>
                  <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    {sourceOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Estado</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    {Object.entries(statusConfig).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Valor Estimado (CLP)</label>
                <input type="number" value={form.estimated_value} onChange={e => setForm({ ...form, estimated_value: e.target.value })}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Notas</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => { setShowForm(false); setEditingLead(null); }}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name}
                className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? 'Guardando...' : editingLead ? 'Actualizar' : 'Crear Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

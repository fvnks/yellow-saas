'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Trash2, Edit } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface UOM { id: string; code: string; name: string; type: string; base_unit: string | null; conversion_factor: number; is_active: boolean; }

const typeLabels: Record<string, string> = { weight: 'Peso', volume: 'Volumen', length: 'Longitud', area: 'Area', piece: 'Pieza', time: 'Tiempo' };
const typeColors: Record<string, string> = { weight: 'bg-blue-50 text-blue-700 border-blue-200', volume: 'bg-cyan-50 text-cyan-700 border-cyan-200', length: 'bg-amber-50 text-amber-700 border-amber-200', area: 'bg-purple-50 text-purple-700 border-purple-200', piece: 'bg-emerald-50 text-emerald-700 border-emerald-200', time: 'bg-rose-50 text-rose-700 border-rose-200' };

export default function UOMPage() {
  const router = useRouter();
  const [uoms, setUoms] = useState<UOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [editItem, setEditItem] = useState<UOM | null>(null);
  const [form, setForm] = useState({ code: '', name: '', type: 'piece', base_unit: '', conversion_factor: '1' });

  useEffect(() => { loadUOMs(); }, [search]);

  const loadUOMs = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '200' };
      if (search) params.search = search;
      const res = await api.getUnitsOfMeasure(params);
      setUoms(res.data || []);
    } catch (e) { toast.error('Error al cargar unidades de medida'); }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.code || !form.name) return;
    try {
      const api = getApiClient();
      const data = { ...form, conversion_factor: Number(form.conversion_factor) };
      if (editItem) { await api.updateUnitOfMeasure(editItem.id, data); }
      else { await api.createUnitOfMeasure(data as any); }
      setShowNew(false); setEditItem(null);
      setForm({ code: '', name: '', type: 'piece', base_unit: '', conversion_factor: '1' });
      loadUOMs();
    } catch (e) { toast.error('Error al guardar unidad de medida'); }
  };

  const handleEdit = (u: UOM) => {
    setEditItem(u);
    setForm({ code: u.code, name: u.name, type: u.type, base_unit: u.base_unit || '', conversion_factor: String(u.conversion_factor) });
    setShowNew(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta unidad?')) return;
    try { await getApiClient().deleteUnitOfMeasure(id); loadUOMs(); } catch (e) { toast.error('Error al eliminar unidad de medida'); }
  };

  const filtered = uoms.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-lg transition-colors"><ArrowLeft className="w-5 h-5 text-slate-600" /></button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Unidades de Medida</h1>
            <p className="text-sm text-muted-foreground mt-1">Tabla de referencia para productos</p>
          </div>
        </div>
        <button onClick={() => { setShowNew(true); setEditItem(null); setForm({ code: '', name: '', type: 'piece', base_unit: '', conversion_factor: '1' }); }}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nueva Unidad
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-4 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar unidad..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
        </div>
      </div>

      {showNew && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
          <h3 className="text-sm font-semibold text-foreground mb-4">{editItem ? 'Editar Unidad' : 'Nueva Unidad'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Codigo *</label>
              <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="kg, lt, m..." />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Nombre *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Kilogramo..." />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Tipo *</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Factor Conversion</label>
              <input type="number" step="0.000001" value={form.conversion_factor} onChange={e => setForm({...form, conversion_factor: e.target.value})}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => { setShowNew(false); setEditItem(null); }} className="bg-card border border-border hover:bg-muted text-foreground dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
            <button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">{editItem ? 'Guardar' : 'Crear'}</button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Codigo</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Factor</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-10 bg-muted rounded-lg animate-pulse" /></td></tr>)
              ) : filtered.map(u => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-muted transition-colors">
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-foreground">{u.code}</td>
                  <td className="px-4 py-3 text-xs font-medium text-foreground">{u.name}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${typeColors[u.type] || 'bg-muted text-slate-600 border-border'}`}>{typeLabels[u.type] || u.type}</span></td>
                  <td className="px-4 py-3 text-center text-xs text-foreground">{u.conversion_factor}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${u.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-muted text-slate-600 border border-border'}`}>{u.is_active ? 'Activa' : 'Inactiva'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleEdit(u)} className="p-1.5 text-muted-foreground hover:text-slate-600 hover:bg-muted rounded transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No hay unidades de medida</div>}
        </div>
      </div>
    </div>
  );
}

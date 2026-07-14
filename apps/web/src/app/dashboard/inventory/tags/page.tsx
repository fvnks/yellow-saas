'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Edit, Tag } from 'lucide-react';
import { getApiClient } from '../../../../lib/api-client';

interface ProductTag { id: string; name: string; color: string; is_active: boolean; product_count?: number; }

const COLORS = [
  { name: 'indigo', value: '#6366f1', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  { name: 'emerald', value: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { name: 'amber', value: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { name: 'rose', value: '#f43f5e', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  { name: 'blue', value: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { name: 'slate', value: '#64748b', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
];

export default function TagsPage() {
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<ProductTag | null>(null);
  const [form, setForm] = useState({ name: '', color: COLORS[0].value });
  const [search, setSearch] = useState('');

  useEffect(() => { loadTags(); }, [search]);

  const loadTags = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '200' };
      if (search) params.search = search;
      const res = await api.getProductTags(params);
      setTags(res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const saveTag = async () => {
    if (!form.name) return;
    const api = getApiClient();
    if (editingTag) {
      await api.updateProductTag(editingTag.id, form);
    } else {
      await api.createProductTag(form);
    }
    setShowForm(false); setEditingTag(null); setForm({ name: '', color: COLORS[0].value }); loadTags();
  };

  const editTag = (tag: ProductTag) => {
    setEditingTag(tag); setForm({ name: tag.name, color: tag.color }); setShowForm(true);
  };

  const deleteTag = async (id: string) => {
    if (!confirm('Eliminar este tag?')) return;
    await getApiClient().deleteProductTag(id); loadTags();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <a href="/dashboard/inventory" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </a>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Tags de Productos</h1>
            <p className="text-sm text-slate-500 mt-1">Organiza tus productos con etiquetas de color</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setEditingTag(null); setForm({ name: '', color: COLORS[0].value }); }}
          className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Tag
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">{editingTag ? 'Editar Tag' : 'Nuevo Tag'}</h3>
            <button onClick={() => { setShowForm(false); setEditingTag(null); }} className="text-slate-400 hover:text-slate-600 text-sm">Cancelar</button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre del tag" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            <div className="flex gap-2 items-center">
              {COLORS.map(c => (
                <button key={c.name} onClick={() => setForm({ ...form, color: c.value })}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${form.color === c.value ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c.value }} title={c.name} />
              ))}
            </div>
            <button onClick={saveTag} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {editingTag ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="relative max-w-md">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar tags..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        {loading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Color</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Productos</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tags.map(tag => (
                  <tr key={tag.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: tag.color }} />
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-900">{tag.name}</td>
                    <td className="px-4 py-3 text-center text-xs text-slate-500">{tag.product_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => editTag(tag)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteTag(tag.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tags.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No hay tags registrados</div>}
          </div>
        )}
      </div>
    </div>
  );
}

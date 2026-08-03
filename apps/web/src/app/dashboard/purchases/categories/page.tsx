'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit, X, Tag, FolderOpen } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import Link from 'next/link';

interface PurchaseCategory {
  id: string;
  name: string;
  description: string | null;
  cost_center_id: string | null;
  cost_center_name: string | null;
  cost_center_code: string | null;
  is_default: boolean;
  created_at: string;
}

export default function PurchaseCategoriesPage() {
  const [categories, setCategories] = useState<PurchaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PurchaseCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', cost_center_id: '' });

  const loadData = async () => {
    try {
      const api = getApiClient();
      const data = await api.getPurchaseCategories();
      setCategories(data || []);
    } catch (err) {
      toast.error('Error al cargar categorías');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', cost_center_id: '' });
    setShowModal(true);
  };

  const openEdit = (cat: PurchaseCategory) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      cost_center_id: cat.cost_center_id || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nombre requerido'); return; }

    setSaving(true);
    try {
      const api = getApiClient();
      if (editing) {
        await api.updatePurchaseCategory(editing.id, {
          name: form.name,
          description: form.description || undefined,
          cost_center_id: form.cost_center_id || undefined,
        });
        toast.success('Categoría actualizada');
      } else {
        await api.createPurchaseCategory({
          name: form.name,
          description: form.description || undefined,
          cost_center_id: form.cost_center_id || undefined,
        });
        toast.success('Categoría creada');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      const api = getApiClient();
      await api.deletePurchaseCategory(id);
      toast.success('Categoría eliminada');
      loadData();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Categorías de Compra</h1>
          <p className="text-sm text-slate-500 mt-1">Clasificar productos de facturas de compra</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/purchases"
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Volver
          </Link>
          <button onClick={openCreate}
            className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Nueva Categoría
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar categoría..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Descripción</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Centro de Costo</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td colSpan={5} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <FolderOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No hay categorías</p>
                    <p className="text-xs text-slate-400 mt-1">Crea tu primera categoría para clasificar compras</p>
                  </td>
                </tr>
              ) : (
                filtered.map(cat => (
                  <tr key={cat.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                          <Tag className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{cat.description || '—'}</td>
                    <td className="px-4 py-3">
                      {cat.cost_center_name ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {cat.cost_center_code && `${cat.cost_center_code} — `}{cat.cost_center_name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {cat.is_default ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Predeterminada
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(cat)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{editing ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Nombre *</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ej: Materias Primas" autoFocus />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Descripción</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Descripción de la categoría..." />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear Categoría'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

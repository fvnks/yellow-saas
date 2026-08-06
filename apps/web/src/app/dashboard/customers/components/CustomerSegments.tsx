'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, Layers, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  min_orders: number;
  min_revenue: number;
}

const defaultForm = {
  name: '',
  description: '',
  min_orders: 0,
  min_revenue: 0,
};

export default function CustomerSegments() {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const loadSegments = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/customer-segments`);
      if (res.ok) {
        const json = await res.json();
        setSegments(Array.isArray(json.data) ? json.data : []);
      }
    } catch {
      setSegments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSegments();
  }, []);

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleOpenNew = () => {
    setEditingId(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleOpenEdit = (seg: CustomerSegment) => {
    setEditingId(seg.id);
    setForm({
      name: seg.name,
      description: seg.description,
      min_orders: seg.min_orders,
      min_revenue: seg.min_revenue,
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    setSaving(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const url = editingId
        ? `/api/companies/${companyId}/customer-segments/${editingId}`
        : `/api/companies/${companyId}/customer-segments`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(editingId ? 'Segmento actualizado' : 'Segmento creado');
        handleClose();
        loadSegments();
      } else {
        toast.error('Error al guardar segmento');
      }
    } catch {
      toast.error('Error al guardar segmento');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar segmento "${name}"?`)) return;
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/customer-segments/${id}`, { method: 'DELETE' });
      toast.success('Segmento eliminado');
      loadSegments();
    } catch {
      toast.error('Error al eliminar segmento');
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Segmentos de Clientes</h3>
        <button
          onClick={handleOpenNew}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Segmento
        </button>
      </div>

      {segments.length === 0 ? (
        <div className="text-center py-12">
          <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No hay segmentos</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Descripción</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Mín. Pedidos</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Mín. Ingresos</th>
                <th className="text-center w-24 px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {segments.map(seg => (
                <tr key={seg.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="text-xs font-medium text-slate-900">{seg.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700">{seg.description || '—'}</td>
                  <td className="px-4 py-3 text-center text-xs font-medium text-slate-900">{seg.min_orders}</td>
                  <td className="px-4 py-3 text-right text-xs font-medium text-slate-900">${(seg.min_revenue || 0).toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(seg)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        aria-label="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(seg.id, seg.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full dark:bg-slate-900 max-w- dark:bg-slate-900md mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? 'Editar Segmento' : 'Nuevo Segmento'}
              </h2>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Nombre *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="Nombre del segmento"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="Descripción del segmento..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Mín. Pedidos</label>
                  <input
                    type="number"
                    value={form.min_orders}
                    onChange={e => update('min_orders', parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Mín. Ingresos (CLP)</label>
                  <input
                    type="number"
                    value={form.min_revenue}
                    onChange={e => update('min_revenue', parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
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

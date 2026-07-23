'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

const defaultForm = {
  name: '',
  description: '',
  color: '#6366f1',
};

const colorOptions = [
  { value: '#6366f1', label: 'Índigo' },
  { value: '#10b981', label: 'Esmeralda' },
  { value: '#f59e0b', label: 'Ámbar' },
  { value: '#ef4444', label: 'Rojo' },
  { value: '#3b82f6', label: 'Azul' },
  { value: '#8b5cf6', label: 'Violeta' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#64748b', label: 'Gris' },
];

export default function CustomerCategories() {
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/customer-categories`);
      if (res.ok) {
        const json = await res.json();
        setCategories(Array.isArray(json.data) ? json.data : []);
      }
    } catch {
      setCategories([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleOpenNew = () => {
    setEditingId(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleOpenEdit = (cat: CustomerCategory) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description,
      color: cat.color,
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
        ? `/api/companies/${companyId}/customer-categories/${editingId}`
        : `/api/companies/${companyId}/customer-categories`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(editingId ? 'Categoría actualizada' : 'Categoría creada');
        handleClose();
        loadCategories();
      } else {
        toast.error('Error al guardar categoría');
      }
    } catch {
      toast.error('Error al guardar categoría');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar categoría "${name}"?`)) return;
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/customer-categories/${id}`, { method: 'DELETE' });
      toast.success('Categoría eliminada');
      loadCategories();
    } catch {
      toast.error('Error al eliminar categoría');
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
        <h3 className="text-sm font-semibold text-slate-900">Categorías de Clientes</h3>
        <button
          onClick={handleOpenNew}
          className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No hay categorías</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Descripción</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Color</th>
                <th className="text-center w-24 px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-slate-900">{cat.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-700">{cat.description || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-slate-200"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-[9px] text-slate-500">{cat.color}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        aria-label="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
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
                {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
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
                  placeholder="Nombre de la categoría"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="Descripción de la categoría..."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {colorOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => update('color', opt.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-colors flex-shrink-0 ${
                        form.color === opt.value ? 'border-slate-900 scale-110' : 'border-slate-200 hover:border-slate-400'
                      }`}
                      style={{ backgroundColor: opt.value }}
                      title={opt.label}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={form.color}
                  onChange={e => update('color', e.target.value)}
                  className="mt-2 w-10 h-8 rounded border border-slate-200 cursor-pointer"
                />
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
                className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
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

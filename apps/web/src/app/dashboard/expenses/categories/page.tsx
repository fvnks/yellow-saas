'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, X, Palette } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#6B7280', '#F97316', '#14B8A6',
];

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [form, setForm] = useState({ name: '', color: '#6B7280', tax_deductible: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const cats = await api.getExpenseCategories();
      setCategories(cats || []);
    } catch (err) { console.error(err); setError('No se pudieron cargar las categorías'); }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const api = getApiClient();
      if (editingCategory) {
        await api.updateExpenseCategory(editingCategory.id, form);
      } else {
        await api.createExpenseCategory(form);
      }
      setShowForm(false);
      setEditingCategory(null);
      setForm({ name: '', color: '#6B7280', tax_deductible: false });
      loadCategories();
      setSuccess('Categoría guardada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { console.error(err); setError(err.message || 'No se pudo guardar'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      const api = getApiClient();
      await api.deleteExpenseCategory(id);
      loadCategories();
    } catch (err) { console.error(err); setError('No se pudo eliminar'); }
  };

  const handleEdit = (cat: any) => {
    setForm({ name: cat.name, color: cat.color || '#6B7280', tax_deductible: cat.tax_deductible || false });
    setEditingCategory(cat);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Categorías de Gastos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Organiza tus gastos por categoría</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingCategory(null); setForm({ name: '', color: '#6B7280', tax_deductible: false }); }}
          className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nueva Categoría
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">{success}</div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">Cargando...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No hay categorías registradas</p>
            <p className="text-xs text-slate-400 mt-1">Crea tu primera categoría para organizar tus gastos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200/80">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Color</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Deducible</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg border-2 border-slate-200" style={{ backgroundColor: cat.color }} />
                        <span className="text-xs text-slate-400 font-mono">{cat.color}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">{cat.name}</p>
                      <p className="text-[10px] text-slate-400">{cat.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      {cat.tax_deductible ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">Sí</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(cat)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                          <Edit className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button onClick={() => { setShowForm(false); setEditingCategory(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Nombre *</label>
                <input
                  type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Transporte, Alimentación..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${form.color === c ? 'border-slate-900 scale-110' : 'border-slate-200'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="tax_deductible" checked={form.tax_deductible}
                  onChange={e => setForm({ ...form, tax_deductible: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500/20" />
                <label htmlFor="tax_deductible" className="text-sm text-slate-700">Deducible tributariamente</label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200/80 flex justify-end gap-3">
              <button onClick={() => { setShowForm(false); setEditingCategory(null); }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving || !form.name}
                className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50">
                {saving ? 'Guardando...' : editingCategory ? 'Actualizar' : 'Crear Categoría'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

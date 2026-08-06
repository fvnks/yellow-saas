'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit, X, Zap, Droplets, Flame, Home, Shirt, Wrench, Receipt, RefreshCw } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useRecetasRefresh } from '@/components/recetas/RefreshContext';

const EXPENSE_CATEGORIES = [
  { value: 'luz', label: 'Luz', icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'agua', label: 'Agua', icon: Droplets, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'gas', label: 'Gas', icon: Flame, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { value: 'arriendo', label: 'Arriendo', icon: Home, color: 'text-violet-600 bg-violet-50 border-violet-200' },
  { value: 'ropa', label: 'Ropa/Mantención', icon: Shirt, color: 'text-pink-600 bg-pink-50 border-pink-200' },
  { value: 'herramientas', label: 'Herramientas', icon: Wrench, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { value: 'servicios', label: 'Servicios', icon: Receipt, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { value: 'otro', label: 'Otro', icon: Receipt, color: 'text-slate-600 bg-slate-50 border-slate-200' },
];

const getCategoryInfo = (cat: string) => EXPENSE_CATEGORIES.find(c => c.value === cat) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];

const RECURRING_OPTIONS = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'yearly', label: 'Anual' },
  { value: 'weekly', label: 'Semanal' },
];

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  is_recurring: boolean;
  recurring_period: string | null;
  notes: string | null;
  formula: { id: string; name: string } | null;
  created_at: string;
}

interface Formula {
  id: string;
  name: string;
}

export default function RecipeExpensesPage() {
  const { refreshKey } = useRecetasRefresh();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    category: 'luz',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    formula_id: '',
    is_recurring: false,
    recurring_period: '',
    notes: '',
  });

  const loadData = async () => {
    try {
      const api = getApiClient();
      const [expensesRes, formulasRes] = await Promise.all([
        api.getRecipeExpenses({ search: search || undefined, category: categoryFilter || undefined, page, limit: 20 }),
        api.getFormulas({ limit: 500 }),
      ]);
      setExpenses(expensesRes.data || []);
      setTotal(expensesRes.pagination?.total || 0);
      setFormulas(formulasRes.data || []);
    } catch (err) {
      toast.error('Error al cargar datos');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [search, categoryFilter, page, refreshKey]);

  const openCreate = () => {
    setEditingExpense(null);
    setForm({
      category: 'luz',
      description: '',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      formula_id: '',
      is_recurring: false,
      recurring_period: '',
      notes: '',
    });
    setShowModal(true);
  };

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setForm({
      category: expense.category,
      description: expense.description,
      amount: String(expense.amount),
      expense_date: expense.expense_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      formula_id: expense.formula?.id || '',
      is_recurring: expense.is_recurring,
      recurring_period: expense.recurring_period || '',
      notes: expense.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.description) { toast.error('Descripción requerida'); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Monto requerido'); return; }

    setSaving(true);
    try {
      const api = getApiClient();
      const data = {
        category: form.category,
        description: form.description,
        amount: parseFloat(form.amount),
        expense_date: form.expense_date,
        formula_id: form.formula_id || undefined,
        is_recurring: form.is_recurring,
        recurring_period: form.is_recurring ? form.recurring_period : undefined,
        notes: form.notes || undefined,
      };

      if (editingExpense) {
        await api.updateRecipeExpense(editingExpense.id, data);
        toast.success('Gasto actualizado');
      } else {
        await api.createRecipeExpense(data);
        toast.success('Gasto creado');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error('Error al guardar');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este gasto?')) return;
    try {
      const api = getApiClient();
      await api.deleteRecipeExpense(id);
      toast.success('Gasto eliminado');
      loadData();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gastos Operacionales</h1>
          <p className="text-sm text-slate-500 mt-1">Gastos generales de la receta (luz, agua, gas, etc.)</p>
        </div>
        <button onClick={openCreate}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Gasto
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {EXPENSE_CATEGORIES.slice(0, 4).map(cat => {
          const Icon = cat.icon;
          const catTotal = expenses.filter(e => e.category === cat.value).reduce((sum, e) => sum + Number(e.amount), 0);
          return (
            <div key={cat.value} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">{cat.label}</p>
              </div>
              <p className="text-lg font-bold text-slate-900">${catTotal.toLocaleString('es-CL')}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar gasto..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <option value="">Todas las categorías</option>
          {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Categoría</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Descripción</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Receta</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Frecuencia</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td colSpan={7} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : expenses.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No hay gastos registrados</td></tr>
              ) : (
                expenses.map(expense => {
                  const catInfo = getCategoryInfo(expense.category);
                  const CatIcon = catInfo.icon;
                  return (
                    <tr key={expense.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {new Date(expense.expense_date).toLocaleDateString('es-CL')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border ${catInfo.color}`}>
                          <CatIcon className="w-2.5 h-2.5" /> {catInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-900">{expense.description}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{expense.formula?.name || '—'}</td>
                      <td className="px-4 py-3">
                        {expense.is_recurring ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <RefreshCw className="w-2.5 h-2.5" /> {RECURRING_OPTIONS.find(r => r.value === expense.recurring_period)?.label || expense.recurring_period}
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400">Único</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-slate-900">
                        ${Number(expense.amount).toLocaleString('es-CL')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(expense)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(expense.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {expenses.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
            <p className="text-xs text-slate-500">{total} gasto{total !== 1 ? 's' : ''}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">
                Anterior
              </button>
              <span className="text-xs text-slate-500">Página {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={expenses.length < 20}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Categoría *</label>
                <div className="grid grid-cols-4 gap-2">
                  {EXPENSE_CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const active = form.category === cat.value;
                    return (
                      <button key={cat.value} type="button" onClick={() => setForm(p => ({ ...p, category: cat.value }))}
                        className={`p-2 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                          active ? `${cat.color} border-current` : 'border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}>
                        <Icon className="w-4 h-4" />
                        <span className="text-[9px] font-medium">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Descripción *</label>
                <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ej: Factura luz julio" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Monto (CLP) *</label>
                  <input type="number" min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Fecha</label>
                  <input type="date" value={form.expense_date} onChange={e => setForm(p => ({ ...p, expense_date: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Receta asociada (opcional)</label>
                <select value={form.formula_id} onChange={e => setForm(p => ({ ...p, formula_id: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">Sin receta específica</option>
                  {formulas.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_recurring} onChange={e => setForm(p => ({ ...p, is_recurring: e.target.checked, recurring_period: e.target.checked ? 'monthly' : '' }))}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="text-xs font-medium text-slate-700">Gasto recurrente</span>
                </label>
                {form.is_recurring && (
                  <select value={form.recurring_period} onChange={e => setForm(p => ({ ...p, recurring_period: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    {RECURRING_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                )}
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Notas</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Notas adicionales..." />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : editingExpense ? 'Guardar Cambios' : 'Crear Gasto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

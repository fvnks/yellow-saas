'use client';

import { useState, useEffect } from 'react';
import { Wallet, Plus, Search, Edit, Trash2, X, Filter, TrendingUp, Calendar, Tag } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Borrador', color: 'text-slate-600', bg: 'bg-slate-100' },
  approved: { label: 'Aprobado', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  rejected: { label: 'Rechazado', color: 'text-rose-700', bg: 'bg-rose-100' },
};

const DOCUMENT_TYPE_CONFIG: Record<string, { label: string }> = {
  ticket: { label: 'Ticket' },
  boleta: { label: 'Boleta' },
  factura: { label: 'Factura' },
  other: { label: 'Otro' },
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [form, setForm] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    amount: '',
    tax_amount: '',
    category_id: '',
    supplier_name: '',
    supplier_rut: '',
    document_type: 'ticket',
    document_number: '',
    description: '',
    notes: '',
    status: 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const [expensesRes, summaryRes, categoriesRes] = await Promise.all([
        api.getExpenses({ limit: '200' }),
        api.getExpenseSummary(),
        api.getExpenseCategories(),
      ]);
      setExpenses(expensesRes.data || []);
      setSummary(summaryRes);
      setCategories(categoriesRes || []);
    } catch (err) { console.error(err); setError('No se pudieron cargar los gastos'); }
    setLoading(false);
  };

  const loadFiltered = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '200' };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category_id = categoryFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (search) params.search = search;
      const res = await api.getExpenses(params);
      setExpenses(res.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSearch = () => { loadFiltered(); };

  const handleSave = async () => {
    if (!form.amount) return;
    setSaving(true);
    try {
      const api = getApiClient();
      const data = {
        ...form,
        amount: parseFloat(form.amount),
        tax_amount: form.tax_amount ? parseFloat(form.tax_amount) : 0,
      };
      if (editingExpense) {
        await api.updateExpense(editingExpense.id, data);
      } else {
        await api.createExpense(data);
      }
      setShowForm(false);
      setEditingExpense(null);
      resetForm();
      loadData();
      setSuccess('Gasto guardado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { console.error(err); setError(err.message || 'No se pudo guardar'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este gasto?')) return;
    try {
      const api = getApiClient();
      await api.deleteExpense(id);
      loadData();
    } catch (err) { console.error(err); setError('No se pudo eliminar'); }
  };

  const handleEdit = (expense: any) => {
    setForm({
      expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
      amount: String(expense.amount || ''),
      tax_amount: String(expense.tax_amount || ''),
      category_id: expense.category_id || '',
      supplier_name: expense.supplier_name || '',
      supplier_rut: expense.supplier_rut || '',
      document_type: expense.document_type || 'ticket',
      document_number: expense.document_number || '',
      description: expense.description || '',
      notes: expense.notes || '',
      status: expense.status || 'draft',
    });
    setEditingExpense(expense);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({
      expense_date: new Date().toISOString().split('T')[0],
      amount: '',
      tax_amount: '',
      category_id: '',
      supplier_name: '',
      supplier_rut: '',
      document_type: 'ticket',
      document_number: '',
      description: '',
      notes: '',
      status: 'draft',
    });
  };

  const handleFilterReset = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setDateFrom('');
    setDateTo('');
    loadData();
  };

  const topCategory = summary?.by_category?.[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Gestión de Gastos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Control operativo y tributario de gastos</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingExpense(null); resetForm(); }}
          className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo Gasto
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">{success}</div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Gastos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {summary ? CLP.format(summary.total_with_tax) : '—'}
              </p>
            </div>
            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-rose-500" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cantidad</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{summary?.count || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">IVA (ISC)</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {summary ? CLP.format(summary.total_tax) : '—'}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Top Categoría</p>
              <p className="text-lg font-bold text-slate-900 mt-1 truncate">
                {topCategory?.name || '—'}
              </p>
              {topCategory && (
                <p className="text-xs text-slate-500 mt-0.5">{CLP.format(Number(topCategory.total))}</p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Tag className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar proveedor, descripción, documento..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400">
            <option value="all">Todos los estados</option>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400">
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400" />
          <button onClick={handleSearch}
            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
            <Filter className="w-4 h-4" /> Filtrar
          </button>
          <button onClick={handleFilterReset}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            Limpiar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">Cargando...</div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No hay gastos registrados</p>
            <p className="text-xs text-slate-400 mt-1">Registra tu primer gasto para comenzar el control operativo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200/80">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">N° Gasto</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Categoría</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Doc.</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">IVA</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => {
                  const cat = categories.find(c => c.id === expense.category_id);
                  const st = STATUS_CONFIG[expense.status] || STATUS_CONFIG.draft;
                  const docType = DOCUMENT_TYPE_CONFIG[expense.document_type] || { label: expense.document_type || '—' };
                  return (
                    <tr key={expense.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {expense.expense_date ? new Date(expense.expense_date).toLocaleDateString('es-CL') : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">{expense.expense_number}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900">{expense.supplier_name || '—'}</p>
                        {expense.supplier_rut && <p className="text-[10px] text-slate-400">{expense.supplier_rut}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {cat ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                            <span className="text-xs text-slate-700">{cat.name}</span>
                          </div>
                        ) : <span className="text-xs text-slate-400">Sin categoría</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{docType.label}</span>
                        {expense.document_number && <p className="text-[10px] text-slate-400 mt-0.5">{expense.document_number}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-right font-medium text-slate-700">
                        {CLP.format(Number(expense.amount) || 0)}
                      </td>
                      <td className="px-4 py-3 text-xs text-right text-slate-500">
                        {CLP.format(Number(expense.tax_amount) || 0)}
                      </td>
                      <td className="px-4 py-3 text-xs text-right font-semibold text-slate-900">
                        {CLP.format(Number(expense.total_amount) || 0)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.bg} ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(expense)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                            <Edit className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                          <button onClick={() => handleDelete(expense.id)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}</h2>
              <button onClick={() => { setShowForm(false); setEditingExpense(null); resetForm(); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Fecha *</label>
                  <input type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Estado</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Monto *</label>
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="0" min="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">IVA (ISC)</label>
                  <input type="number" value={form.tax_amount} onChange={e => setForm({ ...form, tax_amount: e.target.value })}
                    placeholder="0" min="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Total</label>
                  <p className="text-sm font-semibold text-slate-900 px-3 py-2 bg-slate-100 rounded-xl">
                    {CLP.format((parseFloat(form.amount) || 0) + (parseFloat(form.tax_amount) || 0))}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Categoría</label>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400">
                  <option value="">Sin categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Proveedor</label>
                  <input type="text" value={form.supplier_name} onChange={e => setForm({ ...form, supplier_name: e.target.value })}
                    placeholder="Nombre del proveedor"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">RUT Proveedor</label>
                  <input type="text" value={form.supplier_rut} onChange={e => setForm({ ...form, supplier_rut: e.target.value })}
                    placeholder="XX.XXX.XXX-X"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Tipo Documento</label>
                  <select value={form.document_type} onChange={e => setForm({ ...form, document_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400">
                    {Object.entries(DOCUMENT_TYPE_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">N° Documento</label>
                  <input type="text" value={form.document_number} onChange={e => setForm({ ...form, document_number: e.target.value })}
                    placeholder="N° comprobante"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Descripción</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Descripción del gasto..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400" />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Notas</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200/80 flex justify-end gap-3">
              <button onClick={() => { setShowForm(false); setEditingExpense(null); resetForm(); }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving || !form.amount}
                className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50">
                {saving ? 'Guardando...' : editingExpense ? 'Actualizar' : 'Crear Gasto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

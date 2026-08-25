'use client';

import { useState } from 'react';
import { Badge } from '@yellow-erp/ui';
import { Receipt, Plus, Trash2, Edit } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  expense_date: string;
  invoice_number: string | null;
  supplier_name: string | null;
  approved: boolean;
}

const categoryConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  travel: { label: 'Viajes', variant: 'info' },
  materials: { label: 'Materiales', variant: 'warning' },
  services: { label: 'Servicios', variant: 'success' },
  equipment: { label: 'Equipamiento', variant: 'neutral' },
  subcontract: { label: 'Subcontratacion', variant: 'danger' },
  other: { label: 'Otros', variant: 'neutral' },
};

export default function ExpensesTab({ projectId, expenses, onRefresh }: { projectId: string; expenses: Expense[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState({ category: 'materials', description: '', amount: '', expense_date: new Date().toISOString().split('T')[0], invoice_number: '', supplier_name: '' });
  const [saving, setSaving] = useState(false);

  const api = getApiClient();

  const openCreate = () => {
    setEditing(null);
    setForm({ category: 'materials', description: '', amount: '', expense_date: new Date().toISOString().split('T')[0], invoice_number: '', supplier_name: '' });
    setShowForm(true);
  };

  const openEdit = (exp: Expense) => {
    setEditing(exp);
    setForm({
      category: exp.category,
      description: exp.description,
      amount: String(exp.amount || ''),
      expense_date: exp.expense_date?.split('T')[0] || '',
      invoice_number: exp.invoice_number || '',
      supplier_name: exp.supplier_name || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.description || !form.amount || !form.expense_date) return;
    setSaving(true);
    try {
      const data = { ...form, amount: parseFloat(form.amount) };
      if (editing) {
        await api.updateProjectExpense(projectId, editing.id, data);
      } else {
        await api.createProjectExpense(projectId, data);
      }
      setShowForm(false);
      setEditing(null);
      onRefresh();
    } catch (err) { toast.error('Error al crear gasto'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este gasto?')) return;
    try { await api.deleteProjectExpense(projectId, id); onRefresh(); } catch (err) { toast.error('Error al eliminar gasto'); }
  };

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const formatCurrency = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Gastos del Proyecto</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Total: {formatCurrency(total)}</p>
        </div>
        <button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Gasto
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
          <Receipt className="w-12 h-12 text-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No hay gastos registrados</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Categoria</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Descripcion</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Proveedor</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Monto</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="px-4 py-3 text-xs text-foreground">{new Date(e.expense_date).toLocaleDateString('es-CL')}</td>
                  <td className="px-4 py-3"><Badge variant={categoryConfig[e.category]?.variant || 'neutral'}>{categoryConfig[e.category]?.label || e.category}</Badge></td>
                  <td className="px-4 py-3 text-xs text-foreground max-w-[200px] truncate">{e.description}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{e.supplier_name || '—'}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-foreground text-right">{formatCurrency(Number(e.amount))}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(e)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                        <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="p-1 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-xl w-full dark:bg-primary max-w- dark:bg-primarymd mx-4">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{editing ? 'Editar Gasto' : 'Nuevo Gasto'}</h2>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-muted-foreground hover:text-foreground">X</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Categoria *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
                    <option value="travel">Viajes</option>
                    <option value="materials">Materiales</option>
                    <option value="services">Servicios</option>
                    <option value="equipment">Equipamiento</option>
                    <option value="subcontract">Subcontratacion</option>
                    <option value="other">Otros</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Monto (CLP) *</label>
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Descripcion *</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Fecha *</label>
                  <input type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Proveedor</label>
                  <input type="text" value={form.supplier_name} onChange={e => setForm({ ...form, supplier_name: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">N. Factura</label>
                <input type="text" value={form.invoice_number} onChange={e => setForm({ ...form, invoice_number: e.target.value })}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="bg-card border border-border hover:bg-muted text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.description || !form.amount}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Gasto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

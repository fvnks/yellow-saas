'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Edit, Trash2, Percent } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface Tax {
  id: string; name: string; code: string; rate: number; type: string;
  sri_code: string; is_active: boolean; product_count: number; created_at: string;
}

const typeLabels: Record<string, string> = { iva: 'IVA', exento: 'Exento', otro: 'Otro' };

export default function TaxesPage() {
  const router = useRouter();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Tax | null>(null);
  const [form, setForm] = useState({ name: '', code: '', rate: 19, type: 'iva', sri_code: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTaxes(); }, []);

  const fetchTaxes = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const data = await api.getTaxes({ limit: '100', ...(search ? { search } : {}) });
      setTaxes(data.data || []);
    } catch (err) { toast.error('Error al cargar impuestos'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTaxes(); }, [search]);

  const openNew = () => { setEditing(null); setForm({ name: '', code: '', rate: 19, type: 'iva', sri_code: '' }); setShowModal(true); };
  const openEdit = (tax: Tax) => { setEditing(tax); setForm({ name: tax.name, code: tax.code, rate: tax.rate, type: tax.type, sri_code: tax.sri_code || '' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || form.rate === undefined) return;
    setSaving(true);
    try {
      const api = getApiClient();
      if (editing) {
        await api.updateTax(editing.id, form);
      } else {
        await api.createTax(form);
      }
      setShowModal(false);
      fetchTaxes();
    } catch (err) { toast.error('Error al guardar impuesto'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este impuesto?')) return;
    try {
      const api = getApiClient();
      await api.deleteTax(id);
      fetchTaxes();
    } catch (err) { toast.error('Error al eliminar impuesto'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/dashboard/bodega')} className="p-1 hover:bg-muted rounded transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Impuestos</h1>
          <p className="text-sm text-muted-foreground mt-1">Configuracion de IVA y otros impuestos</p>
        </div>
        <button onClick={openNew} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Impuesto
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-4 dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar impuesto..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
        </div>
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border dark:bg-primary dark:border-border space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : taxes.length === 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-sm p-12 dark:bg-primary dark:border-border text-center">
          <Percent className="w-12 h-12 text-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No hay impuestos configurados</p>
          <button onClick={openNew} className="mt-4 text-primary hover:text-primary text-sm font-medium">Crear primer impuesto</button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Codigo</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Nombre</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Tarifa</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Productos</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {taxes.map(tax => (
                  <tr key={tax.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="px-4 py-3 text-[9px] font-mono text-muted-foreground">{tax.code}</td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{tax.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-50 text-primary border border-primary/20">
                        {typeLabels[tax.type] || tax.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-semibold text-foreground">{tax.rate}%</td>
                    <td className="px-4 py-3 text-center text-xs text-foreground">{tax.product_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(tax)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(tax.id)} className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-xl w-full dark:bg-primary max-w- dark:bg-primarymd mx-4">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{editing ? 'Editar' : 'Nuevo'} Impuesto</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Nombre *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Codigo *</label>
                  <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Tarifa (%) *</label>
                  <input type="number" step="0.01" value={form.rate} onChange={(e) => setForm({ ...form, rate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Tipo</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
                    <option value="iva">IVA</option>
                    <option value="exento">Exento</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Codigo SII</label>
                <input type="text" value={form.sri_code} onChange={(e) => setForm({ ...form, sri_code: e.target.value })}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="bg-card border border-border hover:bg-muted text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={!form.name || saving}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

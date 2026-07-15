'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Edit, Trash2, ShoppingBag } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface PurchaseRegister {
  id: string;
  razon_social: string;
  rut: string | null;
  invoice_number: string;
  emission_date: string;
  status: string;
  amount: number;
  area: string;
  payment_type: string;
  payment_date: string | null;
  notes: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pagada: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  no_pagada: 'bg-rose-50 text-rose-700 border border-rose-200',
};

const AREA_COLORS: Record<string, string> = {
  LOGISTICA: 'bg-blue-50 text-blue-700 border border-blue-200',
  VERTIKAL: 'bg-violet-50 text-violet-700 border border-violet-200',
  CASA: 'bg-amber-50 text-amber-700 border border-amber-200',
  BRONCES: 'bg-orange-50 text-orange-700 border border-orange-200',
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  tarjeta_credito: 'Tarjeta Crédito',
  tarjeta_debito: 'Tarjeta Débito',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
  cheque: 'Cheque',
  otro: 'Otro',
};

const AREA_OPTIONS = ['LOGISTICA', 'VERTIKAL', 'CASA', 'BRONCES'];
const PAYMENT_OPTIONS = ['tarjeta_credito', 'tarjeta_debito', 'transferencia', 'efectivo', 'cheque', 'otro'];

export default function PurchaseRegisterPage() {
  const router = useRouter();
  const [records, setRecords] = useState<PurchaseRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PurchaseRegister | null>(null);
  const [form, setForm] = useState({
    razon_social: '',
    rut: '',
    invoice_number: '',
    emission_date: new Date().toISOString().split('T')[0],
    status: 'no_pagada',
    amount: '',
    area: 'LOGISTICA',
    payment_type: 'transferencia',
    payment_date: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchRecords(); }, [search, statusFilter, areaFilter]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '100' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (areaFilter) params.area = areaFilter;
      const data = await api.getPurchaseRegisters(params);
      setRecords(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openNew = () => {
    setEditing(null);
    setForm({
      razon_social: '', rut: '', invoice_number: '',
      emission_date: new Date().toISOString().split('T')[0],
      status: 'no_pagada', amount: '', area: 'LOGISTICA',
      payment_type: 'transferencia', payment_date: '', notes: '',
    });
    setShowModal(true);
  };

  const openEdit = (r: PurchaseRegister) => {
    setEditing(r);
    setForm({
      razon_social: r.razon_social,
      rut: r.rut || '',
      invoice_number: r.invoice_number,
      emission_date: r.emission_date?.split('T')[0] || '',
      status: r.status,
      amount: String(r.amount || ''),
      area: r.area,
      payment_type: r.payment_type,
      payment_date: r.payment_date?.split('T')[0] || '',
      notes: r.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.razon_social || !form.invoice_number || !form.area || !form.payment_type) return;
    setSaving(true);
    try {
      const api = getApiClient();
      const payload = {
        ...form,
        amount: form.amount ? parseFloat(form.amount) : 0,
        payment_date: form.payment_date || undefined,
      };
      if (editing) {
        await api.updatePurchaseRegister(editing.id, payload);
      } else {
        await api.createPurchaseRegister(payload);
      }
      setShowModal(false);
      fetchRecords();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este registro?')) return;
    try {
      const api = getApiClient();
      await api.deletePurchaseRegister(id);
      fetchRecords();
    } catch (err) { console.error(err); }
  };

  const formatMoney = (v: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/dashboard/purchases')} className="p-1 hover:bg-slate-100 rounded transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">Registro de Compras</h1>
          <p className="text-sm text-slate-500 mt-1">{records.length} registros</p>
        </div>
        <button onClick={openNew} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nuevo Registro
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar por razón social, RUT, factura..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="">Todos los estados</option>
            <option value="pagada">Pagada</option>
            <option value="no_pagada">No Pagada</option>
          </select>
          <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="">Todas las áreas</option>
            {AREA_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-sm text-slate-500">No hay registros de compras</p>
          <button onClick={openNew} className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium">Crear primer registro</button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Razón Social</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">RUT</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">N° Factura</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha Emisión</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Área</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo Pago</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha Pago</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-slate-900 max-w-[160px] truncate">{r.razon_social}</td>
                    <td className="px-4 py-3 text-xs text-slate-700 font-mono">{r.rut || '-'}</td>
                    <td className="px-4 py-3 text-xs text-slate-700 font-mono">{r.invoice_number}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{r.emission_date?.split('T')[0] || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${STATUS_COLORS[r.status] || ''}`}>
                        {r.status === 'pagada' ? 'Pagada' : 'No Pagada'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-900 font-medium text-right">{formatMoney(r.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${AREA_COLORS[r.area] || ''}`}>
                        {r.area}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">{PAYMENT_TYPE_LABELS[r.payment_type] || r.payment_type}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{r.payment_date?.split('T')[0] || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{editing ? 'Editar' : 'Nuevo'} Registro de Compra</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Razón Social *</label>
                  <input type="text" value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">RUT</label>
                  <input type="text" value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">N° Factura *</label>
                  <input type="text" value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Fecha Emisión</label>
                  <input type="date" value={form.emission_date} onChange={(e) => setForm({ ...form, emission_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Estado</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="pagada">Pagada</option>
                    <option value="no_pagada">No Pagada</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Monto</label>
                  <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Área *</label>
                  <select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    {AREA_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Tipo de Pago *</label>
                  <select value={form.payment_type} onChange={(e) => setForm({ ...form, payment_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    {PAYMENT_OPTIONS.map(p => <option key={p} value={p}>{PAYMENT_TYPE_LABELS[p]}</option>)}
                  </select>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="block text-xs font-medium text-slate-700">Fecha de Pago</label>
                  <input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="block text-xs font-medium text-slate-700">Observaciones</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving}
                className="bg-slate-900 hover:bg-black disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

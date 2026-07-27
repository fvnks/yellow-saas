'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Download, Calendar, DollarSign, FileText } from 'lucide-react';
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

const statusLabels: Record<string, { label: string; color: string }> = {
  pagada: { label: 'Pagada', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  no_pagada: { label: 'No Pagada', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  parcial: { label: 'Parcial', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
  anulada: { label: 'Anulada', color: 'bg-rose-50 text-rose-700 border border-rose-200' },
};

const areaLabels: Record<string, string> = {
  LOGISTICA: 'Logística',
  ADMINISTRACION: 'Administración',
  VENTAS: 'Ventas',
  OPERACIONES: 'Operaciones',
  OTRO: 'Otro',
};

export default function PurchaseBookPage() {
  const [records, setRecords] = useState<PurchaseRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { fetchRecords(); }, [search, statusFilter, dateFrom, dateTo]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '500' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await api.getPurchaseRegisters(params);
      let filtered = data.data || [];
      if (dateFrom) filtered = filtered.filter((r: PurchaseRegister) => r.emission_date >= dateFrom);
      if (dateTo) filtered = filtered.filter((r: PurchaseRegister) => r.emission_date <= dateTo);
      setRecords(filtered);
    } catch { setRecords([]); }
    setLoading(false);
  };

  const totalAmount = records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const paidAmount = records.filter(r => r.status === 'pagada').reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const pendingAmount = records.filter(r => r.status === 'no_pagada').reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Libro de Compras</h1>
          <p className="text-sm text-slate-500 mt-1">Registro de documentos de compra del período</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Compras</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">${totalAmount.toLocaleString('es-CL')}</p>
              <p className="text-xs text-slate-500 mt-1">{records.length} documentos</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Pagadas</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">${paidAmount.toLocaleString('es-CL')}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Pendientes</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">${pendingAmount.toLocaleString('es-CL')}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar por proveedor, RUT o número..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            <span className="text-slate-400 text-xs">a</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="">Todos los estados</option>
            <option value="pagada">Pagada</option>
            <option value="no_pagada">No Pagada</option>
            <option value="parcial">Parcial</option>
            <option value="anulada">Anulada</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">RUT</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">N° Documento</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Área</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">Cargando...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No hay registros en el libro de compras</td></tr>
              ) : records.map(r => {
                const st = statusLabels[r.status] || { label: r.status, color: 'bg-slate-100 text-slate-600 border border-slate-200' };
                return (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-700">{r.emission_date || '—'}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-900">{r.razon_social}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">{r.rut || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-700 font-mono">{r.invoice_number}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{areaLabels[r.area] || r.area}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-900 text-right font-medium">${Number(r.amount || 0).toLocaleString('es-CL')}</td>
                  </tr>
                );
              })}
            </tbody>
            {records.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50">
                  <td colSpan={6} className="px-4 py-3 text-xs font-semibold text-slate-900">Total</td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-900 text-right">${totalAmount.toLocaleString('es-CL')}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { BarChart3, FileText, TrendingUp, Users, Package, Download } from 'lucide-react';

type ReportType = 'summary' | 'monthly' | 'by-customer' | 'by-product' | 'by-employee';

const reportTypes: { id: ReportType; label: string; icon: any }[] = [
  { id: 'summary', label: 'Resumen', icon: BarChart3 },
  { id: 'monthly', label: 'Mensual', icon: TrendingUp },
  { id: 'by-customer', label: 'Por Cliente', icon: Users },
  { id: 'by-product', label: 'Por Producto', icon: Package },
  { id: 'by-employee', label: 'Por Vendedor', icon: Users },
];

export default function SalesReports() {
  const [reportType, setReportType] = useState<ReportType>('summary');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => { loadReport(); }, [reportType, selectedYear]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/sales-reports?type=${reportType}&year=${selectedYear}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const formatMoney = (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  const statusColors: Record<string, string> = {
    delivered: 'bg-emerald-50 text-emerald-700',
    shipped: 'bg-blue-50 text-blue-700',
    processing: 'bg-amber-50 text-amber-700',
    confirmed: 'bg-slate-100 text-slate-600',
    draft: 'bg-slate-100 text-slate-500',
    cancelled: 'bg-red-50 text-red-700',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Reportes de Venta</span>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            {[0, 1, 2].map(offset => <option key={offset} value={new Date().getFullYear() - offset}>{new Date().getFullYear() - offset}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {reportTypes.map(rt => (
          <button key={rt.id} onClick={() => setReportType(rt.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              reportType === rt.id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            <rt.icon className="w-3.5 h-3.5" /> {rt.label}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-8 text-xs text-slate-400">Cargando...</div>}

      {!loading && reportType === 'summary' && data && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-[9px] font-semibold text-slate-500 uppercase">Total Ventas {selectedYear}</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{formatMoney(parseFloat(data.summary?.total || 0))}</p>
              <p className="text-xs text-slate-500 mt-1">{data.summary?.count || 0} órdenes</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-[9px] font-semibold text-slate-500uppercase">Ticket Promedio</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{formatMoney(parseFloat(data.summary?.avg_order || 0))}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-[9px] font-semibold text-slate-500 uppercase">Facturado</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">{formatMoney(parseFloat(data.invoicing?.total || 0))}</p>
              <p className="text-xs text-emerald-500 mt-1">Cobrado: {formatMoney(parseFloat(data.invoicing?.paid || 0))}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-[9px] font-semibold text-slate-500 uppercase">Por Cobrar</p>
              <p className="text-xl font-bold text-red-600 mt-1">{formatMoney((parseFloat(data.invoicing?.total || 0)) - (parseFloat(data.invoicing?.paid || 0)))}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-900 mb-3">Top Productos</h3>
              <div className="space-y-2">
                {(data.topProducts || []).map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-xs text-slate-700">{p.name}</span>
                    <span className="text-xs font-bold text-slate-900">{formatMoney(parseFloat(p.total))}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-900 mb-3">Top Clientes</h3>
              <div className="space-y-2">
                {(data.topCustomers || []).map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-xs text-slate-700">{c.name}</span>
                    <span className="text-xs font-bold text-slate-900">{formatMoney(parseFloat(c.total))}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {data.statusBreakdown && data.statusBreakdown.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-900 mb-3">Por Estado</h3>
              <div className="flex gap-3 flex-wrap">
                {data.statusBreakdown.map((s: any, i: number) => (
                  <div key={i} className={`px-3 py-2 rounded-lg ${statusColors[s.status] || 'bg-slate-100 text-slate-600'}`}>
                    <p className="text-[9px] font-semibold uppercase">{s.status}</p>
                    <p className="text-sm font-bold">{s.count} — {formatMoney(parseFloat(s.total))}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && reportType === 'monthly' && data && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Mes</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Ventas</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Órdenes</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Ticket Prom.</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any) => (
                <tr key={row.month} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-slate-900">{monthNames[parseInt(row.month) - 1]}</td>
                  <td className="px-4 py-3 text-xs text-right font-bold text-slate-900">{formatMoney(parseFloat(row.total))}</td>
                  <td className="px-4 py-3 text-xs text-center text-slate-600">{row.order_count}</td>
                  <td className="px-4 py-3 text-xs text-right text-slate-600">{formatMoney(parseFloat(row.avg_order))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && (reportType === 'by-customer' || reportType === 'by-product' || reportType === 'by-employee') && data && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">
                  {reportType === 'by-customer' ? 'Cliente' : reportType === 'by-product' ? 'Producto' : 'Vendedor'}
                </th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Total</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, i: number) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-slate-900">{row.name}</td>
                  <td className="px-4 py-3 text-xs text-right font-bold text-slate-900">{formatMoney(parseFloat(row.total))}</td>
                  <td className="px-4 py-3 text-xs text-center text-slate-600">{row.order_count || row.qty || row.count}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={3} className="text-center py-8 text-xs text-slate-400">Sin datos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

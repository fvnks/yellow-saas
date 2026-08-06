'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Package } from 'lucide-react';

type ReportType = 'summary' | 'monthly' | 'by-supplier' | 'by-product';

export default function PurchaseReports() {
  const [reportType, setReportType] = useState<ReportType>('summary');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => { loadReport(); }, [reportType, selectedYear]);

  const loadReport = async () => {
    setLoading(true);
    const companyId = localStorage.getItem('company_id');
    const res = await fetch(`/api/companies/${companyId}/purchase-reports?type=${reportType}&year=${selectedYear}`);
    if (res.ok) { const j = await res.json(); setData(j.data); }
    setLoading(false);
  };

  const fmt = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Reportes de Compra</span>
        </div>
        <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}
          className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
          {[0,1,2].map(o => <option key={o} value={new Date().getFullYear() - o}>{new Date().getFullYear() - o}</option>)}
        </select>
      </div>

      <div className="flex gap-2 flex-wrap">
        {([['summary','Resumen',BarChart3],['monthly','Mensual',TrendingUp],['by-supplier','Por Proveedor',Users],['by-product','Por Producto',Package]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setReportType(id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${reportType === id ? 'bg-primary text-white' : 'bg-card border border-border text-slate-600 hover:bg-muted'}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-8 text-xs text-muted-foreground">Cargando...</div>}

      {!loading && reportType === 'summary' && data && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-slate-800">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">Total Compras {selectedYear}</p>
              <p className="text-xl font-bold text-foreground mt-1">{fmt(parseFloat(data.summary?.total || 0))}</p>
              <p className="text-xs text-muted-foreground mt-1">{data.summary?.count || 0} órdenes</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-slate-800">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">Ticket Promedio</p>
              <p className="text-xl font-bold text-foreground mt-1">{fmt(parseFloat(data.summary?.avg_order || 0))}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-slate-800">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">Facturado</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">{fmt(parseFloat(data.invoicing?.total || 0))}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-slate-800">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase">Por Pagar</p>
              <p className="text-xl font-bold text-red-600 mt-1">{fmt((parseFloat(data.invoicing?.total || 0)) - (parseFloat(data.invoicing?.paid || 0)))}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-slate-800">
            <h3 className="text-xs font-semibold text-foreground mb-3">Top Proveedores</h3>
            <div className="space-y-2">
              {(data.topSuppliers || []).map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-foreground">{s.name}</span>
                  <span className="text-xs font-bold text-foreground">{fmt(parseFloat(s.total))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && (reportType === 'monthly' || reportType === 'by-supplier' || reportType === 'by-product') && data && (
        <div className="bg-card border border-border rounded-xl overflow-hidden dark:bg-primary dark:border-slate-800">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase">{reportType === 'monthly' ? 'Mes' : reportType === 'by-supplier' ? 'Proveedor' : 'Producto'}</th>
              <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase">Total</th>
              <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase">{reportType === 'monthly' ? 'Órdenes' : 'Cantidad'}</th>
            </tr></thead>
            <tbody>
              {data.map((row: any, i: number) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-muted transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-foreground">{reportType === 'monthly' ? monthNames[parseInt(row.month) - 1] : row.name}</td>
                  <td className="px-4 py-3 text-xs text-right font-bold text-foreground">{fmt(parseFloat(row.total))}</td>
                  <td className="px-4 py-3 text-xs text-center text-slate-600">{row.order_count || row.qty || row.count}</td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-xs text-muted-foreground">Sin datos</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Skull, Calendar, Package, DollarSign, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';

interface DeadStockProduct {
  id: string;
  name: string;
  sku: string;
  cost_price: number;
  sale_price: number;
  current_stock: number;
  last_movement_date: string | null;
  total_movements: number;
  total_out: number;
}

interface DeadStockReport {
  products: DeadStockProduct[];
  totalValue: number;
  days: number;
  count: number;
}

export default function DeadStockReport() {
  const [report, setReport] = useState<DeadStockReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(90);

  useEffect(() => { loadReport(); }, [days]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/inventory-reports/dead-stock?days=${days}`);
      if (res.ok) {
        const json = await res.json();
        setReport(json.data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleExport = () => {
    if (!report || report.products.length === 0) return;
    const header = 'Producto,SKU,Stock,Costo Unitario,Valor Total,Ultimo Movimiento';
    const rows = report.products.map(p =>
      `"${p.name}","${p.sku}",${p.current_stock},${p.cost_price},${(p.current_stock * p.cost_price).toFixed(2)},"${p.last_movement_date ? new Date(p.last_movement_date).toLocaleDateString('es-CL') : 'Nunca'}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `stock-muerto-${days}d.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Exportado');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skull className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Reporte Stock Muerto</span>
        </div>
        <div className="flex items-center gap-2">
          <select value={days} onChange={e => setDays(Number(e.target.value))}
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-primary/20">
            <option value={30}>30 dias</option>
            <option value={60}>60 dias</option>
            <option value={90}>90 dias</option>
            <option value={180}>6 meses</option>
            <option value={365}>1 ano</option>
          </select>
          {report && report.products.length > 0 && (
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-foreground dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
          )}
        </div>
      </div>

      {report && report.products.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-semibold text-red-600 uppercase">Productos</span>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-foreground">{report.count}</p>
            <p className="text-xs text-red-600 mt-1">sin movimiento en {days} dias</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-semibold text-amber-600 uppercase">Valor Total</span>
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${report.totalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-amber-600 mt-1">en stock estancado</p>
          </div>
          <div className="bg-muted border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase">Periodo</span>
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{days}</p>
            <p className="text-xs text-muted-foreground">dias sin actividad</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : !report || report.products.length === 0 ? (
        <div className="text-center py-12 bg-muted border border-dashed border-slate-300 rounded-xl">
          <Skull className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Sin stock muerto en los ultimos {days} dias</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden dark:bg-primary dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">SKU</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Costo Unit.</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Valor Total</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Ultimo Mov.</th>
                </tr>
              </thead>
              <tbody>
                {report.products.map(p => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-muted transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{p.sku}</td>
                    <td className="px-4 py-3 text-xs text-right font-bold text-foreground">{p.current_stock}</td>
                    <td className="px-4 py-3 text-xs text-right text-slate-600">${p.cost_price}</td>
                    <td className="px-4 py-3 text-xs text-right font-medium text-red-700">
                      ${(p.current_stock * p.cost_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-xs text-right text-muted-foreground">
                      {p.last_movement_date ? new Date(p.last_movement_date).toLocaleDateString('es-CL') : 'Nunca'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

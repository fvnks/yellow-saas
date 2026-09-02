'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Package, Download, Scale, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface ValuationProduct {
  id: string;
  name: string;
  sku: string;
  cost_price: number;
  current_stock: number;
  avg_cost: number;
  total_value: number;
}

interface ValuationReport {
  products: ValuationProduct[];
  totalValue: number;
  totalStock: number;
  method: string;
  count: number;
}

export default function InventoryValuation() {
  const [report, setReport] = useState<ValuationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('weighted_avg');

  useEffect(() => { loadReport(); }, [method]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/inventory-reports/valuation?method=${method}`);
      if (res.ok) {
        const json = await res.json();
        setReport(json.data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleExport = () => {
    if (!report || report.products.length === 0) return;
    const header = 'Producto,SKU,Stock,Costo Unitario,Promedio Ponderado,Valor Total';
    const rows = report.products.map(p =>
      `"${p.name}","${p.sku}",${p.current_stock},${p.cost_price},${p.avg_cost.toFixed(4)},${p.total_value.toFixed(2)}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `valoracion-inventario-${method}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Exportado');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Valoracion de Inventario</span>
        </div>
        <div className="flex items-center gap-2">
          <select value={method} onChange={e => setMethod(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none dark:bg-card dark:border-border dark:text-white focus:ring-2 focus:ring-primary/20">
            <option value="weighted_avg">Promedio Ponderado</option>
            <option value="fifo">FIFO (Costo Standard)</option>
          </select>
          {report && report.products.length > 0 && (
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border hover:bg-muted text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground rounded-lg text-xs font-medium transition-colors">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
          )}
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-semibold text-primary uppercase">Valor Total</span>
              <DollarSign className="w-5 h-5 text-primary/70" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${report.totalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-primary mt-1">{method === 'weighted_avg' ? 'Promedio Ponderado' : 'FIFO'}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase">Unidades</span>
              <Package className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{report.totalStock.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">en inventario</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase">Productos</span>
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{report.count}</p>
            <p className="text-xs text-muted-foreground mt-1">con stock</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : !report || report.products.length === 0 ? (
        <div className="text-center py-12 bg-muted border border-dashed border-border rounded-xl">
          <Scale className="w-8 h-8 text-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Sin productos con stock para valorar</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden dark:bg-primary dark:border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">SKU</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Costo Unit.</th>
                  {method === 'weighted_avg' && (
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Prom. Ponderado</th>
                  )}
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {report.products.map(p => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{p.sku}</td>
                    <td className="px-4 py-3 text-xs text-right font-bold text-foreground">{p.current_stock}</td>
                    <td className="px-4 py-3 text-xs text-right text-foreground">${p.cost_price}</td>
                    {method === 'weighted_avg' && (
                      <td className="px-4 py-3 text-xs text-right text-primary font-medium">${p.avg_cost.toFixed(4)}</td>
                    )}
                    <td className="px-4 py-3 text-xs text-right font-bold text-foreground">
                      ${p.total_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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

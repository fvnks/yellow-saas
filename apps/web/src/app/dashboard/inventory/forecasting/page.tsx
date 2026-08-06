'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Search, Package } from 'lucide-react';

export default function ForecastingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const companyId = localStorage.getItem('company_id');
    fetch(`/api/companies/${companyId}/inventory-reports/forecasting`)
      .then(r => r.json())
      .then(res => setProducts(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Pronóstico de Inventario</h1>
        <p className="text-sm text-muted-foreground mt-1">Predicción de demanda y sugerencias de reabastecimiento</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Stock Actual</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Prom. Mensual</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Días de Stock</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Sugerencia</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">No hay datos de pronóstico</td></tr>
              ) : filtered.map((p, i) => {
                const avgMonthly = parseFloat(p.avg_monthly_sales || p.monthly_average || 0);
                const currentStock = parseFloat(p.quantity || p.stock || 0);
                const daysOfStock = avgMonthly > 0 ? Math.round(currentStock / (avgMonthly / 30)) : 999;
                const reorderPoint = Math.round(avgMonthly * 2);
                const needsReorder = currentStock <= reorderPoint;

                return (
                  <tr key={i} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-foreground">{p.name || p.product_name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{p.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground text-center">{currentStock}</td>
                    <td className="px-4 py-3 text-xs text-foreground text-center">{avgMonthly.toFixed(0)}</td>
                    <td className="px-4 py-3 text-xs text-center">
                      <span className={`font-medium ${daysOfStock < 15 ? 'text-rose-600' : daysOfStock < 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {daysOfStock} días
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground text-center font-medium">{reorderPoint}</td>
                    <td className="px-4 py-3">
                      {needsReorder ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Reordenar
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

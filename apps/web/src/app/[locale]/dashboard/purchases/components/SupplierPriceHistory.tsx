'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';

export default function SupplierPriceHistory() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [productPrices, setProductPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const companyId = localStorage.getItem('company_id');
    fetch(`/api/companies/${companyId}/suppliers`).then(r => r.json()).then(d => setSuppliers(d.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSupplier) return;
    setLoading(true);
    const companyId = localStorage.getItem('company_id');
    fetch(`/api/companies/${companyId}/supplier-price-history?supplierId=${selectedSupplier}`)
      .then(r => r.json()).then(d => { setProductPrices(d.data?.productPrices || []); setLoading(false); }).catch(() => setLoading(false));
  }, [selectedSupplier]);

  const fmt = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  const filtered = suppliers.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.tax_id?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-muted-foreground" />
        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Hist. Precios Proveedor</span>
      </div>
      <div className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-border">
        <div className="flex items-center gap-4">
          <input type="text" placeholder="Buscar proveedor..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
          <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}
            className="w-72 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
            <option value="">Seleccionar proveedor...</option>
            {filtered.map(s => <option key={s.id} value={s.id}>{s.name} — {s.tax_id}</option>)}
          </select>
        </div>
      </div>
      {!selectedSupplier && (
        <div className="text-center py-12 bg-muted border border-dashed border-border rounded-xl">
          <DollarSign className="w-8 h-8 text-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Selecciona un proveedor</p>
        </div>
      )}
      {selectedSupplier && loading && <div className="text-center py-8 text-xs text-muted-foreground">Cargando...</div>}
      {!loading && productPrices.length > 0 && (
        <div className="space-y-2">
          {productPrices.map((pp: any, idx: number) => {
            const isExpanded = expanded === `${idx}`;
            return (
              <div key={idx} className="bg-card border border-border rounded-xl overflow-hidden dark:bg-primary dark:border-border">
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted transition-colors" onClick={() => setExpanded(isExpanded ? null : `${idx}`)}>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div><p className="text-xs font-medium text-foreground">{pp.name}</p><p className="text-[9px] text-muted-foreground">{pp.sku}</p></div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div><p className="text-[9px] text-muted-foreground">Último</p><p className="text-xs font-bold text-foreground">{fmt(pp.prices[0]?.price || 0)}</p></div>
                    <div><p className="text-[9px] text-muted-foreground">Promedio</p><p className="text-xs font-bold text-foreground">{fmt(pp.avgPrice)}</p></div>
                    <div><p className="text-[9px] text-muted-foreground">Rango</p><p className="text-xs text-foreground">{fmt(pp.minPrice)} - {fmt(pp.maxPrice)}</p></div>
                    <div><p className="text-[9px] text-muted-foreground">Unidades</p><p className="text-xs font-bold text-foreground">{pp.totalQty}</p></div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4">
                    <table className="w-full mt-2">
                      <thead><tr className="border-b border-border">
                        <th className="text-left px-3 py-2 text-[9px] font-semibold text-muted-foreground uppercase">Fecha</th>
                        <th className="text-left px-3 py-2 text-[9px] font-semibold text-muted-foreground uppercase">OC</th>
                        <th className="text-right px-3 py-2 text-[9px] font-semibold text-muted-foreground uppercase">Precio</th>
                        <th className="text-right px-3 py-2 text-[9px] font-semibold text-muted-foreground uppercase">Cant.</th>
                        <th className="text-right px-3 py-2 text-[9px] font-semibold text-muted-foreground uppercase">vs Prom.</th>
                      </tr></thead>
                      <tbody>
                        {pp.prices.map((p: any, pi: number) => {
                          const diff = pp.avgPrice > 0 ? ((p.price - pp.avgPrice) / pp.avgPrice) * 100 : 0;
                          return (
                            <tr key={pi} className="border-b border-border">
                              <td className="px-3 py-2 text-xs text-foreground">{new Date(p.date).toLocaleDateString('es-CL')}</td>
                              <td className="px-3 py-2 text-xs text-foreground font-medium">{p.order}</td>
                              <td className="px-3 py-2 text-xs text-right font-bold text-foreground">{fmt(p.price)}</td>
                              <td className="px-3 py-2 text-xs text-right text-foreground">{p.qty}</td>
                              <td className="px-3 py-2 text-right"><span className={`text-[9px] font-semibold ${diff > 0 ? 'text-red-600' : diff < 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>{diff > 0 ? '+' : ''}{diff.toFixed(1)}%</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

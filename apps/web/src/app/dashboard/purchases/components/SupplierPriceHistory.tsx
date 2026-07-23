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
        <DollarSign className="w-4 h-4 text-slate-500" />
        <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Hist. Precios Proveedor</span>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <input type="text" placeholder="Buscar proveedor..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}
            className="w-72 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="">Seleccionar proveedor...</option>
            {filtered.map(s => <option key={s.id} value={s.id}>{s.name} — {s.tax_id}</option>)}
          </select>
        </div>
      </div>
      {!selectedSupplier && (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Selecciona un proveedor</p>
        </div>
      )}
      {selectedSupplier && loading && <div className="text-center py-8 text-xs text-slate-400">Cargando...</div>}
      {!loading && productPrices.length > 0 && (
        <div className="space-y-2">
          {productPrices.map((pp: any, idx: number) => {
            const isExpanded = expanded === `${idx}`;
            return (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setExpanded(isExpanded ? null : `${idx}`)}>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-slate-500" />
                    <div><p className="text-xs font-medium text-slate-900">{pp.name}</p><p className="text-[9px] text-slate-500">{pp.sku}</p></div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div><p className="text-[9px] text-slate-500">Último</p><p className="text-xs font-bold text-slate-900">{fmt(pp.prices[0]?.price || 0)}</p></div>
                    <div><p className="text-[9px] text-slate-500">Promedio</p><p className="text-xs font-bold text-slate-900">{fmt(pp.avgPrice)}</p></div>
                    <div><p className="text-[9px] text-slate-500">Rango</p><p className="text-xs text-slate-600">{fmt(pp.minPrice)} - {fmt(pp.maxPrice)}</p></div>
                    <div><p className="text-[9px] text-slate-500">Unidades</p><p className="text-xs font-bold text-slate-900">{pp.totalQty}</p></div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-slate-100 px-4 pb-4">
                    <table className="w-full mt-2">
                      <thead><tr className="border-b border-slate-200">
                        <th className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Fecha</th>
                        <th className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">OC</th>
                        <th className="text-right px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Precio</th>
                        <th className="text-right px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Cant.</th>
                        <th className="text-right px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">vs Prom.</th>
                      </tr></thead>
                      <tbody>
                        {pp.prices.map((p: any, pi: number) => {
                          const diff = pp.avgPrice > 0 ? ((p.price - pp.avgPrice) / pp.avgPrice) * 100 : 0;
                          return (
                            <tr key={pi} className="border-b border-slate-50">
                              <td className="px-3 py-2 text-xs text-slate-600">{new Date(p.date).toLocaleDateString('es-CL')}</td>
                              <td className="px-3 py-2 text-xs text-slate-900 font-medium">{p.order}</td>
                              <td className="px-3 py-2 text-xs text-right font-bold text-slate-900">{fmt(p.price)}</td>
                              <td className="px-3 py-2 text-xs text-right text-slate-600">{p.qty}</td>
                              <td className="px-3 py-2 text-right"><span className={`text-[9px] font-semibold ${diff > 0 ? 'text-red-600' : diff < 0 ? 'text-emerald-600' : 'text-slate-500'}`}>{diff > 0 ? '+' : ''}{diff.toFixed(1)}%</span></td>
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

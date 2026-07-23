'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';

interface PriceRecord {
  price: number;
  date: string;
  order: string;
  qty: number;
}

interface ProductPrice {
  name: string;
  sku: string;
  prices: PriceRecord[];
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  totalQty: number;
}

export default function CustomerPriceHistory() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [productPrices, setProductPrices] = useState<ProductPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const companyId = localStorage.getItem('company_id');
    fetch(`/api/companies/${companyId}/customers`)
      .then(res => res.json())
      .then(data => setCustomers(data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCustomer) return;
    setLoading(true);
    const companyId = localStorage.getItem('company_id');
    fetch(`/api/companies/${companyId}/customer-price-history?customerId=${selectedCustomer}`)
      .then(res => res.json())
      .then(data => { setProductPrices(data.data?.productPrices || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedCustomer]);

  const formatMoney = (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tax_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-slate-500" />
        <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Historial de Precios por Cliente</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <input type="text" placeholder="Buscar cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}
            className="w-72 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="">Seleccionar cliente...</option>
            {filteredCustomers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.tax_id}</option>)}
          </select>
        </div>
      </div>

      {!selectedCustomer && (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Selecciona un cliente para ver su historial de precios</p>
        </div>
      )}

      {selectedCustomer && loading && <div className="text-center py-8 text-xs text-slate-400">Cargando...</div>}

      {!loading && productPrices.length === 0 && selectedCustomer && (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Sin historial de precios para este cliente</p>
        </div>
      )}

      {!loading && productPrices.length > 0 && (
        <div className="space-y-2">
          {productPrices.map((pp, idx) => {
            const isExpanded = expandedProduct === `${idx}`;
            const priceVariation = pp.maxPrice - pp.minPrice;
            const priceVariationPct = pp.minPrice > 0 ? (priceVariation / pp.minPrice) * 100 : 0;

            return (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedProduct(isExpanded ? null : `${idx}`)}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-900">{pp.name}</p>
                      <p className="text-[9px] text-slate-500">{pp.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-[9px] text-slate-500">Último</p>
                      <p className="text-xs font-bold text-slate-900">{formatMoney(pp.prices[0]?.price || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500">Promedio</p>
                      <p className="text-xs font-bold text-slate-900">{formatMoney(pp.avgPrice)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500">Rango</p>
                      <p className="text-xs text-slate-600">{formatMoney(pp.minPrice)} - {formatMoney(pp.maxPrice)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500">Unidades</p>
                      <p className="text-xs font-bold text-slate-900">{pp.totalQty}</p>
                    </div>
                    {priceVariationPct > 10 && (
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[8px] font-semibold rounded">
                        ±{priceVariationPct.toFixed(0)}%
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 px-4 pb-4">
                    <table className="w-full mt-2">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Fecha</th>
                          <th className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Factura</th>
                          <th className="text-right px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Precio Unit.</th>
                          <th className="text-right px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Cant.</th>
                          <th className="text-right px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">Total</th>
                          <th className="text-right px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase">vs Prom.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pp.prices.map((p, pi) => {
                          const diff = p.price - pp.avgPrice;
                          const diffPct = pp.avgPrice > 0 ? (diff / pp.avgPrice) * 100 : 0;
                          return (
                            <tr key={pi} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                              <td className="px-3 py-2 text-xs text-slate-600">{new Date(p.date).toLocaleDateString('es-CL')}</td>
                              <td className="px-3 py-2 text-xs text-slate-900 font-medium">{p.order}</td>
                              <td className="px-3 py-2 text-xs text-right font-bold text-slate-900">{formatMoney(p.price)}</td>
                              <td className="px-3 py-2 text-xs text-right text-slate-600">{p.qty}</td>
                              <td className="px-3 py-2 text-xs text-right text-slate-600">{formatMoney(p.price * p.qty)}</td>
                              <td className="px-3 py-2 text-right">
                                <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold ${
                                  diff > 0 ? 'text-red-600' : diff < 0 ? 'text-emerald-600' : 'text-slate-500'
                                }`}>
                                  {diff > 0 ? <TrendingUp className="w-3 h-3" /> : diff < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                  {diffPct > 0 ? '+' : ''}{diffPct.toFixed(1)}%
                                </span>
                              </td>
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

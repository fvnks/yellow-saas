'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Search, Package } from 'lucide-react';

export default function DeadStockPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [days, setDays] = useState('90');

  useEffect(() => {
    const companyId = localStorage.getItem('company_id');
    fetch(`/api/companies/${companyId}/inventory-reports/dead-stock?days=${days}`)
      .then(r => r.json())
      .then(res => setProducts(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [days]);

  const filtered = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stock Muerto</h1>
          <p className="text-sm text-slate-500 mt-1">Productos sin movimiento en los últimos días</p>
        </div>
        <select value={days} onChange={e => setDays(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <option value="30">30 días</option>
          <option value="60">60 días</option>
          <option value="90">90 días</option>
          <option value="180">180 días</option>
          <option value="365">1 año</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Costo Unit.</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Valor Total</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Último Mov.</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">No hay stock muerto</td></tr>
              ) : filtered.map((p, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-slate-900">{p.name || p.product_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-900 text-center">{p.quantity || p.stock}</td>
                  <td className="px-4 py-3 text-xs text-slate-900 text-right">${parseFloat(p.cost || p.average_cost || 0).toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3 text-xs text-slate-900 text-right font-medium">${parseFloat(p.total_value || 0).toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{p.last_movement?.split('T')[0] || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

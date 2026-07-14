'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Select, Input } from '@yellow-erp/ui';
import { ArrowLeft, Calculator, Download, RefreshCw, Globe, Currency } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface ValuationItem {
  id: string;
  product_id: string;
  warehouse_id: string;
  base_currency: string;
  target_currency: string;
  exchange_rate_id: string;
  base_value: number;
  target_value: number;
  fx_gain_loss: number;
  valuation_date: string;
  created_at: string;
  product: { id: string; name: string; sku: string; cost_price: number; quantity: number };
  warehouse: { id: string; name: string; code: string };
  exchange_rate: { id: string; rate: number; rate_date: string; from_currency: string; to_currency: string };
}

export default function MultiCurrencyValuationPage() {
  const [items, setItems] = useState<ValuationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ target_currency: 'all', warehouse_id: 'all' });
  const [warehouses, setWarehouses] = useState<{ value: string; label: string }[]>([]);
  const [currencies, setCurrencies] = useState<{ value: string; label: string }[]>([]);
  const [valuationDate, setValuationDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [recalculate, setRecalculate] = useState(false);

  useEffect(() => { loadData(); loadWarehouses(); loadCurrencies(); }, [filters.target_currency, filters.warehouse_id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '500' };
      if (filters.target_currency !== 'all') params.target_currency = filters.target_currency;
      if (filters.warehouse_id !== 'all') params.warehouse = filters.warehouse_id;
      const res = await api.getValuationMultiCurrency(params);
      setItems(res.data || []);
    } catch (err: any) { setError(err.message || 'Error cargando valoración'); }
    finally { setLoading(false); }
  };

  const loadWarehouses = async () => {
    try { const api = getApiClient(); const res = await api.getWarehouses(); setWarehouses((res.data || []).map((w: any) => ({ value: w.id, label: w.name }))); } catch {}
  };

  const loadCurrencies = async () => {
    try { const api = getApiClient(); const res = await api.getExchangeRates({ from_currency: 'CLP', is_active: 'true', limit: '100' }); const unique = [...new Set((res.data || []).map((r: any) => r.to_currency))]; setCurrencies(unique.map(c => ({ value: c, label: c }))); } catch {}
  };

  const handleCalculate = async () => {
    if (!currencies.find(c => c.value === filters.target_currency)) { setError('Selecciona una moneda destino válida'); return; }
    setCalculating(true); setError('');
    try {
      const api = getApiClient();
      await api.createValuationMultiCurrency({ target_currency: filters.target_currency, valuation_date: valuationDate, recalculate });
      loadData();
    } catch (err: any) { setError(err.message || 'Error calculando valoración'); }
    finally { setCalculating(false); }
  };

  const handleExportCSV = () => {
    const headers = ['Producto', 'SKU', 'Bodega', 'Costo CLP', 'Stock', 'Valor CLP', 'Tasa', `Valor ${filters.target_currency}`, 'Ganancia/Pérdida FX', 'Fecha'];
    const rows = items.map(i => [i.product.name, i.product.sku, i.warehouse.name, i.product.cost_price, i.product.quantity || 0, i.base_value, i.exchange_rate?.rate, i.target_value, i.fx_gain_loss, i.valuation_date]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `valoracion-${filters.target_currency}-${valuationDate}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const totalBase = items.reduce((s, i) => s + i.base_value, 0);
  const totalTarget = items.reduce((s, i) => s + i.target_value, 0);
  const totalFx = items.reduce((s, i) => s + i.fx_gain_loss, 0);
  const currentRate = items[0]?.exchange_rate?.rate;

  if (loading) return <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="animate-pulse bg-slate-200 h-32 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Valoración Multi-Moneda</h1>
          <p className="text-sm text-slate-500 mt-1">Stock valorado en CLP y convertido a moneda extranjera usando tasas de cambio</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/bodega" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" /> Exportar CSV</Button>
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="w-4 h-4 mr-2" /> Refrescar</Button>
        </div>
      </div>

      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle>Calcular Valoración</CardTitle>
          <div className="flex items-center gap-4 flex-wrap">
            <Select value={filters.target_currency} onChange={e => setFilters({...filters, target_currency: e.target.value})} options={[{value:'all', label:'Seleccionar moneda...'}, ...currencies]} className="w-40" />
            <Input type="date" value={valuationDate} onChange={e => setValuationDate(e.target.value)} className="w-36" />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={recalculate} onChange={e => setRecalculate(e.target.checked)} className="rounded border-slate-300" />
              Recalcular (sobrescribir)
            </label>
            <Button onClick={handleCalculate} disabled={calculating || filters.target_currency === 'all'}><Calculator className="w-4 h-4 mr-2" /> {calculating ? 'Calculando...' : 'Calcular Valoración'}</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <Card><CardContent className="p-4"><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Valor Total CLP</p><p className="text-2xl font-bold text-slate-900 mt-1">${totalBase.toLocaleString('es-CL')}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Valor Total {filters.target_currency !== 'all' ? filters.target_currency : 'USD'}</p><p className="text-2xl font-bold text-emerald-600 mt-1">${totalTarget.toLocaleString('es-CL')}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Ganancia/Pérdida FX</p><p className="text-2xl font-bold mt-1 ${totalFx >= 0 ? 'text-emerald-600' : 'text-rose-600'}">${totalFx.toLocaleString('es-CL')}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tasa Actual</p><p className="text-2xl font-bold text-blue-600 mt-1">${currentRate?.toLocaleString('es-CL', { minimumFractionDigits: 6, maximumFractionDigits: 6 }) || '—'}</p></CardContent></Card>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Select value={filters.target_currency} onChange={e => setFilters({...filters, target_currency: e.target.value})} options={[{value:'all', label:'Todas las monedas'}, ...currencies]} className="w-40" />
            <Select value={filters.warehouse_id} onChange={e => setFilters({...filters, warehouse_id: e.target.value})} options={[{value:'all', label:'Todas las bodegas'}, ...warehouses]} className="w-48" />
            <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" /> Exportar CSV</Button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12"><Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-sm text-slate-500">No hay valoraciones calculadas. Selecciona moneda y fecha, luego "Calcular Valoración".</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Costo CLP</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Valor CLP</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tasa</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Valor {filters.target_currency !== 'all' ? filters.target_currency : 'USD'}</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Ganancia/Pérdida FX</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha Tasa</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium text-slate-900">{item.product.name}</td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">{item.product.sku}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{item.warehouse.name}</td>
                      <td className="px-4 py-3 text-right text-xs">${item.product.cost_price.toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3 text-center text-xs font-bold">{item.product.quantity || 0}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-slate-900">${item.base_value.toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3 text-center text-xs font-mono text-blue-600">{item.exchange_rate?.rate?.toLocaleString('es-CL', { minimumFractionDigits: 6, maximumFractionDigits: 6 }) || '—'}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-emerald-600">${item.target_value.toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold ${item.fx_gain_loss >= 0 ? 'text-emerald-600' : 'text-rose-600'}">${item.fx_gain_loss >= 0 ? '+' : ''}${item.fx_gain_loss.toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{item.exchange_rate?.rate_date ? new Date(item.exchange_rate.rate_date).toLocaleDateString('es-CL') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
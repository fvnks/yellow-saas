'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@yellow-erp/ui';
import { ArrowLeft, RefreshCw, Calculator, TrendingUp, Download, Settings } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface ForecastItem {
  id: string;
  product_id: string;
  warehouse_id: string | null;
  forecast_date: string;
  horizon_days: number;
  forecast_qty: number;
  lower_bound: number;
  upper_bound: number;
  model_type: string;
  model_params: any;
  accuracy_mape: number;
  accuracy_rmse: number;
  trained_at: string;
  product: { id: string; name: string; sku: string };
  warehouse: { id: string; name: string; code: string } | null;
}

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ model_type: 'all', product_id: '', warehouse_id: 'all' });
  const [products, setProducts] = useState<{ id: string; name: string; sku: string }[]>([]);
  const [warehouses, setWarehouses] = useState<{ value: string; label: string }[]>([]);
  const [genForm, setGenForm] = useState({ product_ids: [] as string[], warehouse_id: '', horizon_days: 30, model_type: 'holt_winters', retrain: false });

  useEffect(() => {
    loadData();
  }, [filter.model_type, filter.product_id, filter.warehouse_id]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const api = getApiClient();
      const [forecastsRes, productsRes, whRes] = await Promise.all([
        api.getDemandForecasts({ model_type: filter.model_type === 'all' ? '' : filter.model_type, product: filter.product_id || '', warehouse: filter.warehouse_id === 'all' ? '' : filter.warehouse_id, limit: '200' }),
        api.getProducts({ limit: '500' }),
        api.getWarehouses(),
      ]);
      setForecasts(forecastsRes.data || []);
      setProducts((productsRes.data || []).map((p: any) => ({ id: p.id, name: p.name, sku: p.sku })));
      setWarehouses([{ value: 'all', label: 'Todas las bodegas' }, ...(whRes.data || []).map((w: any) => ({ value: w.id, label: w.name }))]);
    } catch (err: any) {
      setError(err.message || 'Error cargando pronósticos');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genForm.product_ids.length || !genForm.horizon_days) {
      setError('Selecciona al menos un producto y horizonte');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const api = getApiClient();
      await (api as any).createDemandForecast({
        product_id: genForm.product_ids.join(','),
        warehouse_id: genForm.warehouse_id || undefined,
        horizon_days: genForm.horizon_days,
        model_type: genForm.model_type,
        retrain: genForm.retrain,
      });
      setGenForm({ product_ids: [], warehouse_id: '', horizon_days: 30, model_type: 'holt_winters', retrain: false });
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error generando pronóstico');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Producto', 'SKU', 'Bodega', 'Fecha Pronóstico', 'Horizonte (días)', 'Cant. Pronosticada', 'Límite Inferior', 'Límite Superior', 'Modelo', 'MAPE %', 'RMSE', 'Generado'];
    const rows = forecasts.map(f => [f.product.name, f.product.sku, f.warehouse?.name || '—', f.forecast_date, f.horizon_days, f.forecast_qty, f.lower_bound, f.upper_bound, f.model_type, f.accuracy_mape?.toFixed(2) || '—', f.accuracy_rmse?.toFixed(2) || '—', new Date(f.trained_at).toLocaleString('es-CL')]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'pronosticos-demanda.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="animate-pulse bg-slate-200 h-32 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pronóstico de Demanda</h1>
          <p className="text-sm text-slate-500 mt-1">Predicción Holt-Winters / ARIMA / Moving Average</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="w-4 h-4 mr-2" /> Refrescar</Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" /> CSV</Button>
        </div>
      </div>

      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Generar Nuevo Pronóstico</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setGenForm({ product_ids: [], warehouse_id: '', horizon_days: 30, model_type: 'holt_winters', retrain: false })}><Settings className="w-4 h-4 mr-2" /> Configurar</Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Productos *</label>
                <Select
                  value={genForm.product_ids.join(',')}
                  onChange={(e) => setGenForm({...genForm, product_ids: e.target.value.split(',').filter(Boolean)})}
                  options={[{value:'', label:'Seleccionar...'}, ...products.map(p => ({value: p.id, label: `${p.name} (${p.sku})`}))]}
                  multiple
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Bodega</label>
                <Select value={genForm.warehouse_id} onChange={e => setGenForm({...genForm, warehouse_id: e.target.value})} options={[{value:'', label:'Todas'}, ...warehouses]} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input label="Horizonte (días)" type="number" min="1" max="365" value={genForm.horizon_days} onChange={e => setGenForm({...genForm, horizon_days: parseInt(e.target.value) || 30})} />
              <Select label="Modelo" value={genForm.model_type} onChange={e => setGenForm({...genForm, model_type: e.target.value})} options={[{value:'moving_average', label:'Moving Average'}, {value:'simple_exponential', label:'Simple Exponential'}, {value:'holt_winters', label:'Holt-Winters (Recomendado)'}, {value:'arima', label:'ARIMA Simple'}]} />
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={genForm.retrain} onChange={e => setGenForm({...genForm, retrain: e.target.checked})} className="rounded border-slate-300" />
                  Reentrenar
                </label>
              </div>
              <Button type="submit" disabled={generating} className="self-end">
                {generating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />} {generating ? 'Generando...' : 'Generar Pronóstico'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pronósticos Generados</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filter.model_type} onChange={e => setFilter({...filter, model_type: e.target.value})} options={[{value:'all', label:'Todos los modelos'}, {value:'moving_average', label:'Moving Average'}, {value:'simple_exponential', label:'Simple Exponential'}, {value:'holt_winters', label:'Holt-Winters'}, {value:'arima', label:'ARIMA'}]} className="w-40" />
            <Select value={filter.product_id} onChange={e => setFilter({...filter, product_id: e.target.value})} options={[{value:'', label:'Todos los productos'}, ...products.map(p => ({value: p.id, label: p.name}))]} className="w-48" />
            <Select value={filter.warehouse_id} onChange={e => setFilter({...filter, warehouse_id: e.target.value})} options={warehouses} className="w-48" />
          </div>
        </CardHeader>
        <CardContent>
          {forecasts.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No hay pronósticos generados. Crea uno usando el formulario de arriba.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha Pronóstico</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Horizonte</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Pronosticado</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Rango (Min - Max)</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Modelo</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">MAPE</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">RMSE</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Generado</th>
                  </tr>
                </thead>
                <tbody>
                  {forecasts.map((f) => (
                    <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/inventory/${f.product_id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">{f.product.name}</Link>
                        <div className="text-xs font-mono text-slate-500">{f.product.sku}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700">{f.warehouse?.name || 'Todas'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{new Date(f.forecast_date).toLocaleDateString('es-CL')}</td>
                      <td className="px-4 py-3 text-center text-xs font-bold text-slate-700">{f.horizon_days}d</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-emerald-600">{f.forecast_qty.toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3 text-right text-xs text-slate-500">{f.lower_bound.toLocaleString('es-CL')} - {f.upper_bound.toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={f.model_type === 'holt_winters' ? 'success' : f.model_type === 'arima' ? 'warning' : 'neutral'}>{f.model_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-medium">{f.accuracy_mape?.toFixed(2) || '—'}%</td>
                      <td className="px-4 py-3 text-center text-xs text-slate-500">{f.accuracy_rmse?.toFixed(2) || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(f.trained_at).toLocaleString('es-CL')}</td>
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
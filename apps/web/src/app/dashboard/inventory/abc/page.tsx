'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select } from '@yellow-erp/ui';
import { ArrowLeft, RefreshCw, Calculator, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface ABCItem {
  id: string;
  product_id: string;
  warehouse_id: string;
  abc_class: string;
  xyz_class: string;
  combined_class: string;
  annual_consumption_value: number;
  annual_consumption_qty: number;
  coefficient_of_variation: number;
  rank_position: number;
  total_products: number;
  cummulative_pct: number;
  product: { id: string; name: string; sku: string };
  warehouse: { id: string; name: string; code: string };
}

export default function ABCClassificationPage() {
  const [items, setItems] = useState<ABCItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ warehouse_id: 'all', abc_class: 'all', xyz_class: 'all' });
  const [warehouses, setWarehouses] = useState<{ value: string; label: string }[]>([]);
  const [periodStart, setPeriodStart] = useState(() => new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [periodEnd, setPeriodEnd] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    loadData();
    loadWarehouses();
  }, [filters.warehouse_id, filters.abc_class, filters.xyz_class]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '500' };
      if (filters.warehouse_id !== 'all') params.warehouse = filters.warehouse_id;
      if (filters.abc_class !== 'all') params.abc_class = filters.abc_class;
      if (filters.xyz_class !== 'all') params.xyz_class = filters.xyz_class;
      const res = await api.getProductABCClassification(params);
      setItems(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Error cargando clasificación');
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      const api = getApiClient();
      const res = await api.getWarehouses();
      setWarehouses((res.data || []).map((w: any) => ({ value: w.id, label: w.name })));
    } catch {}
  };

  const handleCalculate = async () => {
    setCalculating(true);
    setError('');
    try {
      const api = getApiClient();
      await (api as any).createProductABCClassification({ period_start: periodStart, period_end: periodEnd, warehouse_id: filters.warehouse_id !== 'all' ? filters.warehouse_id : undefined, recalculate: true });
      setCalculating(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error calculando ABC/XYZ');
      setCalculating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Producto', 'SKU', 'Bodega', 'Clase ABC', 'Clase XYZ', 'Combinada', 'Valor Consumo', 'Cantidad', 'Ranking', 'Acumulado %', 'CV %'];
    const rows = items.map(i => [i.product.name, i.product.sku, i.warehouse.name, i.abc_class, i.xyz_class, i.combined_class, i.annual_consumption_value, i.annual_consumption_qty, i.rank_position, i.cummulative_pct, i.coefficient_of_variation]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'abc-xyz-classification.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const abcColors = { A: 'success', B: 'warning', C: 'neutral' };
  const xyzColors = { X: 'success', Y: 'warning', Z: 'danger' };

  if (loading) return <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="animate-pulse bg-slate-200 h-32 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Análisis ABC/XYZ</h1>
          <p className="text-sm text-slate-500 mt-1">Clasificación de inventario por valor y variabilidad de demanda</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="w-4 h-4 mr-2" /> Refrescar</Button>
          <Button variant="secondary" size="sm" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" /> Exportar CSV</Button>
          <Button onClick={handleCalculate} disabled={calculating}><Calculator className="w-4 h-4 mr-2" /> {calculating ? 'Calculando...' : 'Calcular ABC/XYZ'}</Button>
        </div>
      </div>

      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle>Parámetros de Cálculo</CardTitle>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Período:</label>
              <Input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} className="w-36" />
              <span className="text-slate-400">a</span>
              <Input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className="w-36" />
            </div>
            <Select value={filters.warehouse_id} onChange={e => setFilters({...filters, warehouse_id: e.target.value})} options={[{value:'all', label:'Todas las bodegas'}, ...warehouses]} className="w-48" />
            <Select value={filters.abc_class} onChange={e => setFilters({...filters, abc_class: e.target.value})} options={[{value:'all', label:'Todas ABC'}, {value:'A', label:'A'}, {value:'B', label:'B'}, {value:'C', label:'C'}]} className="w-28" />
            <Select value={filters.xyz_class} onChange={e => setFilters({...filters, xyz_class: e.target.value})} options={[{value:'all', label:'Todas XYZ'}, {value:'X', label:'X'}, {value:'Y', label:'Y'}, {value:'Z', label:'Z'}]} className="w-28" />
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No hay clasificaciones calculadas. Haz clic en "Calcular ABC/XYZ".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">ABC</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">XYZ</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Combinada</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Valor Anual</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cant. Anual</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Ranking</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acumulado %</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">CV %</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium text-slate-900">{item.product.name}</td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">{item.product.sku}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{item.warehouse.name}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={abcColors[item.abc_class as keyof typeof abcColors] as any}>{item.abc_class}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={xyzColors[item.xyz_class as keyof typeof xyzColors] as any}>{item.xyz_class}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-mono text-slate-700">{item.combined_class}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold">${item.annual_consumption_value?.toLocaleString('es-CL') || 0}</td>
                      <td className="px-4 py-3 text-center text-xs font-bold">{item.annual_consumption_qty?.toLocaleString('es-CL') || 0}</td>
                      <td className="px-4 py-3 text-center text-xs text-slate-500">{item.rank_position} / {item.total_products}</td>
                      <td className="px-4 py-3 text-center text-xs text-slate-500">{item.cummulative_pct}%</td>
                      <td className="px-4 py-3 text-center text-xs text-slate-500">{item.coefficient_of_variation?.toFixed(2)}%</td>
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
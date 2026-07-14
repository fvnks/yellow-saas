'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Select, Input } from '@yellow-erp/ui';
import { ArrowLeft, RefreshCw, Download, Calculator, Layers, Settings, FileText, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface ValuationMethod {
  id: string;
  code: string;
  name: string;
  description: string;
  is_default: boolean;
  is_active: boolean;
}

interface ValuationRun {
  id: string;
  valuation_method_id: string;
  method_name: string;
  method_code: string;
  period_start: string;
  period_end: string;
  total_value: number;
  status: string;
  notes: string;
  created_at: string;
}

interface ValuationLayer {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity_remaining: number;
  unit_cost: number;
  total_value: number;
  received_at: string;
}

export default function ValuationPage() {
  const [methods, setMethods] = useState<ValuationMethod[]>([]);
  const [runs, setRuns] = useState<ValuationRun[]>([]);
  const [layers, setLayers] = useState<ValuationLayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'methods' | 'runs' | 'layers'>('methods');
  const [error, setError] = useState('');
  const [newMethod, setNewMethod] = useState({ code: '', name: '', description: '', is_default: false });
  const [runForm, setRunForm] = useState({ valuation_method_id: '', period_start: '', period_end: '' });
  const [filter, setFilter] = useState({ method: '', warehouse: '', search: '' });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const api = getApiClient();
      const [methodsRes, runsRes] = await Promise.all([
        api.getValuationMethods({ limit: '100' }),
        api.getValuationRuns({ limit: '50' }),
      ]);
      setMethods(methodsRes.data || []);
      setRuns(runsRes.data || []);

      if (activeTab === 'layers') {
        const layersRes = await api.getStockLevels({ limit: '5000' });
        const layersData = (layersRes.data || []).map((sl: any) => ({
          id: sl.id,
          product_id: sl.product_id,
          product_name: sl.product?.name || '',
          product_sku: sl.product?.sku || '',
          warehouse_id: sl.warehouse_id,
          warehouse_name: sl.warehouse?.name || '',
          quantity_remaining: sl.quantity || 0,
          unit_cost: sl.product?.cost_price || 0,
          total_value: (sl.quantity || 0) * (sl.product?.cost_price || 0),
          received_at: sl.updated_at,
        })).filter((l: any) => l.quantity_remaining > 0);
        setLayers(layersData);
      }
    } catch (err: any) {
      setError(err.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const api = getApiClient();
      await api.createValuationMethod(newMethod);
      setNewMethod({ code: '', name: '', description: '', is_default: false });
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error creando método');
    }
  };

  const handleRunValuation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runForm.valuation_method_id || !runForm.period_start || !runForm.period_end) {
      setError('Completa todos los campos');
      return;
    }
    setRunning(true);
    try {
      const api = getApiClient();
      await api.runValuation(runForm);
      setRunForm({ valuation_method_id: '', period_start: '', period_end: '' });
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error ejecutando valoración');
    } finally {
      setRunning(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Producto', 'SKU', 'Bodega', 'Cantidad', 'Costo Unit.', 'Valor Total', 'Fecha Recepción'];
    const rows = layers.map(l => [l.product_name, l.product_sku, l.warehouse_name, l.quantity_remaining, l.unit_cost, l.total_value, new Date(l.received_at).toLocaleDateString('es-CL')]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'valoracion-inventario.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const totalValue = layers.reduce((sum, l) => sum + l.total_value, 0);
  const totalQuantity = layers.reduce((sum, l) => sum + l.quantity_remaining, 0);
  const productCount = new Set(layers.map(l => l.product_id)).size;
  const warehouseCount = new Set(layers.map(l => l.warehouse_id)).size;

  if (loading) return <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="animate-pulse bg-slate-200 h-32 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Valoración de Inventario</h1>
          <p className="text-sm text-slate-500 mt-1">Métodos, ejecuciones y capas de valoración (FIFO/LIFO/WAC)</p>
        </div>
        <Link href="/dashboard/bodega" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div className="flex border-b border-slate-200">
        {[
          { id: 'methods', label: 'Métodos', icon: Settings },
          { id: 'runs', label: 'Ejecuciones', icon: Calculator },
          { id: 'layers', label: 'Capas / Stock Valorizado', icon: Layers },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'methods' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Métodos de Valoración</CardTitle>
              <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="w-4 h-4 mr-2" /> Refrescar</Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateMethod} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                <Input label="Código" value={newMethod.code} onChange={e => setNewMethod({...newMethod, code: e.target.value.toUpperCase()})} placeholder="FIFO" required />
                <Input label="Nombre" value={newMethod.name} onChange={e => setNewMethod({...newMethod, name: e.target.value})} placeholder="FIFO (First In, First Out)" required />
                <Input label="Descripción" value={newMethod.description} onChange={e => setNewMethod({...newMethod, description: e.target.value})} placeholder="Los primeros en entrar son los primeros en salir" />
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={newMethod.is_default} onChange={e => setNewMethod({...newMethod, is_default: e.target.checked})} className="rounded border-slate-300" />
                    Por defecto
                  </label>
                </div>
              </form>
              <div className="flex justify-end">
                <Button type="submit" form="method-form" disabled={methods.some(m => m.is_default && !newMethod.is_default)}>
                  <Plus className="w-4 h-4 mr-2" /> Crear Método
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Código</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Descripción</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Defecto</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Activo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {methods.map(m => (
                      <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-xs font-mono font-medium">{m.code}</td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-900">{m.name}</td>
                        <td className="px-4 py-3 text-xs text-slate-500 max-w-[300px] truncate">{m.description}</td>
                        <td className="px-4 py-3 text-center">
                          {m.is_default && <Badge variant="success">Por defecto</Badge>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={m.is_active ? 'success' : 'neutral'}>
                            {m.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'runs' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ejecutar Nueva Valoración</CardTitle>
            </CardHeader>
            <CardContent>
<form onSubmit={handleRunValuation} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select label="Método" value={runForm.valuation_method_id} onChange={e => setRunForm({...runForm, valuation_method_id: e.target.value})} options={[{value:'', label:'Seleccionar...'}, ...methods.filter(m => m.is_active).map(m => ({value: m.id, label: `${m.code} - ${m.name}`}))]}/>
                <Input label="Fecha Inicio" type="date" value={runForm.period_start} onChange={e => setRunForm({...runForm, period_start: e.target.value})} required />
                <Input label="Fecha Fin" type="date" value={runForm.period_end} onChange={e => setRunForm({...runForm, period_end: e.target.value})} required />
                <Button type="submit" disabled={running} className="self-end">
                  {running ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />} {running ? 'Calculando...' : 'Ejecutar Valoración'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Historial de Valoraciones</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="w-4 h-4 mr-2" /> Refrescar</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Método</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Período</th>
                      <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Valor Total</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map(r => (
                      <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-xs font-medium">{r.method_code} - {r.method_name}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {new Date(r.period_start).toLocaleDateString('es-CL')} - {new Date(r.period_end).toLocaleDateString('es-CL')}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-bold text-slate-900">${Number(r.total_value).toLocaleString('es-CL')}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={r.status === 'completed' ? 'success' : r.status === 'running' ? 'warning' : 'danger'}>
                            {r.status === 'completed' ? 'Completado' : r.status === 'running' ? 'Ejecutando' : 'Fallido'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{new Date(r.created_at).toLocaleString('es-CL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'layers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Valor Total</p><p className="text-2xl font-bold text-slate-900 mt-1">${totalValue.toLocaleString('es-CL')}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Unidades Totales</p><p className="text-2xl font-bold text-slate-900 mt-1">{totalQuantity.toLocaleString('es-CL')}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Productos con Stock</p><p className="text-2xl font-bold text-slate-900 mt-1">{productCount}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodegas</p><p className="text-2xl font-bold text-slate-900 mt-1">{warehouseCount}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Capas de Valoración (Stock Valorizado)</CardTitle>
              <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" /> Exportar CSV</Button>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Input placeholder="Buscar producto/SKU..." value={filter.search} onChange={e => setFilter({...filter, search: e.target.value})} className="w-64" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cantidad</th>
                      <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Costo Unit.</th>
                      <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Valor Total</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {layers
                      .filter(l => l.product_name.toLowerCase().includes(filter.search.toLowerCase()) || l.product_sku.toLowerCase().includes(filter.search.toLowerCase()))
                      .map(l => (
                        <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 text-xs font-medium text-slate-900">{l.product_name}</td>
                          <td className="px-4 py-3 text-xs font-mono text-slate-500">{l.product_sku}</td>
                          <td className="px-4 py-3 text-xs text-slate-700">{l.warehouse_name}</td>
                          <td className="px-4 py-3 text-center text-xs font-bold">{l.quantity_remaining}</td>
                          <td className="px-4 py-3 text-right text-xs">${l.unit_cost.toLocaleString('es-CL')}</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-slate-900">${l.total_value.toLocaleString('es-CL')}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{new Date(l.received_at).toLocaleDateString('es-CL')}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
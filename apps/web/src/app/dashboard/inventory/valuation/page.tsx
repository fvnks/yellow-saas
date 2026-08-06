'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Download, Calculator, Layers, Settings, Plus, Edit, Trash2, Play, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';

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
  layer_date: string;
  reference_type: string;
}

export default function ValuationPage() {
  const [methods, setMethods] = useState<ValuationMethod[]>([]);
  const [runs, setRuns] = useState<ValuationRun[]>([]);
  const [layers, setLayers] = useState<ValuationLayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'methods' | 'runs' | 'layers'>('methods');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingMethod, setEditingMethod] = useState<ValuationMethod | null>(null);
  const [methodForm, setMethodForm] = useState({ code: '', name: '', description: '', is_default: false });
  const [runForm, setRunForm] = useState({ valuation_method_id: '', period_start: '', period_end: '' });
  const [filter, setFilter] = useState({ search: '', warehouse: '' });

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
          layer_date: sl.updated_at,
          reference_type: 'stock_level',
        })).filter((l: any) => l.quantity_remaining > 0);
        setLayers(layersData);
      }
    } catch (err: any) {
      setError(err.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const api = getApiClient();
      if (editingMethod) {
        await fetch(`/api/companies/${(api as any).companyId}/inventory-valuation-methods/${editingMethod.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(methodForm),
        });
        setSuccess('Método actualizado');
      } else {
        await api.createValuationMethod(methodForm);
        setSuccess('Método creado');
      }
      setMethodForm({ code: '', name: '', description: '', is_default: false });
      setEditingMethod(null);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error guardando método');
    }
  };

  const handleEditMethod = (m: ValuationMethod) => {
    setEditingMethod(m);
    setMethodForm({ code: m.code, name: m.name, description: m.description, is_active: m.is_active, is_default: m.is_default } as any);
  };

  const handleDeleteMethod = async (id: string) => {
    if (!confirm('Eliminar este método de valoración?')) return;
    try {
      const api = getApiClient();
      await fetch(`/api/companies/${(api as any).companyId}/inventory-valuation-methods/${id}`, { method: 'DELETE' });
      setSuccess('Método eliminado');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error eliminando método');
    }
  };

  const handleRunValuation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runForm.valuation_method_id || !runForm.period_start || !runForm.period_end) {
      setError('Completa todos los campos');
      return;
    }
    setRunning(true);
    setError('');
    try {
      const api = getApiClient();
      await api.runValuation(runForm);
      setRunForm({ valuation_method_id: '', period_start: '', period_end: '' });
      setSuccess('Valoración ejecutada correctamente');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error ejecutando valoración');
    } finally {
      setRunning(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Producto', 'SKU', 'Bodega', 'Cantidad', 'Costo Unit.', 'Valor Total', 'Fecha'];
    const rows = filteredLayers.map(l => [
      l.product_name, l.product_sku, l.warehouse_name,
      l.quantity_remaining, l.unit_cost, l.total_value,
      new Date(l.layer_date).toLocaleDateString('es-CL'),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `valorizacion-inventario-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLayers = layers.filter(l =>
    l.product_name.toLowerCase().includes(filter.search.toLowerCase()) ||
    l.product_sku.toLowerCase().includes(filter.search.toLowerCase()) ||
    l.warehouse_name.toLowerCase().includes(filter.search.toLowerCase())
  );

  const totalValue = filteredLayers.reduce((sum, l) => sum + l.total_value, 0);
  const totalQuantity = filteredLayers.reduce((sum, l) => sum + l.quantity_remaining, 0);
  const productCount = new Set(filteredLayers.map(l => l.product_id)).size;
  const warehouseCount = new Set(filteredLayers.map(l => l.warehouse_id)).size;

  const formatCurrency = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-64 animate-pulse" />
        <div className="h-4 bg-muted rounded w-96 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Valoración de Inventario</h1>
          <p className="text-sm text-muted-foreground mt-1">Métodos FIFO/LIFO/WAC, ejecuciones y capas de stock valorizado</p>
        </div>
        <Link href="/dashboard/bodega" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700"><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-emerald-500 hover:text-emerald-700"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
        <ContinuousTabs
          tabs={[
            { id: 'methods', label: 'Metodos' },
            { id: 'runs', label: 'Ejecuciones' },
            { id: 'layers', label: 'Capas / Stock' },
          ]}
          defaultActiveId={activeTab}
          onChange={(id) => setActiveTab(id as typeof activeTab)}
        />

      </div>

      {/* METHODS TAB */}
      {activeTab === 'methods' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {editingMethod ? 'Editar Método' : 'Nuevo Método'}
              </h3>
              {editingMethod && (
                <button onClick={() => { setEditingMethod(null); setMethodForm({ code: '', name: '', description: '', is_default: false }); }}
                  className="text-xs text-muted-foreground hover:text-foreground">Cancelar</button>
              )}
            </div>
            <div className="p-6">
              <form onSubmit={handleSaveMethod} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Código</label>
                  <input type="text" value={methodForm.code} onChange={e => setMethodForm({ ...methodForm, code: e.target.value.toUpperCase() })}
                    placeholder="FIFO" required
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Nombre</label>
                  <input type="text" value={methodForm.name} onChange={e => setMethodForm({ ...methodForm, name: e.target.value })}
                    placeholder="First In, First Out" required
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Descripción</label>
                  <input type="text" value={methodForm.description} onChange={e => setMethodForm({ ...methodForm, description: e.target.value })}
                    placeholder="Los primeros en entrar salen primero"
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
                <div className="flex items-end gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={methodForm.is_default} onChange={e => setMethodForm({ ...methodForm, is_default: e.target.checked })}
                      className="rounded border-border text-primary focus:ring-primary/20" />
                    Por defecto
                  </label>
                  <button type="submit"
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ml-auto">
                    <Plus className="w-4 h-4" /> {editingMethod ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Métodos de Valoración</h3>
              <button onClick={loadData} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Refrescar
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Código</th>
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Nombre</th>
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Descripción</th>
                    <th className="text-center px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Defecto</th>
                    <th className="text-center px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                    <th className="text-right px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {methods.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">No hay métodos configurados. Crea uno para comenzar.</td></tr>
                  ) : methods.map(m => (
                    <tr key={m.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="px-6 py-3 text-xs font-mono font-semibold text-foreground">{m.code}</td>
                      <td className="px-6 py-3 text-xs font-medium text-foreground">{m.name}</td>
                      <td className="px-6 py-3 text-xs text-muted-foreground max-w-[300px] truncate">{m.description || '-'}</td>
                      <td className="px-6 py-3 text-center">
                        {m.is_default && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-50 text-primary border border-primary/20">
                            Por defecto
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                          m.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-muted text-foreground border border-border'
                        }`}>
                          {m.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleEditMethod(m)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-blue-50 rounded transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          {!m.is_default && (
                            <button onClick={() => handleDeleteMethod(m.id)}
                              className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RUNS TAB */}
      {activeTab === 'runs' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Ejecutar Nueva Valoración</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleRunValuation} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Método</label>
                  <select value={runForm.valuation_method_id} onChange={e => setRunForm({ ...runForm, valuation_method_id: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
                    <option value="">Seleccionar...</option>
                    {methods.filter(m => m.is_active).map(m => (
                      <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Fecha Inicio</label>
                  <input type="date" value={runForm.period_start} onChange={e => setRunForm({ ...runForm, period_start: e.target.value })}
                    required
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Fecha Fin</label>
                  <input type="date" value={runForm.period_end} onChange={e => setRunForm({ ...runForm, period_end: e.target.value })}
                    required
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
                <div className="flex items-end">
                  <button type="submit" disabled={running || methods.length === 0}
                    className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                    {running ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Calculando...</>
                    ) : (
                      <><Play className="w-4 h-4" /> Ejecutar</>
                    )}
                  </button>
                </div>
              </form>
              {methods.length === 0 && (
                <p className="text-xs text-amber-600 mt-3">Crea un método de valoración primero en la pestaña &quot;Métodos&quot;.</p>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Historial de Valoraciones</h3>
              <button onClick={loadData} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Refrescar
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Método</th>
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Período</th>
                    <th className="text-right px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Valor Total</th>
                    <th className="text-center px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha Ejecución</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">No hay valoraciones ejecutadas.</td></tr>
                  ) : runs.map(r => (
                    <tr key={r.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="px-6 py-3 text-xs font-medium text-foreground">{r.method_name || r.valuation_method_id}</td>
                      <td className="px-6 py-3 text-xs text-foreground">
                        {new Date(r.period_start).toLocaleDateString('es-CL')} - {new Date(r.period_end).toLocaleDateString('es-CL')}
                      </td>
                      <td className="px-6 py-3 text-right text-xs font-bold text-foreground">{formatCurrency(r.total_value)}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                          r.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          r.status === 'running' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {r.status === 'completed' ? 'Completado' : r.status === 'running' ? 'Ejecutando' : 'Fallido'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString('es-CL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* LAYERS TAB */}
      {activeTab === 'layers' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Valor Total</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalValue)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Unidades Totales</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{totalQuantity.toLocaleString('es-CL')}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Layers className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Productos</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{productCount}</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-border dark:bg-primary dark:border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Bodegas</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{warehouseCount}</p>
                </div>
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-rose-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Layers Table */}
          <div className="bg-card border border-border rounded-xl shadow-sm dark:bg-primary dark:border-border">
            <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">Capas de Valoración (Stock Valorizado)</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input type="text" placeholder="Buscar producto, SKU o bodega..." value={filter.search}
                    onChange={e => setFilter({ ...filter, search: e.target.value })}
                    className="w-64 bg-muted border border-border rounded-lg pl-3 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
                <button onClick={handleExportCSV}
                  className="bg-card border border-border hover:bg-muted text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button onClick={loadData}
                  className="bg-card border border-border hover:bg-muted text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Refrescar
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">SKU</th>
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Bodega</th>
                    <th className="text-center px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Cantidad</th>
                    <th className="text-right px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Costo Unit.</th>
                    <th className="text-right px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Valor Total</th>
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLayers.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      {layers.length === 0 ? 'No hay stock valorizado. Ejecuta una valoración primero.' : 'No se encontraron resultados.'}
                    </td></tr>
                  ) : filteredLayers.map(l => (
                    <tr key={l.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="px-6 py-3 text-xs font-medium text-foreground">{l.product_name}</td>
                      <td className="px-6 py-3 text-xs font-mono text-muted-foreground">{l.product_sku}</td>
                      <td className="px-6 py-3 text-xs text-foreground">{l.warehouse_name}</td>
                      <td className="px-6 py-3 text-center text-xs font-bold text-foreground">{l.quantity_remaining.toLocaleString('es-CL')}</td>
                      <td className="px-6 py-3 text-right text-xs text-foreground">{formatCurrency(l.unit_cost)}</td>
                      <td className="px-6 py-3 text-right text-xs font-bold text-foreground">{formatCurrency(l.total_value)}</td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">{new Date(l.layer_date).toLocaleDateString('es-CL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredLayers.length > 0 && (
              <div className="px-6 py-3 border-t border-border bg-muted flex justify-between text-xs text-foreground">
                <span>{filteredLayers.length} registros</span>
                <span className="font-semibold">Total: {formatCurrency(totalValue)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

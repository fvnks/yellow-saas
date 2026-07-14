'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select } from '@yellow-erp/ui';
import { ArrowLeft, Plus, RefreshCw, Download, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  rate_date: string;
  source: string;
  is_active: boolean;
  created_at: string;
}

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ from_currency: 'CLP', to_currency: 'USD', rate: '', rate_date: new Date().toISOString().slice(0, 10), source: 'manual' });
  const [filters, setFilters] = useState({ from_currency: 'all', to_currency: 'all', is_active: 'all' });

  useEffect(() => { loadRates(); }, [filters.from_currency, filters.to_currency, filters.is_active]);

  const loadRates = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '200' };
      if (filters.from_currency !== 'all') params.from_currency = filters.from_currency;
      if (filters.to_currency !== 'all') params.to_currency = filters.to_currency;
      if (filters.is_active !== 'all') params.is_active = filters.is_active;
      const res = await api.getExchangeRates(params);
      setRates(res.data || []);
    } catch (err: any) { setError(err.message || 'Error cargando tasas'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const api = getApiClient();
      if (editingId) await (api as any).updateExchangeRate(editingId, { ...formData, rate: Number(formData.rate) });
      else await (api as any).createExchangeRate({ ...formData, rate: Number(formData.rate) });
      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadRates();
    } catch (err: any) { setError(err.message || 'Error guardando tasa'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta tasa de cambio?')) return;
    try {
      const api = getApiClient();
      await (api as any).deleteExchangeRate(id);
      loadRates();
    } catch (err: any) { setError(err.message || 'Error eliminando'); }
  };

  const handleEdit = (rate: ExchangeRate) => {
    setFormData({ from_currency: rate.from_currency, to_currency: rate.to_currency, rate: rate.rate.toString(), rate_date: rate.rate_date.slice(0, 10), source: rate.source });
    setEditingId(rate.id);
    setShowForm(true);
  };

  const resetForm = () => { setFormData({ from_currency: 'CLP', to_currency: 'USD', rate: '', rate_date: new Date().toISOString().slice(0, 10), source: 'manual' }); setEditingId(null); };

  const handleExportCSV = () => {
    const headers = ['Desde', 'Hacia', 'Tasa', 'Fecha', 'Fuente', 'Activa', 'Creado'];
    const rows = rates.map(r => [r.from_currency, r.to_currency, r.rate, r.rate_date.slice(0,10), r.source, r.is_active ? 'Sí' : 'No', new Date(r.created_at).toLocaleString('es-CL')]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'tasas-cambio.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const formatRate = (rate: number, from: string, to: string) => `${rate.toLocaleString('es-CL', { minimumFractionDigits: 6, maximumFractionDigits: 6 })} ${to}/${from}`;

  if (loading) return <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="animate-pulse bg-slate-200 h-32 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tasas de Cambio</h1>
          <p className="text-sm text-slate-500 mt-1">Gestiona tasas CLP → Moneda extranjera para valoración multi-moneda</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={loadRates}><RefreshCw className="w-4 h-4 mr-2" /> Refrescar</Button>
          <Button onClick={() => { resetForm(); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" /> Nueva Tasa</Button>
        </div>
      </div>

      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? 'Editar Tasa' : 'Nueva Tasa de Cambio'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Moneda Origen</label>
                <Select value={formData.from_currency} onChange={e => setFormData({...formData, from_currency: e.target.value})} options={['CLP', 'USD', 'EUR', 'CNY', 'BRL', 'ARS', 'MXN', 'COP', 'PEN'].map(s => ({value: s, label: s}))} disabled={!!editingId} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Moneda Destino</label>
                <Select value={formData.to_currency} onChange={e => setFormData({...formData, to_currency: e.target.value})} options={['USD', 'EUR', 'CLP', 'CNY', 'BRL', 'ARS', 'MXN', 'COP', 'PEN'].map(s => ({value: s, label: s}))} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tasa (1 origen = X destino)</label>
                <Input type="number" step="0.000001" min="0.000001" value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} placeholder="950.50" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Fecha Vigencia</label>
                <Input type="date" value={formData.rate_date} onChange={e => setFormData({...formData, rate_date: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Fuente</label>
                <Select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} options={['manual', 'mindicador', 'banco_central', 'fixer', 'exchangerate_api'].map(s => ({value: s, label: s}))} />
              </div>
              <div className="md:col-span-3 flex justify-end gap-2 pt-4 border-t border-slate-200">
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}>Cancelar</Button>
                <Button type="submit">{editingId ? 'Actualizar' : 'Crear'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle>Tasas Registradas</CardTitle>
          <div className="flex items-center gap-4 flex-wrap">
            <Select value={filters.from_currency} onChange={e => setFilters({...filters, from_currency: e.target.value})} options={[{value:'all', label:'Todas Origen'}, ...['CLP', 'USD', 'EUR', 'CNY', 'BRL', 'ARS', 'MXN', 'COP', 'PEN'].map(s => ({value: s, label: s}))]} className="w-32" />
            <Select value={filters.to_currency} onChange={e => setFilters({...filters, to_currency: e.target.value})} options={[{value:'all', label:'Todas Destino'}, ...['USD', 'EUR', 'CLP', 'CNY', 'BRL', 'ARS', 'MXN', 'COP', 'PEN'].map(s => ({value: s, label: s}))]} className="w-32" />
            <Select value={filters.is_active} onChange={e => setFilters({...filters, is_active: e.target.value})} options={[{value:'all', label:'Todas'}, {value:'true', label:'Activas'}, {value:'false', label:'Inactivas'}]} className="w-28" />
          </div>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
          {rates.length === 0 ? (
            <div className="text-center py-12"><TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-sm text-slate-500">No hay tasas registradas. Crea la primera tasa.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Par</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tasa</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fuente</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Creado</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map(rate => (
                    <tr key={rate.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-medium text-slate-900">{rate.from_currency} → {rate.to_currency}</span>
                        {rate.from_currency === 'CLP' && <span className="ml-2 text-xs text-emerald-600 font-medium">Base</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-mono font-medium text-slate-700">{rate.rate.toLocaleString('es-CL', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(rate.rate_date).toLocaleDateString('es-CL')}</td>
                      <td className="px-4 py-3">
                        <Badge variant={rate.source === 'manual' ? 'neutral' : rate.source === 'mindicador' ? 'success' : rate.source === 'banco_central' ? 'warning' : 'info'}>{rate.source}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={rate.is_active ? 'success' : 'neutral'}>{rate.is_active ? 'Activa' : 'Inactiva'}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(rate.created_at).toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(rate)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(rate.id)} className="text-rose-600 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
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
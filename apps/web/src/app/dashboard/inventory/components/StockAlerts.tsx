'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Bell, BellOff, Plus, Trash2, Settings, TrendingDown, TrendingUp, XCircle, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface StockAlert {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  warehouse_id: string;
  warehouse_name: string;
  warehouse_code: string;
  alert_type: string;
  threshold: number;
  is_active: boolean;
  current_stock: number;
  min_stock: number;
  max_stock: number;
}

const alertTypeConfig: Record<string, { label: string; icon: typeof AlertTriangle; color: string }> = {
  min_stock: { label: 'Stock Minimo', icon: TrendingDown, color: 'text-amber-600 bg-amber-50' },
  max_stock: { label: 'Stock Maximo', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
  out_of_stock: { label: 'Sin Stock', icon: XCircle, color: 'text-red-600 bg-red-50' },
  expiring: { label: 'Por Vencer', icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
};

export default function StockAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newAlert, setNewAlert] = useState({ product_id: '', warehouse_id: '', alert_type: 'min_stock', threshold: 0 });
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  useEffect(() => {
    loadAlerts();
    loadProducts();
    loadWarehouses();
  }, []);

  const loadAlerts = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/stock-alerts?status=triggered`);
      if (res.ok) {
        const json = await res.json();
        setAlerts(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadProducts = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/products?limit=100`);
      if (res.ok) {
        const json = await res.json();
        setProducts(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e) { console.error(e); }
  };

  const loadWarehouses = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/warehouses`);
      if (res.ok) {
        const json = await res.json();
        setWarehouses(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    if (!newAlert.product_id || !newAlert.warehouse_id) {
      toast.error('Seleccione producto y bodega');
      return;
    }
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/stock-alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert),
      });
      if (res.ok) {
        toast.success('Alerta creada');
        setShowCreate(false);
        setNewAlert({ product_id: '', warehouse_id: '', alert_type: 'min_stock', threshold: 0 });
        loadAlerts();
      }
    } catch (e) { toast.error('Error al crear alerta'); }
  };

  const handleDelete = async (alertId: string) => {
    if (!confirm('Eliminar alerta?')) return;
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/stock-alerts/${alertId}`, { method: 'DELETE' });
      toast.success('Alerta eliminada');
      loadAlerts();
    } catch (e) { toast.error('Error al eliminar'); }
  };

  const handleToggle = async (alertId: string, isActive: boolean) => {
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/stock-alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });
      loadAlerts();
    } catch (e) { toast.error('Error al actualizar'); }
  };

  const triggeredCount = alerts.filter(a =>
    (a.alert_type === 'min_stock' && a.current_stock <= a.threshold) ||
    (a.alert_type === 'out_of_stock' && a.current_stock === 0) ||
    (a.alert_type === 'max_stock' && a.current_stock >= a.threshold)
  ).length;

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
            Alertas de Stock {triggeredCount > 0 && `(${triggeredCount} activas)`}
          </span>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nueva Alerta
        </button>
      </div>

      {showCreate && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Crear Alerta</span>
            <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-slate-200 rounded">
              <X className="w-3 h-3 text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={newAlert.product_id} onChange={e => setNewAlert({ ...newAlert, product_id: e.target.value })}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500">
              <option value="">Producto...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={newAlert.warehouse_id} onChange={e => setNewAlert({ ...newAlert, warehouse_id: e.target.value })}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500">
              <option value="">Bodega...</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select value={newAlert.alert_type} onChange={e => setNewAlert({ ...newAlert, alert_type: e.target.value })}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500">
              <option value="min_stock">Stock Minimo</option>
              <option value="max_stock">Stock Maximo</option>
              <option value="out_of_stock">Sin Stock</option>
            </select>
            <input type="number" value={newAlert.threshold} onChange={e => setNewAlert({ ...newAlert, threshold: Number(e.target.value) })}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
              placeholder="Umbral" />
          </div>
          <button onClick={handleCreate}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Crear Alerta
          </button>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Todo en orden - sin alertas activas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => {
            const config = alertTypeConfig[alert.alert_type] || alertTypeConfig.min_stock;
            const isTriggered = (alert.alert_type === 'min_stock' && alert.current_stock <= alert.threshold) ||
              (alert.alert_type === 'out_of_stock' && alert.current_stock === 0) ||
              (alert.alert_type === 'max_stock' && alert.current_stock >= alert.threshold);

            return (
              <div key={alert.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${isTriggered ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                    <config.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{alert.product_name}</p>
                    <p className="text-[9px] text-slate-500">{alert.sku} | {alert.warehouse_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{alert.current_stock}</p>
                    <p className="text-[9px] text-slate-500">{config.label}: {alert.threshold}</p>
                  </div>
                  <button onClick={() => handleToggle(alert.id, alert.is_active)}
                    className={`p-1.5 rounded-lg transition-colors ${alert.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {alert.is_active ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(alert.id)}
                    className="p-1.5 bg-slate-100 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

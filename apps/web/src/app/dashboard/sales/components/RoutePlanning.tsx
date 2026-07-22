'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Truck, Clock, CheckCircle, Circle, X, Save, GripVertical } from 'lucide-react';

interface RouteStop {
  customer_name: string;
  address: string;
  city: string;
  order_number: string;
  estimated_time: string;
  status: 'pending' | 'completed' | 'skipped';
  notes: string;
}

interface Route {
  id: string;
  name: string;
  employee_name: string;
  route_date: string;
  stops: RouteStop[];
  status: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50', icon: Circle },
  in_progress: { label: 'En Curso', color: 'text-blue-700', bg: 'bg-blue-50', icon: Truck },
  completed: { label: 'Completada', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle },
};

export default function RoutePlanning() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '', employee_id: '', route_date: new Date().toISOString().split('T')[0],
    stops: [{ customer_name: '', address: '', city: '', order_number: '', estimated_time: '', status: 'pending' as const, notes: '' }] as RouteStop[],
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const [routesRes, empRes] = await Promise.all([
        fetch(`/api/companies/${companyId}/route-planning`),
        fetch(`/api/companies/${companyId}/employees`).catch(() => ({ ok: false, json: () => ({ data: [] }) })),
      ]);
      if (routesRes.ok) {
        const json = await routesRes.json();
        setRoutes((json.data || []).map((r: any) => ({
          ...r,
          stops: typeof r.stops === 'string' ? JSON.parse(r.stops) : r.stops || [],
        })));
      }
      if (empRes.ok) {
        const json = await empRes.json();
        setEmployees(json.data || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    const companyId = localStorage.getItem('company_id');
    const res = await fetch(`/api/companies/${companyId}/route-planning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ name: '', employee_id: '', route_date: new Date().toISOString().split('T')[0], stops: [{ customer_name: '', address: '', city: '', order_number: '', estimated_time: '', status: 'pending', notes: '' }] });
      loadData();
    }
  };

  const addStop = () => {
    setForm({ ...form, stops: [...form.stops, { customer_name: '', address: '', city: '', order_number: '', estimated_time: '', status: 'pending', notes: '' }] });
  };

  const removeStop = (idx: number) => {
    setForm({ ...form, stops: form.stops.filter((_, i) => i !== idx) });
  };

  const updateStop = (idx: number, field: string, value: string) => {
    const newStops = [...form.stops];
    (newStops[idx] as any)[field] = value;
    setForm({ ...form, stops: newStops });
  };

  const route = routes.find(r => r.id === selectedRoute);

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Planificación de Rutas</span>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nueva Ruta
        </button>
      </div>

      {route && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{route.name}</h3>
              <p className="text-xs text-slate-500">{route.employee_name} — {new Date(route.route_date).toLocaleDateString('es-CL')}</p>
            </div>
            <button onClick={() => setSelectedRoute(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-3">
            {route.stops.map((stop, i) => {
              const stCfg = statusConfig[stop.status] || statusConfig.pending;
              const Icon = stCfg.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex flex-col items-center">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    {i < route.stops.length - 1 && <div className="w-px h-6 bg-slate-300 mt-1"></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-slate-900">{stop.customer_name}</p>
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-semibold ${stCfg.bg} ${stCfg.color}`}>
                        <Icon className="w-2.5 h-2.5" /> {stCfg.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">{stop.address}, {stop.city}</p>
                    {stop.order_number && <p className="text-[10px] text-slate-500">OV: {stop.order_number}</p>}
                    {stop.estimated_time && <p className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {stop.estimated_time}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {routes.map(r => {
          const cfg = statusConfig[r.status] || statusConfig.pending;
          const completedStops = r.stops.filter(s => s.status === 'completed').length;
          return (
            <div key={r.id} className={`bg-white border rounded-xl p-4 cursor-pointer transition-colors hover:bg-slate-50 ${selectedRoute === r.id ? 'border-slate-900' : 'border-slate-200'}`}
              onClick={() => setSelectedRoute(r.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs font-medium text-slate-900">{r.name}</p>
                    <p className="text-[9px] text-slate-500">{r.employee_name} — {new Date(r.route_date).toLocaleDateString('es-CL')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-600">{completedStops}/{r.stops.length} paradas</p>
                    <div className="w-20 h-1.5 bg-slate-200 rounded-full mt-1">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${r.stops.length > 0 ? (completedStops / r.stops.length) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                </div>
              </div>
            </div>
          );
        })}
        {routes.length === 0 && (
          <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Sin rutas planificadas</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Nueva Ruta</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nombre</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Ruta Centro" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Vendedor</label>
                  <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Seleccionar...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Fecha</label>
                <input type="date" value={form.route_date} onChange={e => setForm({ ...form, route_date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-700">Paradas</label>
                  <button onClick={addStop} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Agregar</button>
                </div>
                <div className="space-y-3">
                  {form.stops.map((stop, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500">#{i + 1}</span>
                        {form.stops.length > 1 && <button onClick={() => removeStop(i)} className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={stop.customer_name} onChange={e => updateStop(i, 'customer_name', e.target.value)}
                          className="bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Cliente" />
                        <input type="text" value={stop.address} onChange={e => updateStop(i, 'address', e.target.value)}
                          className="bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Dirección" />
                        <input type="text" value={stop.city} onChange={e => updateStop(i, 'city', e.target.value)}
                          className="bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Ciudad" />
                        <input type="text" value={stop.order_number} onChange={e => updateStop(i, 'order_number', e.target.value)}
                          className="bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="OV #" />
                        <input type="text" value={stop.estimated_time} onChange={e => updateStop(i, 'estimated_time', e.target.value)}
                          className="bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="09:00 - 09:30" />
                        <input type="text" value={stop.notes} onChange={e => updateStop(i, 'notes', e.target.value)}
                          className="bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Notas" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={!form.name || !form.employee_id}
                className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

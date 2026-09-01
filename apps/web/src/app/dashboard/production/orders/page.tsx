'use client';

import { useState, useEffect } from 'react';
import { FlaskConical, Plus, CheckCircle2, Clock, ShieldCheck, DollarSign, Download, Package, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductionOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/production/orders');
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data);
      }
    } catch (e) {
      console.error('Error fetching production orders', e);
    } finally {
      setLoading(false);
    }
  }

  const clp = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Órdenes de Producción & Lotes BOM (Manufactura)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1">
              <FlaskConical className="w-3.5 h-3.5" /> Producción Activa
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Transformación de materias primas en producto terminado, control de mermas y costo unitario real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info('Nueva orden de producción iniciada')}
            className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Órden de Producción
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-600" /> Órdenes de Trabajo & Rendimiento de Lote
          </h3>
          <span className="text-xs font-bold text-slate-500">{orders.length} órdenes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">N° Órden</th>
                <th className="px-6 py-3">Producto a Fabricar / Receta</th>
                <th className="px-6 py-3">Objetivo vs Producido</th>
                <th className="px-6 py-3">Mermas</th>
                <th className="px-6 py-3">Costo Unit. CLP</th>
                <th className="px-6 py-3">Costo Total Lote</th>
                <th className="px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{o.order_number}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{o.product_name}</div>
                    <div className="text-[11px] text-slate-500">{o.bom_name}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {o.produced_quantity} / {o.target_quantity} u
                  </td>
                  <td className="px-6 py-4 font-mono text-rose-600 font-bold">{o.waste_quantity} u</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{clp(o.cost_per_unit_clp)}</td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-700">{clp(o.total_cost_clp)}</td>
                  <td className="px-6 py-4">
                    {o.status === 'completada' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3 h-3" /> Completada
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-max">
                        <Clock className="w-3 h-3" /> En Proceso
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

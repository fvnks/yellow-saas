'use client';

import { useState, useEffect } from 'react';
import { Truck, FileText, CheckCircle2, Clock, Download, Search, ShieldCheck, DollarSign, Filter } from 'lucide-react';

export default function SupplierPortalPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/suppliers/portal');
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data.purchaseOrders || []);
      }
    } catch (e) {
      console.error('Error fetching supplier data', e);
    } finally {
      setLoading(false);
    }
  }

  const clp = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  const filteredOrders = orders.filter((o) => filter === 'all' || o.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Portal de Autogestión de Proveedores
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
              Autogestión Proveedores
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Revisión de Órdenes de Compra (OC), estado de facturas recibidas y certificado de retención F29/F50.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar Certificados F29
          </button>
        </div>
      </div>

      {/* Orders List Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-slate-600" /> Órdenes de Compra & Estado de Pago
          </h3>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600">Filtrar Estado:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
            >
              <option value="all">Todas las Órdenes</option>
              <option value="aprobada">Aprobadas</option>
              <option value="en_proceso">En Proceso</option>
              <option value="pagada">Pagadas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">N° Orden Compra</th>
                <th className="px-6 py-3">Proveedor / RUT</th>
                <th className="px-6 py-3">Monto Total CLP</th>
                <th className="px-6 py-3">Fecha Emisión</th>
                <th className="px-6 py-3">Estado OC</th>
                <th className="px-6 py-3">Certificado DTE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{o.order_number}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{o.supplier_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{o.supplier_rut}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{clp(Number(o.total_amount_clp))}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{o.issue_date}</td>
                    <td className="px-6 py-4 capitalize font-semibold">
                      {o.status === 'pagada' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Pagada
                        </span>
                      ) : o.status === 'aprobada' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                          Aprobada
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                          En Proceso
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => alert(`Descargando comprobante para ${o.order_number}`)}
                        className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> PDF Recepción
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400 font-medium">
                    No hay órdenes de compra registradas con el filtro seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

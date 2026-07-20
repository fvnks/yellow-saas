'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Package, Truck, Warehouse } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-700',
  in_stock: 'bg-blue-100 text-blue-700',
  sold: 'bg-amber-100 text-amber-700',
  returned: 'bg-red-100 text-red-700',
};

export default function ConsignmentPage() {
  const [agreements, setAgreements] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'agreements' | 'stock'>('agreements');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const [agRes, stRes] = await Promise.all([
        api.getConsignmentAgreements({ limit: '100' }).catch(() => ({ data: [] })),
        api.getConsignmentStock({ limit: '100' }).catch(() => ({ data: [] })),
      ]);
      setAgreements(agRes.data || []);
      setStock(stRes.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/bodega" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">Consignacion / VMI</h1>
          <p className="text-sm text-slate-500 mt-1">Gestion de stock consignado y acuerdos con proveedores</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-1 flex items-center gap-1">
        <button onClick={() => setTab('agreements')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'agreements' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
          Acuerdos ({agreements.length})
        </button>
        <button onClick={() => setTab('stock')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'stock' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
          Stock Consignado ({stock.length})
        </button>
      </div>

      {tab === 'agreements' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Numero</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Inicio</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fin</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Comision</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">Cargando...</td></tr>
                ) : agreements.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center">
                    <Truck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No hay acuerdos de consignacion</p>
                  </td></tr>
                ) : agreements.map(a => (
                  <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-slate-900">{a.agreement_number}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{a.supplier_name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{a.warehouse_name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{a.start_date ? new Date(a.start_date).toLocaleDateString('es-CL') : '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{a.end_date ? new Date(a.end_date).toLocaleDateString('es-CL') : '—'}</td>
                    <td className="px-4 py-3 text-xs text-center text-slate-700">{a.commission_percent || 0}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${statusColors[a.status] || 'bg-slate-100 text-slate-700'}`}>
                        {a.status || 'active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'stock' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cantidad</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Costo Unit.</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Recibido</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">Cargando...</td></tr>
                ) : stock.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center">
                    <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No hay stock consignado</p>
                  </td></tr>
                ) : stock.map(s => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-slate-900">{s.product_name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{s.supplier_name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{s.warehouse_name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-right font-medium text-slate-900">{s.quantity}</td>
                    <td className="px-4 py-3 text-xs text-right text-slate-700">${Number(s.unit_cost || 0).toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${statusColors[s.status] || 'bg-slate-100 text-slate-700'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">{s.received_at ? new Date(s.received_at).toLocaleDateString('es-CL') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

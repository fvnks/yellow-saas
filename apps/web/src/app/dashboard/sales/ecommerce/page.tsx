'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, RefreshCw, Plus, CheckCircle2, FileText, Globe, Store, ShieldCheck, ArrowUpRight, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function EcommerceSyncPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [platform, setPlatform] = useState('shopify');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/ecommerce/sync');
      const json = await res.json();
      if (json.success && json.data) {
        setConnections(json.data.connections || []);
        setOrders(json.data.orders || []);
      }
    } catch (e) {
      console.error('Error fetching ecommerce data', e);
    } finally {
      setLoading(false);
    }
  }

  const handleSyncOrders = async (connectionId?: string) => {
    try {
      setSyncing(true);
      const res = await fetch('/api/ecommerce/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_orders', connection_id: connectionId })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        fetchData();
      } else {
        toast.error(json.error || 'Error al sincronizar');
      }
    } catch (e) {
      toast.error('Error en la conexión');
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/ecommerce/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect_store',
          platform,
          store_name: storeName,
          store_url: storeUrl
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Tienda conectada exitosamente');
        setShowConnectModal(false);
        setStoreName('');
        setStoreUrl('');
        fetchData();
      } else {
        toast.error(json.error || 'Error al conectar');
      }
    } catch (e) {
      toast.error('Error al conectar tienda');
    }
  };

  const clp = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Integración Ecommerce & Emisión Automática DTE SII
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-600" /> Auto-DTE Activo
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Conecta tus tiendas online (Shopify, WooCommerce, MercadoLibre) para sincronizar stock y emitir Boletas y Facturas Electrónicas automáticas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSyncOrders()}
            disabled={syncing}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            Sincronizar Ventas Ahora
          </button>
          <button
            onClick={() => setShowConnectModal(true)}
            className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Conectar Tienda
          </button>
        </div>
      </div>

      {/* Connected Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {connections.length > 0 ? (
          connections.map((conn) => (
            <div key={conn.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                    {conn.platform}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{conn.store_name}</h3>
                <p className="text-xs text-slate-500 font-medium truncate">{conn.store_url || 'https://mitienda.cl'}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Auto-DTE SII: <strong className="text-slate-900">Activo</strong></span>
                <button
                  onClick={() => handleSyncOrders(conn.id)}
                  disabled={syncing}
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Sincronizar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-2">
            <Store className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No hay tiendas conectadas aún</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Conecta tu tienda Shopify, WooCommerce o MercadoLibre para sincronizar ventas y emitir DTEs en tiempo real.
            </p>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" /> Ventas Ecommerce & DTE Emitidos
          </h3>
          <span className="text-xs font-bold text-slate-500">{orders.length} pedidos sincronizados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">ID Pedido Ext.</th>
                <th className="px-6 py-3">Cliente / RUT</th>
                <th className="px-6 py-3">Monto Total</th>
                <th className="px-6 py-3">Tipo DTE</th>
                <th className="px-6 py-3">Folio DTE SII</th>
                <th className="px-6 py-3">Estado SII</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length > 0 ? (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{ord.external_order_id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{ord.customer_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{ord.customer_rut || 'Sin RUT'}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{clp(Number(ord.total_amount_clp))}</td>
                    <td className="px-6 py-4 capitalize font-semibold text-slate-700">{ord.dte_type?.replace('_', ' ')}</td>
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">N° {ord.dte_number}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                        <ShieldCheck className="w-3 h-3" /> {ord.dte_sii_status || 'Aceptado SII'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400 font-medium">
                    Haz clic en &quot;Sincronizar Ventas Ahora&quot; para importar pedidos ecommerce.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Connect Store Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Conectar Nueva Tienda Ecommerce</h3>
            <form onSubmit={handleConnectStore} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plataforma Ecommerce</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="shopify">Shopify</option>
                  <option value="woocommerce">WooCommerce</option>
                  <option value="mercadolibre">MercadoLibre Chile</option>
                  <option value="jumpseller">Jumpseller</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la Tienda</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Tienda Oficial Santiago"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL de la Tienda</label>
                <input
                  type="url"
                  required
                  placeholder="https://mitienda.cl"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-semibold rounded-xl text-xs shadow-xs"
                >
                  Guardar y Conectar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { INITIAL_MENU_ITEMS, INITIAL_TABLES, MenuItem } from '../lib/restaurant-store';
import { QrCode, ShoppingBag, Sparkles, AlertCircle, Check, Users, ArrowRight, Utensils } from 'lucide-react';
import { toast } from 'sonner';
import { useRestaurantRole } from '../lib/role-context';
import RoleProtected from '../components/role-protected';

export default function KioskPage() {
  const [menu] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [tables] = useState(INITIAL_TABLES);
  const { canAccess } = useRestaurantRole();
  const [selectedTableId, setSelectedTableId] = useState<number>(1);
  const [pinInput, setPinInput] = useState('');
  const [sessionJoined, setSessionJoined] = useState(false);
  const [cart, setCart] = useState<{ item: MenuItem; qty: number }[]>([]);

  const formatCLP = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  const selectedTable = tables.find(t => t.tableId === selectedTableId);

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    if (pinInput === selectedTable.pinCode) {
      setSessionJoined(true);
      toast.success(`Te has unido a la sesión de ${selectedTable.tableName}`);
    } else {
      toast.error('Código PIN incorrecto para esta mesa');
    }
  };

  const addToCart = (item: MenuItem) => {
    if (!item.inStock) {
      toast.error(`"${item.name}" se encuentra agotado.`);
      return;
    }
    setCart(prev => {
      const idx = prev.findIndex(c => c.item.id === item.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].qty += 1;
        return copy;
      }
      return [...prev, { item, qty: 1 }];
    });
    toast.success(`Agregado: ${item.name}`);
  };

  const handleSendOrder = () => {
    if (cart.length === 0) return;
    toast.success(`¡Pedido enviado a cocina y barra para ${selectedTable?.tableName}!`);
    setCart([]);
  };

  const cartTotal = cart.reduce((acc, curr) => acc + curr.item.priceCLP * curr.qty, 0);

  if (!canAccess('kiosk')) return <RoleProtected section="kiosk"><div /></RoleProtected>;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] to-slate-800 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 mb-2">
            <QrCode className="w-3.5 h-3.5" /> Kiosco & Menú QR
          </span>
          <h1 className="text-2xl font-bold">Autoservicio & Pedido en Mesa</h1>
          <p className="text-xs text-slate-300 mt-1">
            Escanea el código QR, ingresa con el PIN de mesa y realiza tu pedido directamente.
          </p>
        </div>

        {/* PIN Entry Session Status */}
        {!sessionJoined ? (
          <form onSubmit={handleJoinSession} className="bg-white/10 p-3.5 rounded-xl border border-white/20 flex flex-col gap-2 min-w-[260px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Unirse a Mesa:</span>
              <select
                value={selectedTableId}
                onChange={e => setSelectedTableId(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 text-xs"
              >
                {tables.map(t => (
                  <option key={t.tableId} value={t.tableId}>
                    {t.tableName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="PIN mesa (ej. 7492)"
                className="w-full bg-slate-900 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-lg placeholder:text-slate-500 font-mono"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-all shrink-0"
              >
                Unirse
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-emerald-500/20 border border-emerald-400/40 p-3 rounded-xl text-xs space-y-1">
            <p className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Sesión Activa: {selectedTable?.tableName}
            </p>
            <p className="text-slate-300 text-[11px]">PIN: {selectedTable?.pinCode} • Pedidos sincronizados</p>
          </div>
        )}
      </div>

      {/* Main Content Layout: Menu + Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Menu & Suggestions (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Smart Suggestion Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-amber-900">Sugerencia Inteligente del Chef</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Pide un <strong>Lomo a lo Pobre Tradicional</strong> y acompáñalo con nuestro <strong>Pisco Sour Catedrático</strong> para el maridaje perfecto.
              </p>
            </div>
          </div>

          {/* Menu Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menu.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-2">
                <Utensils className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No hay productos en la carta</p>
                <p className="text-xs text-slate-500">Agrega productos desde la Consola Admin del Restaurante.</p>
              </div>
            ) : (
              menu.map(item => (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl p-4 shadow-sm transition-all flex flex-col justify-between ${
                  item.inStock ? 'border-slate-200/80 hover:border-slate-300' : 'border-slate-200 bg-slate-50/70'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-3xl">{item.image}</span>
                    <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      {formatCLP(item.priceCLP)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">{item.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                  {item.suggestion && (
                    <p className="text-[11px] font-semibold text-slate-600 bg-slate-100 p-2 rounded-xl mt-3 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{item.suggestion}</span>
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {item.inStock ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Disponible
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Agotado en Cocina
                    </span>
                  )}

                  <button
                    disabled={!item.inStock}
                    onClick={() => addToCart(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      item.inStock
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            ))
            )}
          </div>
        </div>

        {/* Right: Cart Summary (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden sticky top-20">
            <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-900 text-white">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                Mi Comanda QR
              </h3>
              <span className="text-xs text-slate-400 font-medium">{selectedTable?.tableName}</span>
            </div>

            <div className="p-4 space-y-3 min-h-[220px] max-h-[360px] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-2">
                  <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">Aún no has agregado productos.</p>
                </div>
              ) : (
                cart.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{entry.item.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {entry.qty} x {formatCLP(entry.item.priceCLP)}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">{formatCLP(entry.item.priceCLP * entry.qty)}</span>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-200/80 bg-slate-50/80 space-y-3">
                <div className="flex justify-between text-sm font-bold text-slate-900">
                  <span>Total Pedido CLP</span>
                  <span className="text-amber-600">{formatCLP(cartTotal)}</span>
                </div>

                <button
                  onClick={handleSendOrder}
                  className="w-full bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  Confirmar & Enviar a Cocina <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

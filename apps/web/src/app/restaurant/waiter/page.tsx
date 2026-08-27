'use client';

import { useState } from 'react';
import { INITIAL_TABLES, INITIAL_ORDERS, INITIAL_MENU_ITEMS, TableSession, Order, OrderItem } from '../lib/restaurant-store';
import { Utensils, Plus, CheckCircle, Receipt, DollarSign, Clock, UserCheck, ShieldCheck, QrCode, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function WaiterPOSPage() {
  const [tables, setTables] = useState<TableSession[]>(INITIAL_TABLES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [menu] = useState(INITIAL_MENU_ITEMS);
  const [selectedTable, setSelectedTable] = useState<TableSession | null>(INITIAL_TABLES[0]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'food' | 'drink'>('all');

  const formatCLP = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  const activeOrder = orders.find(o => o.tableId === selectedTable?.tableId && o.status === 'active');

  const handleAddItemToOrder = (menuItemId: string) => {
    if (!selectedTable) return;
    const menuItem = menu.find(m => m.id === menuItemId);
    if (!menuItem) return;
    if (!menuItem.inStock) {
      toast.error(`"${menuItem.name}" está agotado en inventario.`);
      return;
    }

    let existingOrder = orders.find(o => o.tableId === selectedTable.tableId && o.status === 'active');

    if (!existingOrder) {
      const newOrder: Order = {
        id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
        tableId: selectedTable.tableId,
        tableName: selectedTable.tableName,
        pinCode: selectedTable.pinCode,
        totalCLP: menuItem.priceCLP,
        createdAt: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        status: 'active',
        waiterName: 'Garzón Turno',
        items: [
          {
            id: `item-${Date.now()}`,
            menuItemId: menuItem.id,
            name: menuItem.name,
            priceCLP: menuItem.priceCLP,
            quantity: 1,
            station: menuItem.station,
            status: 'pending',
          },
        ],
      };
      setOrders(prev => [...prev, newOrder]);
      setTables(prev =>
        prev.map(t => (t.tableId === selectedTable.tableId ? { ...t, status: 'occupied' } : t))
      );
      toast.success(`Comanda iniciada para ${selectedTable.tableName}`);
    } else {
      const existingItemIndex = existingOrder.items.findIndex(i => i.menuItemId === menuItemId);
      let updatedItems: OrderItem[] = [...existingOrder.items];

      if (existingItemIndex > -1) {
        updatedItems[existingItemIndex].quantity += 1;
      } else {
        updatedItems.push({
          id: `item-${Date.now()}`,
          menuItemId: menuItem.id,
          name: menuItem.name,
          priceCLP: menuItem.priceCLP,
          quantity: 1,
          station: menuItem.station,
          status: 'pending',
        });
      }

      const newTotal = updatedItems.reduce((acc, item) => acc + item.priceCLP * item.quantity, 0);

      setOrders(prev =>
        prev.map(o => (o.id === existingOrder!.id ? { ...o, items: updatedItems, totalCLP: newTotal } : o))
      );
      toast.success(`Agregado "${menuItem.name}" a ${selectedTable.tableName}`);
    }
  };

  const handleEmitBoleta = () => {
    if (!activeOrder) return;
    setOrders(prev =>
      prev.map(o => (o.id === activeOrder.id ? { ...o, dteStatus: 'boleta_emitida' } : o))
    );
    toast.success(`Boleta Electrónica SII emitida con éxito. Total: ${formatCLP(activeOrder.totalCLP)}`);
  };

  const handleCloseSession = () => {
    if (!selectedTable || !activeOrder) return;
    setOrders(prev => prev.map(o => (o.id === activeOrder.id ? { ...o, status: 'closed' } : o)));
    setTables(prev =>
      prev.map(t => (t.tableId === selectedTable.tableId ? { ...t, status: 'free' } : t))
    );
    toast.success(`Mesa ${selectedTable.tableName} liberada y pagada correctamente.`);
  };

  const getStatusBadge = (status: TableSession['status']) => {
    switch (status) {
      case 'free':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">Libre</span>;
      case 'occupied':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">Ocupada</span>;
      case 'reserved':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">Reservada</span>;
      case 'bill_requested':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">Cuenta Pedida</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-500" />
            POS Garzón & Mapa de Mesas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión en tiempo real de comandas, mesas activas y facturación boleta SII para garzones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info('Actualizado estado de salón')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refrescar Salón
          </button>
        </div>
      </div>

      {/* Main Grid: Left Mapa Mesas + Center Comanda + Right Carta */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mapa de Mesas (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Mapa de Mesas</span>
              <span className="text-xs text-slate-500 font-normal">{tables.filter(t => t.status === 'occupied').length} Ocupadas</span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {tables.length === 0 ? (
                <div className="col-span-2 text-center py-8 space-y-2">
                  <p className="text-xs font-bold text-slate-700">No hay mesas registradas</p>
                  <p className="text-[11px] text-slate-500">Crea mesas desde Consola Admin</p>
                </div>
              ) : (
                tables.map(table => {
                const isSelected = selectedTable?.tableId === table.tableId;
                return (
                  <button
                    key={table.tableId}
                    onClick={() => setSelectedTable(table)}
                    className={`p-3.5 rounded-2xl text-left border transition-all text-xs flex flex-col justify-between h-24 ${
                      isSelected
                        ? 'border-[#FACC15] bg-amber-500/10 ring-2 ring-[#FACC15]'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-slate-900">{table.tableName}</span>
                      {getStatusBadge(table.status)}
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px] mt-auto">
                      <span>Cap: {table.capacity} p.</span>
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">PIN: {table.pinCode}</span>
                    </div>
                  </button>
                );
              })
              )}
            </div>
          </div>
        </div>

        {/* Center Column: Comanda de la Mesa Seleccionada (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <span>{selectedTable?.tableName || 'Seleccione Mesa'}</span>
                  {selectedTable && getStatusBadge(selectedTable.status)}
                </h3>
                <p className="text-[11px] text-slate-400">PIN Kiosco: {selectedTable?.pinCode}</p>
              </div>
              {activeOrder && (
                <span className="text-xs font-mono font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg">
                  {activeOrder.id}
                </span>
              )}
            </div>

            <div className="p-4 space-y-3 min-h-[300px] max-h-[420px] overflow-y-auto">
              {!activeOrder || activeOrder.items.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Utensils className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">Mesa libre sin comanda activa.</p>
                  <p className="text-[11px] text-slate-400">Seleccione ítems del menú a la derecha para iniciar pedido.</p>
                </div>
              ) : (
                activeOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>Cant: {item.quantity}</span>
                        <span>•</span>
                        <span>{formatCLP(item.priceCLP * item.quantity)}</span>
                        <span>•</span>
                        <span className={`capitalize font-semibold ${
                          item.status === 'ready' ? 'text-emerald-600' : item.status === 'preparing' ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          {item.status === 'ready' ? 'Listo ✓' : item.status === 'preparing' ? 'En Cocina' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {item.station}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Order Totals & Actions Footer */}
            {activeOrder && (
              <div className="p-4 border-t border-slate-200/80 bg-slate-50/80 space-y-3">
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal Neto</span>
                    <span>{formatCLP(activeOrder.totalCLP * 0.81)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (19%)</span>
                    <span>{formatCLP(activeOrder.totalCLP * 0.19)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Propina Sugerida (10%)</span>
                    <span className="text-emerald-600 font-semibold">{formatCLP(activeOrder.totalCLP * 0.10)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Comanda</span>
                    <span className="text-amber-600">{formatCLP(activeOrder.totalCLP)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleEmitBoleta}
                    className="bg-[#0F172A] hover:bg-slate-800 text-white font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Receipt className="w-3.5 h-3.5 text-amber-400" /> Boleta SII
                  </button>
                  <button
                    onClick={handleCloseSession}
                    className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Pagar & Liberar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Menú del Restaurante (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Carta & Platos</h2>
              <div className="flex gap-1">
                {(['all', 'food', 'drink'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'Todos' : cat === 'food' ? 'Platos' : 'Bebidas'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {menu
                .filter(m => selectedCategory === 'all' || m.category === selectedCategory)
                .map(item => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                      item.inStock
                        ? 'border-slate-200/80 bg-white hover:border-slate-300'
                        : 'border-slate-200 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.image}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] font-semibold text-amber-600">{formatCLP(item.priceCLP)}</p>
                      </div>
                    </div>
                    {item.inStock ? (
                      <button
                        onClick={() => handleAddItemToOrder(item.id)}
                        className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold p-2 rounded-xl transition-all active:scale-95 shadow-xs"
                        title="Agregar a comanda"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                        Agotado
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

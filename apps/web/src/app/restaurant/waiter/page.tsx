'use client';

import { useState } from 'react';
import { INITIAL_TABLES, INITIAL_ORDERS, INITIAL_MENU_ITEMS, TableSession, Order, OrderItem } from '../lib/restaurant-store';
import { Utensils, Plus, CheckCircle, Receipt, RefreshCw, X, ShieldCheck, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentCheckoutModal } from './components/payment-checkout-modal';
import { useRestaurantRole } from '../lib/role-context';
import RoleProtected from '../components/role-protected';

export default function WaiterPOSPage() {
  const [tables, setTables] = useState<TableSession[]>(INITIAL_TABLES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [menu] = useState(INITIAL_MENU_ITEMS);
  const [selectedTable, setSelectedTable] = useState<TableSession | null>(INITIAL_TABLES[0] || null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'food' | 'drink'>('all');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { canAccess } = useRestaurantRole();

  // Modal para crear nueva mesa
  const [isNewTableModalOpen, setIsNewTableModalOpen] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(4);

  const formatCLP = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Math.round(val || 0));

  const activeOrder = orders.find(o => o.tableId === selectedTable?.tableId && o.status === 'active');

  const handleCreateNewTable = () => {
    if (!newTableName.trim()) {
      toast.error('Ingresa un nombre para la mesa');
      return;
    }

    const nextId = tables.length > 0 ? Math.max(...tables.map(t => t.tableId)) + 1 : 1;
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const newTable: TableSession = {
      tableId: nextId,
      tableName: newTableName.trim(),
      capacity: newTableCapacity,
      status: 'free',
      pinCode: pin,
    };

    setTables(prev => [...prev, newTable]);
    setSelectedTable(newTable);
    setNewTableName('');
    setNewTableCapacity(4);
    setIsNewTableModalOpen(false);
    toast.success(`Mesa "${newTable.tableName}" creada con éxito (PIN: ${pin})`);
  };

  const handleStartOrderForTable = () => {
    if (!selectedTable) return;
    let existingOrder = orders.find(o => o.tableId === selectedTable.tableId && o.status === 'active');
    if (existingOrder) {
      toast.info(`La ${selectedTable.tableName} ya posee una comanda activa.`);
      return;
    }

    const newOrder: Order = {
      id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
      tableId: selectedTable.tableId,
      tableName: selectedTable.tableName,
      pinCode: selectedTable.pinCode,
      totalCLP: 0,
      createdAt: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      status: 'active',
      waiterName: 'Garzón Turno',
      items: [],
    };

    setOrders(prev => [...prev, newOrder]);
    setTables(prev =>
      prev.map(t => (t.tableId === selectedTable.tableId ? { ...t, status: 'occupied' } : t))
    );
    setSelectedTable(prev => (prev ? { ...prev, status: 'occupied' } : null));
    toast.success(`Comanda ${newOrder.id} iniciada para ${selectedTable.tableName}`);
  };

  const handleAddItemToOrder = (menuItemId: string) => {
    if (!selectedTable) {
      toast.error('Selecciona una mesa primero.');
      return;
    }
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
      setSelectedTable(prev => (prev ? { ...prev, status: 'occupied' } : null));
      toast.success(`Comanda iniciada con "${menuItem.name}" para ${selectedTable.tableName}`);
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

  const handleDecreaseItemQuantity = (itemId: string) => {
    if (!activeOrder) return;
    const itemIndex = activeOrder.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;

    let updatedItems = [...activeOrder.items];
    if (updatedItems[itemIndex].quantity > 1) {
      updatedItems[itemIndex].quantity -= 1;
    } else {
      updatedItems.splice(itemIndex, 1);
    }

    const newTotal = updatedItems.reduce((acc, item) => acc + item.priceCLP * item.quantity, 0);

    setOrders(prev =>
      prev.map(o => (o.id === activeOrder.id ? { ...o, items: updatedItems, totalCLP: newTotal } : o))
    );
  };

  const handleEmitBoleta = () => {
    if (!activeOrder) {
      toast.error('No hay una comanda activa con productos en esta mesa para cobrar.');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleCloseSession = () => {
    if (!selectedTable || !activeOrder) {
      toast.error('Selecciona una mesa con comanda activa.');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handlePaymentCompleted = (paidData: { folioDTE: number; paymentMethod: string; totalPaidCLP: number; tipCLP: number }) => {
    if (!selectedTable || !activeOrder) return;
    setOrders(prev => prev.map(o => (o.id === activeOrder.id ? { ...o, status: 'closed', dteStatus: 'boleta_emitida' } : o)));
    setTables(prev =>
      prev.map(t => (t.tableId === selectedTable.tableId ? { ...t, status: 'free' } : t))
    );
    setSelectedTable(prev => (prev ? { ...prev, status: 'free' } : null));
    setIsCheckoutOpen(false);
    toast.success(`Mesa ${selectedTable.tableName} cobrada y liberada con éxito.`);
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

  if (!canAccess('pos')) return <RoleProtected section="pos"><div /></RoleProtected>;

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
            onClick={() => setIsNewTableModalOpen(true)}
            className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Nueva Mesa
          </button>
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Mapa de Mesas</h2>
              <button
                onClick={() => setIsNewTableModalOpen(true)}
                className="text-[11px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-2 py-1 rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Crear
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {tables.length === 0 ? (
                <div className="col-span-2 text-center py-8 space-y-2">
                  <p className="text-xs font-bold text-slate-700">No hay mesas registradas</p>
                  <button
                    onClick={() => setIsNewTableModalOpen(true)}
                    className="bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl"
                  >
                    + Abrir primera mesa
                  </button>
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
                          ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500'
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
                <p className="text-[11px] text-slate-400">PIN Kiosco: {selectedTable?.pinCode || '----'}</p>
              </div>
              {activeOrder && (
                <span className="text-xs font-mono font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg">
                  {activeOrder.id}
                </span>
              )}
            </div>

            <div className="p-4 space-y-3 min-h-[300px] max-h-[420px] overflow-y-auto">
              {!selectedTable ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Utensils className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">Seleccione una mesa a la izquierda para comenzar.</p>
                </div>
              ) : !activeOrder || activeOrder.items.length === 0 ? (
                <div className="text-center py-10 text-slate-500 space-y-3">
                  <Utensils className="w-8 h-8 mx-auto text-amber-500/70" />
                  <p className="text-xs font-bold text-slate-800">Mesa libre o sin productos en comanda.</p>
                  <p className="text-[11px] text-slate-500">Selecciona platos o bebidas de la carta para agregar al pedido.</p>
                  <button
                    onClick={handleStartOrderForTable}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
                  >
                    + Abrir Comanda en {selectedTable.tableName}
                  </button>
                </div>
              ) : (
                activeOrder.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>Cant: <strong className="text-slate-900">{item.quantity}</strong></span>
                        <span>•</span>
                        <span className="font-semibold text-amber-600">{formatCLP(item.priceCLP * item.quantity)}</span>
                        <span>•</span>
                        <span className={`capitalize font-semibold ${
                          item.status === 'ready' ? 'text-emerald-600' : item.status === 'preparing' ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          {item.status === 'ready' ? 'Listo ✓' : item.status === 'preparing' ? 'En Cocina' : 'Pendiente'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDecreaseItemQuantity(item.id)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                        title="Disminuir / Quitar"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleAddItemToOrder(item.menuItemId)}
                        className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                        title="Aumentar"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Order Totals & Actions Footer */}
            {selectedTable && (
              <div className="p-4 border-t border-slate-200/80 bg-slate-50/80 space-y-3">
                {activeOrder && activeOrder.items.length > 0 && (
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal Neto</span>
                      <span>{formatCLP(Math.round(activeOrder.totalCLP / 1.19))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA (19%)</span>
                      <span>{formatCLP(activeOrder.totalCLP - Math.round(activeOrder.totalCLP / 1.19))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Propina Sugerida (10%)</span>
                      <span className="text-emerald-600 font-semibold">{formatCLP(Math.round(activeOrder.totalCLP * 0.10))}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                      <span>Total Comanda</span>
                      <span className="text-amber-600">{formatCLP(activeOrder.totalCLP)}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleEmitBoleta}
                    disabled={!activeOrder || activeOrder.items.length === 0}
                    className="bg-[#0F172A] hover:bg-slate-800 disabled:opacity-50 text-white font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <Receipt className="w-3.5 h-3.5 text-amber-400" /> Boleta SII
                  </button>
                  <button
                    onClick={handleCloseSession}
                    disabled={!activeOrder || activeOrder.items.length === 0}
                    className="bg-amber-500 hover:bg-[#EAB308] disabled:opacity-50 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Cobrar POS
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
                        ? 'bg-[#0F172A] text-white'
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
                        className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-bold p-2 rounded-xl transition-all active:scale-95 shadow-xs"
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

      {/* Modal Nueva Mesa */}
      {isNewTableModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#0F172A] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-400" />
                Crear Nueva Mesa en Salón
              </h3>
              <button
                onClick={() => setIsNewTableModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre / Identificador de Mesa</label>
                <input
                  type="text"
                  placeholder="Ej: Mesa 07, Terraza VIP, Bar 01..."
                  value={newTableName}
                  onChange={e => setNewTableName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Capacidad de Personas</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newTableCapacity}
                  onChange={e => setNewTableCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> PIN Kiosco Autogenerado
                </p>
                <p className="text-slate-600">Se asignará un código PIN único de 4 dígitos para autoservicio QR.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTableModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewTable}
                  className="px-4 py-2 bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-bold rounded-xl shadow-xs"
                >
                  Crear Mesa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cobro POS */}
      {activeOrder && (
        <PaymentCheckoutModal
          order={activeOrder}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onPaymentSuccess={handlePaymentCompleted}
        />
      )}
    </div>
  );
}
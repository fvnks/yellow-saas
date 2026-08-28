'use client';

import { useState } from 'react';
import { INITIAL_MENU_ITEMS, INITIAL_TABLES, MenuItem, TableSession } from '../lib/restaurant-store';
import { LayoutDashboard, Utensils, DollarSign, TrendingUp, Users, Plus, Check, X, Shield, Package, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useRestaurantRole } from '../lib/role-context';
import RoleProtected from '../components/role-protected';

export default function RestaurantAdminPage() {
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [tables, setTables] = useState<TableSession[]>(INITIAL_TABLES);
  const [activeTab, setActiveTab] = useState<'menu' | 'tables' | 'users' | 'reports'>('menu');
  const { canAccess } = useRestaurantRole();

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'food' as 'food' | 'drink' | 'dessert',
    priceCLP: 6500,
    description: '',
    station: 'kitchen' as 'kitchen' | 'bar',
    image: '🍽️',
  });

  const formatCLP = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  const toggleStock = (id: string) => {
    setMenu(prev =>
      prev.map(item => (item.id === id ? { ...item, inStock: !item.inStock } : item))
    );
    toast.success('Estado de stock actualizado.');
  };

  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.priceCLP) return;

    const created: MenuItem = {
      id: `m-${Date.now()}`,
      name: newItem.name,
      category: newItem.category,
      priceCLP: Number(newItem.priceCLP),
      description: newItem.description || 'Deliciosa preparación gastronómica de la casa.',
      station: newItem.station,
      inStock: true,
      image: newItem.image || '🍲',
    };

    setMenu(prev => [...prev, created]);
    toast.success(`Plato "${newItem.name}" agregado a la carta.`);
    setNewItem({
      name: '',
      category: 'food',
      priceCLP: 6500,
      description: '',
      station: 'kitchen',
      image: '🍽️',
    });
  };

  if (!canAccess('admin')) return <RoleProtected section="admin"><div /></RoleProtected>;

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-amber-500" />
            Consola Admin Restaurante & Analítica
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Administración de carta, precios CLP, disponibilidad de stock, salas y roles de personal.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Ventas del Día (CLP)</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{formatCLP(38500)}</p>
          </div>
          <span className="p-3 bg-amber-50 rounded-2xl text-amber-600 border border-amber-200">
            <DollarSign className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Ticket Promedio Mesa</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{formatCLP(19250)}</p>
          </div>
          <span className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-200">
            <TrendingUp className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Platos en Carta</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{menu.length} ítems</p>
          </div>
          <span className="p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-200">
            <Utensils className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Mesas Activas</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{tables.filter(t => t.status !== 'free').length} de {tables.length}</p>
          </div>
          <span className="p-3 bg-purple-50 rounded-2xl text-purple-600 border border-purple-200">
            <Users className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 text-xs font-bold gap-6">
        {(['menu', 'tables', 'users', 'reports'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize transition-all border-b-2 ${
              activeTab === tab
                ? 'border-amber-500 text-slate-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'menu' ? 'Carta & Stock' : tab === 'tables' ? 'Distribución Mesas' : tab === 'users' ? 'Usuarios & Roles' : 'Reportes Ventas'}
          </button>
        ))}
      </div>

      {/* Tab: Menu & Stock Management */}
      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Menu Items Table (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Gestión de Menú & Precios</h2>
            <div className="space-y-3">
              {menu.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.image}</span>
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {formatCLP(item.priceCLP)} • Estación: <span className="uppercase font-semibold">{item.station}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStock(item.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                      item.inStock
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {item.inStock ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    {item.inStock ? 'Disponible' : 'Agotado'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Item Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-500" /> Nuevo Producto en Carta
            </h2>
            <form onSubmit={handleAddMenuItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Plato / Trago</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Ej. Pastel de Choclo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio (CLP)</label>
                  <input
                    type="number"
                    required
                    value={newItem.priceCLP}
                    onChange={e => setNewItem({ ...newItem, priceCLP: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estación KDS</label>
                  <select
                    value={newItem.station}
                    onChange={e => setNewItem({ ...newItem, station: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="kitchen">Cocina (Comida)</option>
                    <option value="bar">Bar (Bebidas)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción corta</label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Ingredientes principales..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-xs mt-2"
              >
                Agregar a la Carta
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Users & Roles */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" /> Personal & Permisos del Restaurante
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="font-bold text-slate-900 text-sm">Rol Admin Restaurante</span>
              <p className="text-slate-500">Acceso total a la consola de administración, reportes, precios y configuración.</p>
              <span className="inline-block bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">Permiso Total</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="font-bold text-slate-900 text-sm">Rol Garzón (POS)</span>
              <p className="text-slate-500">Toma de comandas, vista de salón, emisión de boletas SII y cobranza.</p>
              <span className="inline-block bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">POS Mesas</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="font-bold text-slate-900 text-sm">Rol KDS Cocina & Bar</span>
              <p className="text-slate-500">Pantalla de comandas en vivo y cambio de estado de preparación.</p>
              <span className="inline-block bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">KDS Pantalla</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tables */}
      {activeTab === 'tables' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Configuración de Salón & PINs de Mesas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {tables.map(t => (
              <div key={t.tableId} className="p-4 rounded-xl border border-slate-200 bg-white flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">{t.tableName}</p>
                  <p className="text-slate-500 text-[11px]">Capacidad: {t.capacity} personas</p>
                </div>
                <span className="font-mono bg-slate-100 px-2 py-1 rounded font-bold text-slate-700">PIN {t.pinCode}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900">Resumen de Ventas Chileno (CLP)</h2>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between font-bold text-slate-900">
              <span>Total Ventas brutas (con IVA 19%)</span>
              <span className="text-amber-600">{formatCLP(38500)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Boletas Electrónicas Emitidas SII</span>
              <span>2 Boletas</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Propinas Garzón (10%)</span>
              <span>{formatCLP(3850)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

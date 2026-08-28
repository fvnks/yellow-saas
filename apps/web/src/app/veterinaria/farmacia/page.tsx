'use client';

import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Search,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Boxes,
  Stethoscope,
} from 'lucide-react';
import {
  INITIAL_PATIENTS,
  INITIAL_CLIENTS,
  INITIAL_PROFESSIONALS,
  INITIAL_PHARMACY_STOCK,
  INITIAL_PHARMACY_DISPENSES,
  PharmacyStockItem,
  PharmacyDispense,
} from '../lib/veterinary-store';

const formatCLP = (val: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Math.round(val));

const categoryLabels: Record<string, string> = {
  antibiotico: 'Antibiótico',
  antiinflamatorio: 'Antiinflamatorio',
  analgesico: 'Analgésico',
  antiparasitario: 'Antiparasitario',
  vacuna: 'Vacuna',
  suero: 'Suero/Electrolitos',
  anestesia: 'Anestesia',
  cardiovascular: 'Cardiovascular',
  dermatologico: 'Dermatológico',
  insumo: 'Insumo',
};

const categoryBadges: Record<string, string> = {
  antibiotico: 'bg-rose-50 text-rose-700 border-rose-200',
  antiinflamatorio: 'bg-amber-50 text-amber-700 border-amber-200',
  analgesico: 'bg-orange-50 text-orange-700 border-orange-200',
  antiparasitario: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  vacuna: 'bg-blue-50 text-blue-700 border-blue-200',
  suero: 'bg-sky-50 text-sky-700 border-sky-200',
  anestesia: 'bg-purple-50 text-purple-700 border-purple-200',
  insumo: 'bg-slate-100 text-slate-600 border-slate-200',
};

const statusBadges: Record<string, string> = {
  pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
  despachado: 'bg-blue-50 text-blue-700 border-blue-200',
  entregado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  anulado: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function VeterinaryPharmacyPage() {
  const [stock, setStock] = useState<PharmacyStockItem[]>(INITIAL_PHARMACY_STOCK);
  const [dispenses, setDispenses] = useState<PharmacyDispense[]>(INITIAL_PHARMACY_DISPENSES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [cart, setCart] = useState<{ itemId: string; quantity: number }[]>([]);

  const [formData, setFormData] = useState({
    patientId: INITIAL_PATIENTS[0]?.id || '',
    professionalId: INITIAL_PROFESSIONALS[0]?.id || '',
  });
  const [cartItemId, setCartItemId] = useState('');
  const [cartQty, setCartQty] = useState(1);

  const filtered = stock.filter((s) => {
    const ms = s.name.toLowerCase().includes(search.toLowerCase()) || s.sku.toLowerCase().includes(search.toLowerCase());
    const mc = categoryFilter === 'todos' || s.category === categoryFilter;
    return ms && mc;
  });

  const lowStock = stock.filter((s) => s.currentStock <= s.minStock);
  const expiringSoon = stock.filter(
    (s) => s.expirationDate && new Date(s.expirationDate).getTime() - Date.now() < 90 * 86400000
  );

  const cartItems = cart
    .map((c) => {
      const item = stock.find((s) => s.id === c.itemId);
      return item ? { item, quantity: c.quantity } : null;
    })
    .filter((x): x is { item: PharmacyStockItem; quantity: number } => x !== null);

  const cartTotal = cartItems.reduce((a, c) => a + c.quantity * c.item.priceCLP, 0);

  const handleAddToCart = () => {
    if (!cartItemId) return;
    const item = stock.find((s) => s.id === cartItemId);
    if (!item || cartQty <= 0 || cartQty > item.currentStock) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === cartItemId);
      if (existing) {
        return prev.map((c) => (c.itemId === cartItemId ? { ...c, quantity: c.quantity + cartQty } : c));
      }
      return [...prev, { itemId: cartItemId, quantity: cartQty }];
    });
    setCartItemId('');
    setCartQty(1);
  };

  const removeFromCart = (itemId: string) => setCart(cart.filter((c) => c.itemId !== itemId));

  const handleConfirmDispense = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    const patient = INITIAL_PATIENTS.find((p) => p.id === formData.patientId);
    const client = INITIAL_CLIENTS.find((c) => c.id === patient?.clientId);
    const pro = INITIAL_PROFESSIONALS.find((p) => p.id === formData.professionalId);
    if (!patient || !client || !pro) return;

    const today = new Date().toISOString().split('T')[0];
    const nextNum = `${dispenses.length + 1}`.padStart(3, '0');

    const newDispense: PharmacyDispense = {
      id: `disp-${Date.now()}`,
      dispenseNumber: `DESP-2025-${nextNum}`,
      patientId: patient.id,
      patientName: patient.name,
      clientId: client.id,
      clientName: client.fullName,
      clientRut: client.rut,
      professionalId: pro.id,
      professionalName: pro.fullName,
      dispenseDate: today,
      items: cartItems.map((c) => ({ itemId: c.item.id, name: c.item.name, quantity: c.quantity, priceCLP: c.item.priceCLP })),
      totalCLP: cartTotal,
      status: 'despachado',
    };

    setStock((prev) =>
      prev.map((s) => {
        const c = cart.find((x) => x.itemId === s.id);
        return c ? { ...s, currentStock: Math.max(0, s.currentStock - c.quantity) } : s;
      })
    );

    setDispenses([newDispense, ...dispenses]);
    setShowModal(false);
    setCart([]);
  };

  const selectedDetail = dispenses.find((d) => d.id === detailId);
  const selectedPatient = INITIAL_PATIENTS.find((p) => p.id === formData.patientId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Farmacia & Despacho Veterinario
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Control de stock por lote y vencimiento, control de receta médica y débito automático de bodega al despachar.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo Despacho
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center"><Boxes className="w-5 h-5" /></div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Ítems en Stock</div>
            <div className="text-xl font-black text-slate-900">{stock.reduce((a, s) => a + s.currentStock, 0)}</div>
            <div className="text-[10px] text-slate-400">{stock.length} SKUs</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Stock Bajo</div>
            <div className="text-xl font-black text-slate-900">{lowStock.length}</div>
            <div className="text-[10px] text-slate-400">Bajo mínimo</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Por Vencer 90 días</div>
            <div className="text-xl font-black text-slate-900">{expiringSoon.length}</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Despachos Registrados</div>
            <div className="text-xl font-black text-slate-900">{dispenses.length}</div>
          </div>
        </div>
      </div>
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar medicamento o insumo por nombre o SKU..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'antibiotico', label: 'Antibióticos' },
            { id: 'antiparasitario', label: 'Antiparasitarios' },
            { id: 'anestesia', label: 'Anestesia' },
            { id: 'suero', label: 'Suero' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                categoryFilter === c.id ? 'bg-[#0F172A] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            Inventario de Farmacia
          </h3>
          <span className="text-[11px] font-bold text-slate-500">{filtered.length} SKU(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Medicamento / SKU</th>
                <th className="px-6 py-3.5">Categoría</th>
                <th className="px-6 py-3.5 text-center">Receta</th>
                <th className="px-6 py-3.5">Lote / Vence</th>
                <th className="px-6 py-3.5 text-center">Stock</th>
                <th className="px-6 py-3.5 text-right">Precio</th>
                <th className="px-6 py-3.5">Ubicación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((s) => {
                const isLow = s.currentStock <= s.minStock;
                const expiring = new Date(s.expirationDate).getTime() - Date.now() < 90 * 86400000;
                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-bold text-slate-900 text-xs">{s.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{s.sku}</div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${categoryBadges[s.category]}`}>
                        {categoryLabels[s.category]}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {s.requiresPrescription ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                          <Stethoscope className="w-3 h-3" /> Recetado
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">OTC</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-xs font-mono font-bold text-slate-700">{s.batchNumber}</div>
                      <div className={`text-[10px] font-mono ${expiring ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                        {s.expirationDate}{expiring ? ' ⚠' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-sm font-black px-2 py-1 rounded-lg ${isLow ? 'text-rose-700' : 'text-slate-900'}`}>
                        {s.currentStock} <span className="text-[10px] font-semibold text-slate-400">{s.unit}</span>
                        {isLow && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-slate-800 text-xs">{formatCLP(s.priceCLP)}</td>
                    <td className="px-6 py-3 text-[11px] text-slate-500">{s.location}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Despachos Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-600" />
            Despachos & Entregas
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">N° Despacho</th>
                <th className="px-6 py-3.5">Paciente / Tutor</th>
                <th className="px-6 py-3.5">Ítems</th>
                <th className="px-6 py-3.5 text-right">Total</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {dispenses.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-xs text-slate-900">{d.dispenseNumber}</span>
                    <span className="text-[11px] text-slate-400 block">{d.dispenseDate}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-xs">{d.patientName}</div>
                    <div className="text-[11px] text-slate-500">{d.clientName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-semibold text-slate-700">{d.items[0]?.name}{d.items.length > 1 ? ` +${d.items.length - 1}` : ''}</div>
                    <div className="text-[11px] text-slate-400">{d.items.reduce((a, i) => a + i.quantity, 0)} und. · {d.professionalName}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-black text-slate-900 text-xs text-right">{formatCLP(d.totalCLP)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${statusBadges[d.status]}`}>
                      {d.status === 'pendiente' ? 'Pendiente' : d.status === 'despachado' ? 'Despachado' : d.status === 'entregado' ? 'Entregado' : 'Anulado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {d.status === 'despachado' && (
                        <button
                          onClick={() => setDispenses(dispenses.map((x) => (x.id === d.id ? { ...x, status: 'entregado' } : x)))}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Entregar
                        </button>
                      )}
                      <button
                        onClick={() => setDetailId(detailId === d.id ? null : d.id)}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200"
                      >
                        Detalle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Expansion */}
      {selectedDetail && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            Detalle Despacho {selectedDetail.dispenseNumber}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
            <div><strong className="text-slate-800">Paciente:</strong> {selectedDetail.patientName} ({selectedPatient?.breed || ''})</div>
            <div><strong className="text-slate-800">Tutor:</strong> {selectedDetail.clientName} ({selectedDetail.clientRut})</div>
            <div><strong className="text-slate-800">Profesional:</strong> {selectedDetail.professionalName}</div>
            <div><strong className="text-slate-800">Fecha:</strong> {selectedDetail.dispenseDate}</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-extrabold">
                <tr>
                  <th className="px-4 py-2">Medicamento</th>
                  <th className="px-4 py-2 text-center">Cant</th>
                  <th className="px-4 py-2 text-right">P. Unit</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedDetail.items.map((it, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 font-medium text-slate-700">{it.name}</td>
                    <td className="px-4 py-2 text-center">{it.quantity}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatCLP(it.priceCLP)}</td>
                    <td className="px-4 py-2 text-right font-mono font-bold">{formatCLP(it.quantity * it.priceCLP)}</td>
                  </tr>
                ))}
                <tr className="bg-emerald-50 border-t border-emerald-200 font-black text-emerald-800">
                  <td colSpan={3} className="px-4 py-2 text-right uppercase">Total</td>
                  <td className="px-4 py-2 text-right font-mono">{formatCLP(selectedDetail.totalCLP)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nuevo Despacho */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl p-6 space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-600" />
                  Nuevo Despacho de Farmacia
                </h3>
                <p className="text-xs text-slate-500">El sistema rebajará automáticamente el stock de bodega al confirmar.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleConfirmDispense} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Paciente *</label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    {INITIAL_PATIENTS.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} - {p.breed} ({p.species})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Profesional *</label>
                  <select
                    value={formData.professionalId}
                    onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    {INITIAL_PROFESSIONALS.map((p) => (
                      <option key={p.id} value={p.id}>{p.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={cartItemId}
                    onChange={(e) => setCartItemId(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="">-- Agregar medicamento al carrito --</option>
                    {stock.filter((s) => s.currentStock > 0).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Stock: {s.currentStock} · Lote: {s.batchNumber})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={cartQty}
                    onChange={(e) => setCartQty(Number(e.target.value) || 1)}
                    className="w-20 px-2 py-2 text-sm bg-white border border-slate-200 rounded-xl text-center font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>
                {cartItems.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-4">Carrito vacío. Seleccione medicamentos para despachar.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {cartItems.map((c) => (
                      <div key={c.item.id} className="py-2 flex items-center justify-between text-xs">
                        <div className="font-semibold text-slate-800">{c.item.name} <span className="text-slate-400">x{c.quantity}</span></div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-900">{formatCLP(c.quantity * c.item.priceCLP)}</span>
                          <button type="button" onClick={() => removeFromCart(c.item.id)} className="text-rose-500 hover:text-rose-700">
                            <AlertTriangle className="w-3.5 h-3.5 hidden" /> ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 flex items-center justify-between text-sm font-black text-slate-900">
                      <span>Total</span>
                      <span className="font-mono">{formatCLP(cartTotal)}</span>
                    </div>
                  </div>
                )}
              </div>

              {selectedPatient && (
                <p className="text-[11px] text-slate-500 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                  Despachando para <strong>{selectedPatient.name}</strong> ({selectedPatient.breed}). Se debitará el stock de bodega en tiempo real.
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cartItems.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar Despacho & Debitar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

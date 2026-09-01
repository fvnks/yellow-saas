'use client';

import { useState } from 'react';
import { Wallet, Check, AlertTriangle, Banknote, CreditCard, Smartphone, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import RoleProtected from '../components/role-protected';
import { INITIAL_CASH_CLOSURE, INITIAL_BOLETAS_DTE } from '../lib/restaurant-store';
import { useRestaurantRole } from '../lib/role-context';

export default function RestaurantCashierPage() {
  const { canAccess } = useRestaurantRole();

  const [closure] = useState(INITIAL_CASH_CLOSURE);
  const [declaredEfectivo, setDeclaredEfectivo] = useState<string>(String(closure.declaredCashCLP));
  const [done, setDone] = useState(false);

  const formatCLP = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  if (!canAccess('cashier')) {
    return <RoleProtected section="cashier"><div /></RoleProtected>;
  }

  const declared = Number(declaredEfectivo) || 0;
  const expectedEfectivo = (closure.payments.find((p) => p.method === 'Efectivo')?.amountCLP || 0);
  const discrepancy = declared - expectedEfectivo;
  const boletas = INITIAL_BOLETAS_DTE;
  const totalBoletas = boletas.reduce((s, b) => s + b.totalCLP, 0);

  const handleClose = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Cierre de caja registrado. Diferencia ${discrepancy === 0 ? 'exacta' : formatCLP(Math.abs(discrepancy))}.`);
    setDone(true);
  };

  const methodIcons: Record<string, React.ReactNode> = {
    Efectivo: <Banknote className="w-4 h-4 text-emerald-500" />,
    'Transbank DB': <CreditCard className="w-4 h-4 text-blue-500" />,
    'Transbank CR': <CreditCard className="w-4 h-4 text-purple-500" />,
    'MercadoPago QR': <Smartphone className="w-4 h-4 text-sky-500" />,
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          Cierre de Caja & Arqueo
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Conciliación del turno: métodos de pago, propinas, boletas DTE y arqueo de efectivo declarado vs. esperado.
        </p>
      </div>

      {/* Clock status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Turno</p>
          <p className="text-lg font-bold text-slate-900 capitalize mt-1">{closure.turno}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Abierto por</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{closure.openedBy}</p>
          <p className="text-xs text-slate-400">{closure.openedAt}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Estado</p>
          <span className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${closure.status === 'cerrada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {closure.status === 'cerrada' ? 'Cerrada' : 'Abierta'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment conciliation */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-900">Conciliación por Método de Pago</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {closure.payments.map((p) => (
              <div key={p.method} className="px-5 py-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-slate-700">
                  {methodIcons[p.method]} {p.method}
                </span>
                <span className="font-semibold text-slate-900">{formatCLP(p.amountCLP)}</span>
              </div>
            ))}
            <div className="px-5 py-3 flex items-center justify-between bg-slate-50">
              <span className="text-sm font-bold text-slate-900">Total Esperado</span>
              <span className="font-bold text-slate-900">{formatCLP(closure.expectedTotalCLP)}</span>
            </div>
            <div className="px-5 py-3 flex items-center justify-between bg-amber-50/60">
              <span className="text-sm font-semibold text-amber-700 flex items-center gap-2"><Wallet className="w-4 h-4" /> Propinas del Turno</span>
              <span className="font-semibold text-amber-700">{formatCLP(closure.tipsCLP)}</span>
            </div>

            <div className="px-5 py-3 flex items-center justify-between bg-emerald-50/60">
              <span className="text-sm font-semibold text-emerald-700 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Boletas DTE del Turno</span>
              <span className="font-semibold text-emerald-700">{closure.dteCount} boletas · {formatCLP(totalBoletas)}</span>
            </div>
          </div>
        </div>

        {/* Cash draw / arqueo */}
        <form onSubmit={handleClose} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-500" /> Arqueo de Efectivo
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Efectivo esperado (según ventas)</label>
              <div className="text-lg font-bold text-slate-900">{formatCLP(expectedEfectivo)}</div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Efectivo declarado en caja (CLP)</label>
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-500" />
                <input
                  type="number"
                  value={declaredEfectivo}
                  onChange={(e) => setDeclaredEfectivo(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {done ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                <Check className="w-4 h-4" /> Cierre de caja registrado satisfactoriamente.
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl text-sm font-medium border
                ${discrepancy === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}">
                {discrepancy === 0 ? (
                  <><Check className="w-4 h-4" /> Caja esta exacta. Diferencia $0.</>
                ) : (
                  <><AlertTriangle className="w-4 h-4" /> Diferencia detectada: {formatCLP(Math.abs(discrepancy))} {discrepancy > 0 ? 'a favor' : 'en contra'}.</>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={done}
              className="w-full bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <TrendingUp className="w-4 h-4" /> {done ? 'Cierre Registrado' : 'Cerrar Caja & Emitir Arqueo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

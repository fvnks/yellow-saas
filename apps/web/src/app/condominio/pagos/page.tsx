'use client';

import { useState } from 'react';
import {
  CreditCard, Plus, CheckCircle2, ShieldCheck, Search, Filter,
  ArrowDownLeft, FileCheck, Check, DollarSign, Calendar, AlertCircle
} from 'lucide-react';
import {
  INITIAL_PAYMENTS,
  INITIAL_UNITS,
  PaymentReceipt,
  formatCLP
} from '@/lib/condominio-client';

// Bank feed synthetic data
interface BankMovement {
  id: string;
  date: string;
  description: string;
  amountCLP: number;
  reference: string;
  suggestedUnitId?: string;
  suggestedUnitNumber?: string;
  status: 'pendiente' | 'conciliado';
}

const INITIAL_BANK_MOVEMENTS: BankMovement[] = [
  {
    id: 'bank-1',
    date: '2026-03-29',
    description: 'TRF BANCO CHILE CARLOS SILVA D101',
    amountCLP: 163103,
    reference: 'TRF-9941203',
    suggestedUnitId: 'u-101',
    suggestedUnitNumber: 'Dpto 101',
    status: 'conciliado',
  },
  {
    id: 'bank-2',
    date: '2026-03-30',
    description: 'TRF SANTAND MARÍA JOSÉ MORALES D102',
    amountCLP: 112500,
    reference: 'TRF-5581902',
    suggestedUnitId: 'u-102',
    suggestedUnitNumber: 'Dpto 102',
    status: 'pendiente',
  },
  {
    id: 'bank-3',
    date: '2026-03-31',
    description: 'DEP EFECTIVO SERVIPAG PARCELA 02',
    amountCLP: 345000,
    reference: 'DEP-102934',
    suggestedUnitId: 'u-p02',
    suggestedUnitNumber: 'Parcela 02',
    status: 'pendiente',
  },
];

export default function PagosConciliacionPage() {
  const [payments, setPayments] = useState<PaymentReceipt[]>(INITIAL_PAYMENTS);
  const [bankMovements, setBankMovements] = useState<BankMovement[]>(INITIAL_BANK_MOVEMENTS);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  // New payment state
  const [selectedUnitId, setSelectedUnitId] = useState(INITIAL_UNITS[0]?.id || 'u-101');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentReceipt['paymentMethod']>('transferencia');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState('2026-03-30');

  const totalCollectedCLP = payments.reduce((acc, p) => acc + p.amountCLP, 0);

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const unitObj = INITIAL_UNITS.find((u) => u.id === selectedUnitId);
    if (!unitObj || !paymentAmount) return;

    const newPayment: PaymentReceipt = {
      id: `pay-${Date.now()}`,
      unitId: unitObj.id,
      unitNumber: unitObj.number,
      ownerName: unitObj.ownerName,
      periodId: 'per-2026-03',
      amountCLP: parseInt(paymentAmount, 10) || 0,
      paymentDate: paymentDate,
      paymentMethod: paymentMethod,
      referenceNumber: paymentReference || 'TRF-LOCAL',
      bankReconciled: true,
    };

    setPayments([newPayment, ...payments]);
    setShowAddPaymentModal(false);
    setPaymentAmount('');
    setPaymentReference('');
  };

  const handleReconcile = (bankId: string) => {
    setBankMovements(
      bankMovements.map((m) => (m.id === bankId ? { ...m, status: 'conciliado' } : m))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Control de Pagos & Conciliación Bancaria
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Cajeros & Banco
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Registro de abonos, comprobantes de pago de copropietarios y conciliación de cartola bancaria.
          </p>
        </div>

        <button
          onClick={() => setShowAddPaymentModal(true)}
          className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 shadow-xs flex items-center gap-2 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Registrar Pago Recibido
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Total Recaudado Mes</span>
          <p className="text-2xl font-black text-emerald-600 mt-2">{formatCLP(totalCollectedCLP)}</p>
          <p className="text-[11px] text-slate-500 mt-1">{payments.length} pagos registrados</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Conciliados con Banco</span>
          <p className="text-2xl font-black text-cyan-600 mt-2">
            {payments.filter((p) => p.bankReconciled).length} de {payments.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Cartola bancaria verificada</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Movimientos Pendientes Cartola</span>
          <p className="text-2xl font-black text-amber-600 mt-2">
            {bankMovements.filter((m) => m.status === 'pendiente').length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Sugerencias de conciliación</p>
        </div>
      </div>

      {/* Bank Reconciliation Cartola Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              Conciliación Bancaria Automática
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Cruza los abonos en la cuenta corriente del condominio con los gastos comunes de cada unidad
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
                <th className="p-3">Fecha</th>
                <th className="p-3">Descripción Cartola</th>
                <th className="p-3">Ref. / N° Doc</th>
                <th className="p-3 text-right">Monto CLP</th>
                <th className="p-3">Unidad Sugerida</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {bankMovements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80">
                  <td className="p-3 text-slate-600 font-semibold">{m.date}</td>
                  <td className="p-3 font-bold text-slate-900">{m.description}</td>
                  <td className="p-3 text-slate-500">{m.reference}</td>
                  <td className="p-3 text-right font-black text-emerald-600">{formatCLP(m.amountCLP)}</td>
                  <td className="p-3">
                    {m.suggestedUnitNumber ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-50 text-cyan-800 font-bold border border-cyan-200">
                        {m.suggestedUnitNumber}
                      </span>
                    ) : (
                      <span className="text-slate-400">Sin sugerencia</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {m.status === 'conciliado' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                        ✓ Conciliado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold border border-amber-200">
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {m.status === 'pendiente' && (
                      <button
                        onClick={() => handleReconcile(m.id)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs"
                      >
                        Conciliar Pago
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* History of Registered Payments */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-600" />
            Historial de Comprobantes de Pago
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
                <th className="p-3">Unidad</th>
                <th className="p-3">Copropietario</th>
                <th className="p-3">Fecha Pago</th>
                <th className="p-3">Método</th>
                <th className="p-3">N° Referencia</th>
                <th className="p-3 text-right">Monto CLP</th>
                <th className="p-3 text-center">Banco</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900">{p.unitNumber}</td>
                  <td className="p-3 text-slate-800">{p.ownerName}</td>
                  <td className="p-3 text-slate-500">{p.paymentDate}</td>
                  <td className="p-3 capitalize text-slate-700 font-semibold">{p.paymentMethod}</td>
                  <td className="p-3 text-slate-600">{p.referenceNumber}</td>
                  <td className="p-3 text-right font-black text-slate-900">{formatCLP(p.amountCLP)}</td>
                  <td className="p-3 text-center">
                    {p.bankReconciled ? (
                      <span className="text-emerald-600 font-bold text-[10px]">✓ Verificado</span>
                    ) : (
                      <span className="text-amber-600 font-bold text-[10px]">Manual</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Payment */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleRegisterPayment} className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">Registrar Pago de Copropietario</h3>
              <button type="button" onClick={() => setShowAddPaymentModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Seleccionar Unidad</label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  {INITIAL_UNITS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.number} - {u.ownerName} (Deuda: {formatCLP(u.unpaidBalanceCLP)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Monto Pagado CLP</label>
                <input
                  type="number"
                  placeholder="163103"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Medio de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-bold text-slate-700"
                >
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="webpay">WebPay / Pago En Línea</option>
                  <option value="deposito">Depósito en Ventanilla</option>
                  <option value="efectivo">Efectivo / Conserjería</option>
                  <option value="cheque">Cheque Al Día</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">N° Comprobante / Transacción</label>
                <input
                  type="text"
                  placeholder="ej. TRF-9941203"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fecha de Recepción</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddPaymentModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FACC15] text-slate-950 font-bold rounded-xl text-xs hover:bg-[#EAB308]"
              >
                Guardar Pago
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
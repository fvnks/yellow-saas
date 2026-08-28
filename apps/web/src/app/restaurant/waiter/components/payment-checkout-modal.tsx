'use client';

import { useState } from 'react';
import { Order } from '../../lib/restaurant-store';
import { X, CheckCircle, CreditCard, DollarSign, QrCode, Building, Receipt, Printer, ArrowRight, ShieldCheck, Users, Percent, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentCheckoutModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (paidData: {
    folioDTE: number;
    paymentMethod: string;
    totalPaidCLP: number;
    tipCLP: number;
  }) => void;
}

export function PaymentCheckoutModal({
  order,
  isOpen,
  onClose,
  onPaymentSuccess,
}: PaymentCheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'transbank_db' | 'transbank_cr' | 'cash' | 'mercadopago_qr' | 'transfer'>('transbank_db');
  const [docType, setDocType] = useState<'boleta' | 'factura'>('boleta');
  const [tipPct, setTipPct] = useState<number>(10);
  const [splitGuests, setSplitGuests] = useState<number>(1);
  const [invoiceRut, setInvoiceRut] = useState('');
  const [invoiceRazon, setInvoiceRazon] = useState('');

  const tipCLP = order ? Math.round((order.totalCLP * tipPct) / 100) : 0;
  const grandTotalCLP = order ? Math.round(order.totalCLP + tipCLP) : 0;

  const [cashReceivedCLP, setCashReceivedCLP] = useState<number>(grandTotalCLP);

  if (!isOpen || !order) return null;

  const formatCLP = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Math.round(val));

  const subtotalNeto = Math.round(order.totalCLP / 1.19);
  const ivaCLP = Math.round(order.totalCLP - subtotalNeto);
  const perGuestCLP = Math.round(grandTotalCLP / Math.max(1, splitGuests));
  const cashChangeCLP = Math.max(0, Math.round(cashReceivedCLP - grandTotalCLP));

  const handleProcessPayment = () => {
    if (docType === 'factura' && !invoiceRut) {
      toast.error('Por favor ingresa el RUT del cliente para la Factura Electrónica.');
      return;
    }

    if (paymentMethod === 'cash' && cashReceivedCLP < grandTotalCLP) {
      toast.error('El efectivo recibido es inferior al total a pagar.');
      return;
    }

    const folioDTE = Math.floor(45000 + Math.random() * 5000);
    const methodLabel =
      paymentMethod === 'transbank_db'
        ? 'Transbank Débito'
        : paymentMethod === 'transbank_cr'
        ? 'Transbank Crédito'
        : paymentMethod === 'cash'
        ? 'Efectivo'
        : paymentMethod === 'mercadopago_qr'
        ? 'MercadoPago QR'
        : 'Transferencia Bancaria';

    toast.success(
      `¡Pago Exitoso! ${docType === 'boleta' ? 'Boleta SII' : 'Factura SII'} Folio N° ${folioDTE} emitida por ${formatCLP(grandTotalCLP)}.`
    );

    onPaymentSuccess({
      folioDTE,
      paymentMethod: methodLabel,
      totalPaidCLP: grandTotalCLP,
      tipCLP,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              Caja POS & Cobranza de Mesa — {order.tableName}
            </h2>
            <p className="text-xs text-slate-400">PIN Kiosco: {order.pinCode} • Comanda {order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          {/* Top Summary & Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Totals Breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <h3 className="font-bold text-slate-900 text-xs mb-2 border-b border-slate-200 pb-1">
                Desglose de Consumo (CLP)
              </h3>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Neto (sin IVA)</span>
                <span>{formatCLP(subtotalNeto)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA (19%)</span>
                <span>{formatCLP(ivaCLP)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-semibold">
                <span>Consumo Total</span>
                <span>{formatCLP(order.totalCLP)}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-700 font-bold pt-1 border-t border-slate-200">
                <span>Propina Garzón ({tipPct}%)</span>
                <span>{formatCLP(tipTip(order.totalCLP, tipPct))}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t-2 border-slate-900">
                <span>Total a Cobrar</span>
                <span className="text-amber-600">{formatCLP(grandTotalCLP)}</span>
              </div>
            </div>

            {/* Tip & Split Bill Controls */}
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1.5 flex items-center justify-between">
                  <span>Propina Sugerida</span>
                  <span className="text-emerald-600 font-semibold">{formatCLP(tipCLP)}</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 10, 15, 20].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTipPct(pct)}
                      className={`py-1.5 rounded-xl font-bold transition-all text-xs ${
                        tipPct === pct
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {pct === 0 ? 'Sin propina' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" /> Dividir Cuenta (Split)
                  </span>
                  <span className="text-slate-600">{splitGuests} comensales</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={splitGuests}
                    onChange={e => setSplitGuests(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <span className="font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg text-xs shrink-0">
                    {formatCLP(perGuestCLP)} / pers.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Type Selection (Boleta vs Factura) */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900">Documento Electrónico SII</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDocType('boleta')}
                className={`p-3 rounded-xl border text-left font-bold transition-all flex items-center gap-3 ${
                  docType === 'boleta'
                    ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Receipt className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-xs font-bold">Boleta Electrónica SII</p>
                  <p className="text-[10px] text-slate-500 font-normal">Público general (Afecta IVA)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDocType('factura')}
                className={`p-3 rounded-xl border text-left font-bold transition-all flex items-center gap-3 ${
                  docType === 'factura'
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs font-bold">Factura Electrónica SII</p>
                  <p className="text-[10px] text-slate-500 font-normal">Para Empresas (RUT & Crédito Fiscal)</p>
                </div>
              </button>
            </div>

            {docType === 'factura' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">RUT Empresa (XX.XXX.XXX-X)</label>
                  <input
                    type="text"
                    placeholder="76.123.456-7"
                    value={invoiceRut}
                    onChange={e => setInvoiceRut(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Razón Social</label>
                  <input
                    type="text"
                    placeholder="Inversiones Gastronómicas SpA"
                    value={invoiceRazon}
                    onChange={e => setInvoiceRazon(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900">Método de Pago</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'transbank_db', name: 'Transbank Débito', icon: CreditCard, color: 'text-blue-600' },
                { id: 'transbank_cr', name: 'Transbank Crédito', icon: CreditCard, color: 'text-purple-600' },
                { id: 'cash', name: 'Efectivo CLP', icon: DollarSign, color: 'text-emerald-600' },
                { id: 'mercadopago_qr', name: 'MercadoPago QR', icon: QrCode, color: 'text-cyan-600' },
                { id: 'transfer', name: 'Transferencia', icon: Building, color: 'text-amber-600' },
              ].map(m => {
                const IconComponent = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isSelected ? 'text-amber-400' : m.color}`} />
                    <span className="text-xs">{m.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Cash change calculator */}
            {paymentMethod === 'cash' && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 mt-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-emerald-900">Monto Recibido en Efectivo (CLP):</label>
                  <input
                    type="number"
                    step={1000}
                    value={Math.round(cashReceivedCLP)}
                    onChange={e => setCashReceivedCLP(Math.round(Number(e.target.value) || 0))}
                    className="w-36 bg-white border border-emerald-300 rounded-lg px-2.5 py-1 text-right font-mono font-bold text-slate-900 focus:outline-hidden text-sm"
                  />
                </div>

                {/* Quick denomination shortcut buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCashReceivedCLP(grandTotalCLP)}
                    className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg text-[11px]"
                  >
                    Exacto ({formatCLP(grandTotalCLP)})
                  </button>
                  {[5000, 10000, 20000, 30000, 50000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCashReceivedCLP(val)}
                      className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold rounded-lg text-[11px]"
                    >
                      {formatCLP(val)}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center font-bold pt-2 border-t border-emerald-200">
                  <span className="text-emerald-900">Vuelto a Entregar:</span>
                  <span className="text-lg text-emerald-700 font-mono font-extrabold">{formatCLP(cashChangeCLP)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-all text-xs"
          >
            Cancelar
          </button>

          <button
            onClick={handleProcessPayment}
            className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm active:scale-98"
          >
            <CheckCircle className="w-4 h-4" />
            Procesar Pago {formatCLP(grandTotalCLP)} & Liberar Mesa
          </button>
        </div>
      </div>
    </div>
  );
}

function tipTip(total: number, pct: number) {
  return Math.round((total * pct) / 100);
}

'use client';

import React from 'react';
import { Receipt, DollarSign, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { InventoryMedication } from './medication-stock-selector';

interface ChargeItem {
  description: string;
  quantity: number;
  unitPriceCLP: number;
}

interface Props {
  patientName: string;
  clientName: string;
  clientRut: string;
  consultationFeeCLP: number;
  dispensedMeds: { med: InventoryMedication; quantity: number }[];
  onSendToPOS?: () => void;
}

export default function BillingOrderGenerator({
  patientName,
  clientName,
  clientRut,
  consultationFeeCLP,
  dispensedMeds,
  onSendToPOS,
}: Props) {
  const formatCLP = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(Math.round(val));
  };

  const charges: ChargeItem[] = [
    { description: 'Consulta & Evaluación Clínica Veterinaria', quantity: 1, unitPriceCLP: consultationFeeCLP },
    ...dispensedMeds.map((item) => ({
      description: `Fármaco: ${item.med.name} (Lote: ${item.med.batchNumber})`,
      quantity: item.quantity,
      unitPriceCLP: item.med.priceCLP,
    })),
  ];

  const subtotal = charges.reduce((acc, curr) => acc + curr.quantity * curr.unitPriceCLP, 0);
  const vatIVA = Math.round(subtotal * 0.19);
  const totalNetPlusVat = subtotal; // If price includes IVA or net

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-slate-800" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Pre-Factura / Orden de Cobro
          </h3>
        </div>
        <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-blue-200">
          SII DTE Listo
        </span>
      </div>

      <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
        <p><strong>Tutor / Cliente:</strong> {clientName} ({clientRut})</p>
        <p><strong>Paciente:</strong> {patientName}</p>
      </div>

      {/* Detalle de Cobros */}
      <div className="divide-y divide-slate-100 text-xs">
        {charges.map((c, i) => (
          <div key={i} className="py-2 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900">{c.description}</span>
              <span className="text-slate-500 block">x{c.quantity} @ {formatCLP(c.unitPriceCLP)}</span>
            </div>
            <span className="font-mono font-bold text-slate-800">
              {formatCLP(c.quantity * c.unitPriceCLP)}
            </span>
          </div>
        ))}
      </div>

      {/* Total Box */}
      <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 block font-medium">Total a Pagar (CLP)</span>
          <span className="text-xl font-black text-slate-900 font-mono">
            {formatCLP(subtotal)}
          </span>
        </div>

        <button
          type="button"
          onClick={onSendToPOS}
          className="bg-[#3B82F6] hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center gap-2"
        >
          Enviar a Caja POS / Emitir Boleta DTE
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

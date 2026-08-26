'use client';

import { useState } from 'react';
import {
  Users, Building, Download, Printer, ShieldCheck, CheckCircle2,
  Receipt, CreditCard, DollarSign, Calendar, AlertCircle
} from 'lucide-react';
import {
  INITIAL_UNITS,
  INITIAL_PERIODS,
  CondoUnit,
  calculateUnitExpense,
  formatCLP
} from '@/lib/condominio-client';

export default function PortalResidentePage() {
  const [selectedUnitId, setSelectedUnitId] = useState<string>(INITIAL_UNITS[1].id); // Dpto 102
  const activeUnit = INITIAL_UNITS.find((u) => u.id === selectedUnitId) || INITIAL_UNITS[0];
  const activePeriod = INITIAL_PERIODS[0];

  const calc = calculateUnitExpense(activeUnit, activePeriod);

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Selector */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Portal del Copropietario / Residente
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-cyan-50 text-cyan-700 border border-cyan-200">
              Vista del Residente
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Consulta de estado de cuenta individual, desglose de cobro mensual y descarga de aviso de cobro.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Simular Residente:</label>
          <select
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
          >
            {INITIAL_UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.number} - {u.ownerName}
              </option>
            ))}
          </select>

          <button
            onClick={handlePrintSlip}
            className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            Imprimir Aviso (PDF)
          </button>
        </div>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Unidad & Copropiedad</span>
          <p className="text-xl font-black text-slate-900 mt-2">{activeUnit.number}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Alícuota: <strong className="text-cyan-600">{activeUnit.alicuotaPercentage}%</strong> ({activeUnit.areaM2} m²)
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Estado de Cuenta</span>
          <p className="text-xl font-black mt-2">
            {activeUnit.status === 'al_dia' ? (
              <span className="text-emerald-600">✓ Al Día</span>
            ) : (
              <span className="text-rose-600">Deuda Pendiente</span>
            )}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">{activeUnit.ownerName}</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Total a Pagar este Mes</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{formatCLP(calc.totalToPayCLP)}</p>
          <p className="text-[11px] text-amber-600 mt-1 font-bold">Vence: {activePeriod.dueDate}</p>
        </div>
      </div>

      {/* Printable Statement / Notice Slip */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs space-y-6 print:border-none print:shadow-none">
        {/* Header Statement */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-black text-sm">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Condominio Los Alerces</h2>
                <p className="text-xs text-slate-500 font-medium">Administración de Copropiedad PYME · RUT 76.990.120-K</p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-800 rounded-full text-xs font-extrabold">
              AVISO DE COBRO GASTOS COMUNES
            </span>
            <p className="text-xs font-bold text-slate-900 mt-2">Período: {activePeriod.periodName}</p>
            <p className="text-[11px] text-slate-500">Fecha de Emisión: 01-03-2026</p>
          </div>
        </div>

        {/* Resident & Unit Details */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
          <div>
            <p className="text-slate-500 font-medium">Detalle del Copropietario / Residente:</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{activeUnit.ownerName}</p>
            <p className="text-slate-600">RUT: {activeUnit.ownerRut}</p>
            <p className="text-slate-600">Correo: {activeUnit.ownerEmail}</p>
          </div>

          <div className="text-right">
            <p className="text-slate-500 font-medium">Identificación de la Propiedad:</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{activeUnit.number}</p>
            <p className="text-slate-600">Sector: {activeUnit.sectorName}</p>
            <p className="text-slate-600">Coeficiente Alícuota: <strong>{activeUnit.alicuotaPercentage}%</strong></p>
          </div>
        </div>

        {/* Breakdown Table */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Desglose Individual de Gastos Comunes
          </h3>

          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Concepto de Cobro</th>
                <th className="p-3 text-center">Base de Cálculo</th>
                <th className="p-3 text-right">Monto CLP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="p-3 font-semibold text-slate-800">
                  Gasto Común Operativo Base (Alícuota {activeUnit.alicuotaPercentage}%)
                </td>
                <td className="p-3 text-center text-slate-500">{formatCLP(activePeriod.totalExpensesCLP)} total</td>
                <td className="p-3 text-right font-bold text-slate-900">{formatCLP(calc.baseAmountCLP)}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">
                  Fondo de Reserva ({activePeriod.reserveFundPercentage}% obligatorio por ley)
                </td>
                <td className="p-3 text-center text-slate-500">10% del cobro base</td>
                <td className="p-3 text-right font-bold text-cyan-600">{formatCLP(calc.reserveFundCLP)}</td>
              </tr>
              {calc.lateInterestCLP > 0 && (
                <tr>
                  <td className="p-3 font-semibold text-rose-700">
                    Interés por Mora ({activePeriod.lateInterestRate}% mensual sobre saldo vencido)
                  </td>
                  <td className="p-3 text-center text-rose-600">Aplicado a morosidad</td>
                  <td className="p-3 text-right font-bold text-rose-600">{formatCLP(calc.lateInterestCLP)}</td>
                </tr>
              )}
              {calc.previousBalanceCLP > 0 && (
                <tr>
                  <td className="p-3 font-semibold text-rose-700">
                    Saldo Anterior Pendiente de Pago
                  </td>
                  <td className="p-3 text-center text-rose-600">Períodos anteriores</td>
                  <td className="p-3 text-right font-bold text-rose-600">{formatCLP(calc.previousBalanceCLP)}</td>
                </tr>
              )}
              <tr className="bg-slate-900 text-white font-black">
                <td className="p-3 text-sm">TOTAL A PAGAR FECHA VENCIMIENTO ({activePeriod.dueDate})</td>
                <td className="p-3 text-center text-xs font-medium text-slate-300">CLP sin centavos</td>
                <td className="p-3 text-right text-base text-[#FACC15]">{formatCLP(calc.totalToPayCLP)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bank Account Payment Details */}
        <div className="bg-cyan-50/60 border border-cyan-200 p-4 rounded-xl text-xs space-y-1">
          <p className="font-bold text-cyan-900">Datos para Transferencia Bancaria:</p>
          <p className="text-slate-700">Banco: <strong>Banco de Chile</strong> | Tipo Cuenta: <strong>Cuenta Corriente</strong></p>
          <p className="text-slate-700">N° Cuenta: <strong>00-129-44021-09</strong> | RUT: <strong>76.990.120-K</strong></p>
          <p className="text-slate-700">Titular: <strong>Condominio Los Alerces SpA</strong> | Email Comprobante: <strong>pagos@condominiolosalerces.cl</strong></p>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            * Indicar en el asunto de transferencia el número de unidad: <strong>&quot;{activeUnit.number}&quot;</strong>.
          </p>
        </div>
      </div>

      {/* Official Condo Documents Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              Documentos Oficiales de Copropiedad (Ley 21.442)
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Descarga el Reglamento Interno, Actas de Asamblea y Pólizas de Seguro del Condominio
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                Reglamento
              </span>
              <h3 className="text-xs font-bold text-slate-900 mt-2">Reglamento Interno Copropiedad</h3>
              <p className="text-[11px] text-slate-500 mt-1">Normas de convivencia, tenencia de mascotas y ruidos molestos.</p>
            </div>
            <button
              onClick={() => alert('Descargando Reglamento Interno en PDF...')}
              className="text-xs font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Descargar PDF
            </button>
          </div>

          <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Asamblea
              </span>
              <h3 className="text-xs font-bold text-slate-900 mt-2">Acta Asamblea Ordinaria 2026</h3>
              <p className="text-[11px] text-slate-500 mt-1">Aprobación de balances, presupuesto y rendición de cuentas.</p>
            </div>
            <button
              onClick={() => alert('Descargando Acta de Asamblea en PDF...')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Descargar PDF
            </button>
          </div>

          <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Seguros
              </span>
              <h3 className="text-xs font-bold text-slate-900 mt-2">Póliza Colectiva Espacios Comunes</h3>
              <p className="text-[11px] text-slate-500 mt-1">Cobertura de Incendio y Sismo Ley de Copropiedad.</p>
            </div>
            <button
              onClick={() => alert('Descargando Póliza Colectiva de Seguro...')}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import {
  Receipt, Plus, Calculator, DollarSign, Calendar, Percent, Shield,
  FileText, ArrowRight, Trash2, CheckCircle, Clock, AlertTriangle, Download
} from 'lucide-react';
import {
  INITIAL_PERIODS,
  INITIAL_UNITS,
  CommonExpensePeriod,
  ExpenseItem,
  calculateUnitExpense,
  formatCLP
} from '@/lib/condominio-client';

export default function GastosComunesPage() {
  const [periods, setPeriods] = useState<CommonExpensePeriod[]>(INITIAL_PERIODS);
  const [activePeriodId, setActivePeriodId] = useState<string>(periods[0]?.id || 'per-2026-03');

  // Active period selected
  const activePeriod = periods.find((p) => p.id === activePeriodId) || periods[0];

  // Expense item form modal
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newCategory, setNewCategory] = useState<ExpenseItem['category']>('Mantención');
  const [newDescription, setNewDescription] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newSupplier, setNewSupplier] = useState('');

  // New period form modal
  const [showAddPeriodModal, setShowAddPeriodModal] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState('Abril 2026');
  const [newPeriodDate, setNewPeriodDate] = useState('2026-04');
  const [newDueDate, setNewDueDate] = useState('2026-05-10');
  const [newReservePercentage, setNewReservePercentage] = useState('10');
  const [newLateInterest, setNewLateInterest] = useState('1.5');

  // Simulator modal
  const [showSimuladorModal, setShowSimuladorModal] = useState(false);
  const [extraSimulatedAmount, setExtraSimulatedAmount] = useState('500000');

  // Export report to CSV
  const handleExportCSV = () => {
    if (!activePeriod) return;
    let csv = `Unidad,Copropietario,Alicuota,CobroBaseCLP,FondoReservaCLP,InteresMoraCLP,SaldoAnteriorCLP,TotalCLP\n`;
    INITIAL_UNITS.forEach((unit) => {
      const calc = calculateUnitExpense(unit, activePeriod);
      csv += `"${unit.number}","${unit.ownerName}",${unit.alicuotaPercentage},${calc.baseAmountCLP},${calc.reserveFundCLP},${calc.lateInterestCLP},${calc.previousBalanceCLP},${calc.totalToPayCLP}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gastos_comunes_${activePeriod.periodDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription || !newAmount || !activePeriod) return;

    const parsedAmount = parseInt(newAmount, 10) || 0;
    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}`,
      category: newCategory,
      description: newDescription,
      amountCLP: parsedAmount,
      supplierName: newSupplier || 'Proveedor',
    };

    const updatedItems = [...activePeriod.items, newItem];
    const newTotalExpenses = updatedItems.reduce((acc, it) => acc + it.amountCLP, 0);
    const newReserveFund = Math.round(newTotalExpenses * (activePeriod.reserveFundPercentage / 100));
    const newTotalBilled = newTotalExpenses + newReserveFund;

    const updatedPeriod: CommonExpensePeriod = {
      ...activePeriod,
      items: updatedItems,
      totalExpensesCLP: newTotalExpenses,
      totalReserveFundCLP: newReserveFund,
      totalBilledCLP: newTotalBilled,
    };

    setPeriods(periods.map((p) => (p.id === activePeriod.id ? updatedPeriod : p)));
    setShowAddItemModal(false);
    setNewDescription('');
    setNewAmount('');
    setNewSupplier('');
  };

  // Remove Item
  const handleRemoveItem = (itemId: string) => {
    if (!activePeriod) return;
    const updatedItems = activePeriod.items.filter((it) => it.id !== itemId);
    const newTotalExpenses = updatedItems.reduce((acc, it) => acc + it.amountCLP, 0);
    const newReserveFund = Math.round(newTotalExpenses * (activePeriod.reserveFundPercentage / 100));

    const updatedPeriod: CommonExpensePeriod = {
      ...activePeriod,
      items: updatedItems,
      totalExpensesCLP: newTotalExpenses,
      totalReserveFundCLP: newReserveFund,
      totalBilledCLP: newTotalExpenses + newReserveFund,
    };

    setPeriods(periods.map((p) => (p.id === activePeriod.id ? updatedPeriod : p)));
  };

  // Create New Period
  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    const newPeriod: CommonExpensePeriod = {
      id: `per-${Date.now()}`,
      periodName: newPeriodName,
      periodDate: newPeriodDate,
      dueDate: newDueDate,
      status: 'borrador',
      reserveFundPercentage: parseFloat(newReservePercentage) || 10,
      lateInterestRate: parseFloat(newLateInterest) || 1.5,
      items: [],
      totalExpensesCLP: 0,
      totalReserveFundCLP: 0,
      totalBilledCLP: 0,
    };

    setPeriods([newPeriod, ...periods]);
    setActivePeriodId(newPeriod.id);
    setShowAddPeriodModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Gestión de Gastos Comunes
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-cyan-50 text-cyan-700 border border-cyan-200">
              Prorrateo & Cobranza
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Calculadora de prorrateo por alícuota, asignación a fondo de reserva e intereses por mora.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSimuladorModal(true)}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Calculator className="w-4 h-4 text-cyan-600" />
            Simulador Extraordinario
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Exportar CSV
          </button>

          <button
            onClick={() => setShowAddPeriodModal(true)}
            className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 shadow-xs flex items-center gap-2 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Crear Nuevo Período
          </button>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
          <Calendar className="w-4 h-4 text-cyan-600" />
          Período Activo:
        </span>
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePeriodId(p.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activePeriodId === p.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{p.periodName}</span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
              p.status === 'emitido' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {p.status}
            </span>
          </button>
        ))}
      </div>

      {/* Active Period Summary KPIs */}
      {activePeriod && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <span className="text-slate-500 text-xs font-semibold">Total Gastos Operativos</span>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatCLP(activePeriod.totalExpensesCLP)}</p>
              <p className="text-[11px] text-slate-500 mt-1">{activePeriod.items.length} ítems registrados</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <span className="text-slate-500 text-xs font-semibold">Fondo de Reserva ({activePeriod.reserveFundPercentage}%)</span>
              <p className="text-2xl font-black text-cyan-600 mt-2">{formatCLP(activePeriod.totalReserveFundCLP)}</p>
              <p className="text-[11px] text-slate-500 mt-1">Aporte acumulado al fondo</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <span className="text-slate-500 text-xs font-semibold">Total a Emitir</span>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatCLP(activePeriod.totalBilledCLP)}</p>
              <p className="text-[11px] text-slate-500 mt-1">Suma total del período</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <span className="text-slate-500 text-xs font-semibold">Fecha Vencimiento</span>
              <p className="text-xl font-black text-amber-600 mt-2">{activePeriod.dueDate}</p>
              <p className="text-[11px] text-slate-500 mt-1">Interés por mora: {activePeriod.lateInterestRate}% / mes</p>
            </div>
          </div>

          {/* Expense Items Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-cyan-600" />
                  Detalle de Gastos del Período ({activePeriod.periodName})
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Ingresa las facturas, cuentas y remuneraciones correspondientes al mes
                </p>
              </div>

              <button
                onClick={() => setShowAddItemModal(true)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Agregar Gasto
              </button>
            </div>

            {activePeriod.items.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                Aún no hay ítems registrados para este período. Haz clic en "Agregar Gasto".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
                      <th className="p-3">Categoría</th>
                      <th className="p-3">Descripción</th>
                      <th className="p-3">Proveedor / Documento</th>
                      <th className="p-3 text-right">Monto CLP</th>
                      <th className="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activePeriod.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-bold text-slate-900">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] bg-cyan-50 text-cyan-700 border border-cyan-200">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{item.description}</td>
                        <td className="p-3 text-slate-500">{item.supplierName || 'Planta Condominio'}</td>
                        <td className="p-3 text-right font-black text-slate-900">{formatCLP(item.amountCLP)}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-rose-600 hover:text-rose-800 font-bold"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Prorrateo Table by Unit */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-cyan-600" />
                  Prorrateo Individual por Unidad ({INITIAL_UNITS.length} Copropietarios)
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Cálculo automático: Base Alícuota + Fondo Reserva ({activePeriod.reserveFundPercentage}%) + Interés Mora + Saldo Anterior
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
                    <th className="p-3">Unidad</th>
                    <th className="p-3">Copropietario</th>
                    <th className="p-3 text-center">Alícuota %</th>
                    <th className="p-3 text-right">Cobro Base</th>
                    <th className="p-3 text-right">Fondo Reserva</th>
                    <th className="p-3 text-right">Interés Mora</th>
                    <th className="p-3 text-right">Saldo Anter.</th>
                    <th className="p-3 text-right font-black text-slate-900">Total a Cobrar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {INITIAL_UNITS.map((unit) => {
                    const calc = calculateUnitExpense(unit, activePeriod);
                    return (
                      <tr key={unit.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-bold text-slate-900">{unit.number}</td>
                        <td className="p-3 font-semibold text-slate-800">{unit.ownerName}</td>
                        <td className="p-3 text-center font-bold text-cyan-600">{unit.alicuotaPercentage}%</td>
                        <td className="p-3 text-right">{formatCLP(calc.baseAmountCLP)}</td>
                        <td className="p-3 text-right text-slate-600">{formatCLP(calc.reserveFundCLP)}</td>
                        <td className="p-3 text-right text-amber-600 font-bold">
                          {calc.lateInterestCLP > 0 ? formatCLP(calc.lateInterestCLP) : '$0'}
                        </td>
                        <td className="p-3 text-right text-rose-600 font-bold">
                          {calc.previousBalanceCLP > 0 ? formatCLP(calc.previousBalanceCLP) : '$0'}
                        </td>
                        <td className="p-3 text-right font-black text-slate-900 bg-slate-50">
                          {formatCLP(calc.totalToPayCLP)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal Add Expense Item */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddItem} className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">Agregar Gasto Operativo</h3>
              <button type="button" onClick={() => setShowAddItemModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Categoría</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-bold text-slate-700"
                >
                  <option value="Conserjería">Conserjería y Personal</option>
                  <option value="Mantención">Mantención Preventiva</option>
                  <option value="Servicios Básicos">Servicios Básicos (Luz/Agua)</option>
                  <option value="Reparaciones">Reparaciones de Emergencia</option>
                  <option value="Administración">Administración</option>
                  <option value="Seguros">Seguros de Incendio / Espacios</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción del Gasto</label>
                <input
                  type="text"
                  placeholder="ej. Mantención calderas de agua caliente"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Monto Total CLP</label>
                <input
                  type="number"
                  placeholder="350000"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Proveedor / Factura N°</label>
                <input
                  type="text"
                  placeholder="ej. Servicios Calderas Spa - Fact 8812"
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddItemModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-xl text-xs hover:bg-cyan-700"
              >
                Agregar Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Add Period */}
      {showAddPeriodModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreatePeriod} className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">Crear Nuevo Período de Cobro</h3>
              <button type="button" onClick={() => setShowAddPeriodModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del Período</label>
                <input
                  type="text"
                  placeholder="ej. Abril 2026"
                  value={newPeriodName}
                  onChange={(e) => setNewPeriodName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fecha Vencimiento</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">% Fondo Reserva</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newReservePercentage}
                    onChange={(e) => setNewReservePercentage(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">% Interés Mora</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLateInterest}
                    onChange={(e) => setNewLateInterest(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddPeriodModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FACC15] text-slate-950 font-bold rounded-xl text-xs hover:bg-[#EAB308]"
              >
                Crear Período
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Simulador Extraordinario */}
      {showSimuladorModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-cyan-600" />
                <h3 className="text-base font-black text-slate-900">Simulador de Cuota Extraordinaria</h3>
              </div>
              <button type="button" onClick={() => setShowSimuladorModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-500">
                Calcula en tiempo real el impacto individual por unidad de un gasto imprevisto (ej. reparación de bomba de agua, mantención extraordinaria o pintura de fachada).
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Monto Imprevisto a Simular (CLP)</label>
                <input
                  type="number"
                  placeholder="500000"
                  value={extraSimulatedAmount}
                  onChange={(e) => setExtraSimulatedAmount(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-black text-slate-900 text-sm"
                />
              </div>

              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 p-2">
                {INITIAL_UNITS.map((u) => {
                  const extraAmount = parseInt(extraSimulatedAmount, 10) || 0;
                  const unitExtraCLP = Math.round(extraAmount * (u.alicuotaPercentage / 100));
                  return (
                    <div key={u.id} className="p-2 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{u.number}</p>
                        <p className="text-[10px] text-slate-500">{u.ownerName} ({u.alicuotaPercentage}%)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-cyan-600">+{formatCLP(unitExtraCLP)}</p>
                        <p className="text-[10px] text-slate-400">adicionales</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setShowSimuladorModal(false)}
                className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Cerrar Simulador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
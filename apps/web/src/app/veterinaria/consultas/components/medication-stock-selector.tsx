'use client';

import React, { useState } from 'react';
import { Package, AlertCircle, CheckCircle2, Search, ArrowDown } from 'lucide-react';

export interface InventoryMedication {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  unit: string;
  batchNumber: string;
  expirationDate: string;
  priceCLP: number;
}

const MOCK_INVENTORY_MEDS: InventoryMedication[] = [
  { id: 'med-01', name: 'Amoxicilina + Ac. Clavulánico 250mg', sku: 'VET-AMOX-250', currentStock: 45, unit: 'comprimidos', batchNumber: 'LOTE-88491', expirationDate: '2026-08-15', priceCLP: 1200 },
  { id: 'med-02', name: 'Meloxicam 0.5mg/ml Inyectable', sku: 'VET-MELOX-05', currentStock: 12, unit: 'frascos 10ml', batchNumber: 'LOTE-99201', expirationDate: '2026-03-30', priceCLP: 14500 },
  { id: 'med-03', name: 'Ondansetrón 2mg/ml Inyectable', sku: 'VET-OND-02', currentStock: 8, unit: 'ampollas', batchNumber: 'LOTE-77123', expirationDate: '2025-11-20', priceCLP: 3800 },
  { id: 'med-04', name: 'Endogard 30kg Desparasitante', sku: 'VET-[#FACC15]', currentStock: 60, unit: 'comprimidos', batchNumber: 'LOTE-11029', expirationDate: '2027-01-10', priceCLP: 4500 },
  { id: 'med-05', name: 'Bravecto 20-40kg Masticable', sku: 'VET-BRAV-40', currentStock: 15, unit: 'cajas', batchNumber: 'LOTE-33412', expirationDate: '2026-10-05', priceCLP: 34900 },
];

interface Props {
  onSelectMedication: (med: InventoryMedication, quantity: number) => void;
}

export default function MedicationStockSelector({ onSelectMedication }: Props) {
  const [search, setSearch] = useState('');
  const [selectedMed, setSelectedMed] = useState<InventoryMedication | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const filtered = MOCK_INVENTORY_MEDS.filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!selectedMed || quantity <= 0) return;
    onSelectMedication(selectedMed, quantity);
    setSelectedMed(null);
    setQuantity(1);
  };

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Package className="w-4 h-4 text-emerald-600" />
          Rebajar Fármacos & Insumos de Bodega ERP
        </h4>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
          Stock en Tiempo Real
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar medicamento o insumo en bodega..."
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedMed?.id || ''}
          onChange={(e) => {
            const found = MOCK_INVENTORY_MEDS.find((m) => m.id === e.target.value);
            setSelectedMed(found || null);
          }}
          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">-- Seleccionar de la lista --</option>
          {filtered.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} (Stock: {m.currentStock} {m.unit} • Lote: {m.batchNumber})
            </option>
          ))}
        </select>
      </div>

      {selectedMed && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div>
            <div className="font-bold text-slate-900">{selectedMed.name}</div>
            <p className="text-[11px] text-slate-500">
              SKU: {selectedMed.sku} • Lote: <strong className="text-slate-700">{selectedMed.batchNumber}</strong> • Vence: {selectedMed.expirationDate}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-700">Cant:</label>
            <input
              type="number"
              min="1"
              max={selectedMed.currentStock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-xs"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1"
            >
              <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
              Descontar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

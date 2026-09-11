'use client';

import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, CheckCircle2, Search, ArrowDown, Loader2 } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

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

interface Props {
 onSelectMedication: (med: InventoryMedication, quantity: number) => void;
}

export default function MedicationStockSelector({ onSelectMedication }: Props) {
 const [search, setSearch] = useState('');
 const [selectedMed, setSelectedMed] = useState<InventoryMedication | null>(null);
 const [quantity, setQuantity] = useState<number>(1);
 const [allMeds, setAllMeds] = useState<InventoryMedication[]>([]);
 const [loadingMeds, setLoadingMeds] = useState(true);

 useEffect(() => {
 const fetchMeds = async () => {
 try {
 const api = getApiClient();
 const result = await api.getProducts({ search: '' });
 const mapped: InventoryMedication[] = (result.data || []).map((p: any) => ({
 id: p.id,
 name: p.name,
 sku: p.sku || '',
 currentStock: p.stock || 0,
 unit: p.unit_of_measure || 'unidades',
 batchNumber: p.batchNumber || '',
 expirationDate: p.expirationDate || '',
 priceCLP: p.sale_price || p.price || 0,
 }));
 setAllMeds(mapped);
 } catch {
 setAllMeds([]);
 } finally {
 setLoadingMeds(false);
 }
 };
 fetchMeds();
 }, []);

 const filtered = allMeds.filter(
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
 {loadingMeds ? (
 <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Cargando...</span>
 ) : (
 'Stock en Tiempo Real'
 )}
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
 const found = allMeds.find((m) => m.id === e.target.value);
 setSelectedMed(found || null);
 }}
 className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
 >
 <option value="">
 {loadingMeds ? 'Cargando medicamentos...' : '-- Seleccionar de la lista --'}
 </option>
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
 className="bg-monday-violet hover:bg-cloud text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1"
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

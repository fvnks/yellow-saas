'use client';

import { useState, useEffect } from 'react';
import { Camera, Calendar, TrendingUp, Package, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Snapshot {
  product_name: string;
  sku: string;
  warehouse_name: string;
  quantity: number;
  unit_cost: number;
  total_value: number;
  snapshot_date: string;
}

export default function InventorySnapshots() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => { loadSnapshots(); }, [selectedDate]);

  const loadSnapshots = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const params = new URLSearchParams();
      if (selectedDate) { params.set('from', selectedDate); params.set('to', selectedDate); }

      const res = await fetch(`/api/companies/${companyId}/inventory-snapshots?${params}`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        setSnapshots(data.snapshots || []);
        setDates(data.dates || []);
        setTotalValue(data.totalValue || 0);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/inventory-snapshots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        toast.success('Snapshot creado');
        loadSnapshots();
      }
    } catch (e) { toast.error('Error al crear snapshot'); }
    setCreating(false);
  };

  const handleExport = () => {
    if (snapshots.length === 0) return;
    const header = 'Fecha,Producto,SKU,Bodega,Cantidad,Costo Unit.,Valor Total';
    const rows = snapshots.map(s =>
      `"${s.snapshot_date}","${s.product_name}","${s.sku}","${s.warehouse_name}",${s.quantity},${s.unit_cost},${s.total_value}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `snapshots-inventario.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Exportado');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-slate-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Snapshots Historicos</span>
        </div>
        <div className="flex items-center gap-2">
          {snapshots.length > 0 && (
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
          )}
          <button onClick={handleCreate} disabled={creating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
            <Camera className="w-3.5 h-3.5" /> {creating ? 'Creando...' : 'Tomar Snapshot'}
          </button>
        </div>
      </div>

      {dates.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <button onClick={() => setSelectedDate('')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${!selectedDate ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              Todos
            </button>
            {dates.map(d => (
              <button key={d} onClick={() => setSelectedDate(d)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${selectedDate === d ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {new Date(d).toLocaleDateString('es-CL')}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-semibold text-indigo-600 uppercase">Valor Total del Dia</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>
          <TrendingUp className="w-6 h-6 text-indigo-400" />
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : snapshots.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Sin snapshots. Tome uno para guardar el estado actual del inventario.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cantidad</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Costo Unit.</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((s, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-600">{new Date(s.snapshot_date).toLocaleDateString('es-CL')}</td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-900">{s.product_name}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{s.warehouse_name}</td>
                    <td className="px-4 py-3 text-xs text-right font-bold text-slate-900">{s.quantity}</td>
                    <td className="px-4 py-3 text-xs text-right text-slate-600">${s.unit_cost}</td>
                    <td className="px-4 py-3 text-xs text-right font-medium text-slate-900">
                      ${s.total_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

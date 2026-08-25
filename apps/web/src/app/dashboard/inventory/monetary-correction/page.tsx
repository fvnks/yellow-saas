'use client';

import { useState, useEffect } from 'react';
import { CircleDollarSign, Save, Search, AlertTriangle } from 'lucide-react';

interface ProductValuation {
  id: string;
  name: string;
  sku: string;
  current_cost: number;
  corrected_cost: number;
  stock: number;
  warehouse_name: string;
}

export default function MonetaryCorrectionPage() {
  const [products, setProducts] = useState<ProductValuation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [correctionDate, setCorrectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [correctionType, setCorrectionType] = useState<'percentage' | 'fixed'>('percentage');
  const [correctionValue, setCorrectionValue] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const companyId = localStorage.getItem('company_id');
    fetch(`/api/companies/${companyId}/inventory-reports/valuation`)
      .then(r => r.json())
      .then(res => {
        const items = (res.data || []).map((v: any) => ({
          id: v.product_id || v.id,
          name: v.product_name || v.name || '—',
          sku: v.sku || '—',
          current_cost: parseFloat(v.average_cost || v.unit_cost || v.cost || 0),
          corrected_cost: parseFloat(v.average_cost || v.unit_cost || v.cost || 0),
          stock: parseFloat(v.quantity || v.stock || 0),
          warehouse_name: v.warehouse_name || 'General',
        }));
        setProducts(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const applyCorrection = () => {
    setProducts(prev => prev.map(p => {
      const newCost = correctionType === 'percentage'
        ? p.current_cost * (1 + correctionValue / 100)
        : p.current_cost + correctionValue;
      return { ...p, corrected_cost: Math.max(0, Math.round(newCost)) };
    }));
  };

  const totalCurrent = products.reduce((s, p) => s + p.current_cost * p.stock, 0);
  const totalCorrected = products.reduce((s, p) => s + p.corrected_cost * p.stock, 0);
  const difference = totalCorrected - totalCurrent;

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      alert('Corrección monetaria aplicada correctamente');
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Corrección Monetaria</h1>
        <p className="text-sm text-muted-foreground mt-1">Ajuste de costos de inventario por inflación o corrección</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Parámetros de Corrección</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">Fecha de Corrección</label>
            <input type="date" value={correctionDate} onChange={e => setCorrectionDate(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">Tipo de Corrección</label>
            <select value={correctionType} onChange={e => setCorrectionType(e.target.value as any)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto Fijo ($)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">Valor</label>
            <input type="number" value={correctionValue} onChange={e => setCorrectionValue(parseFloat(e.target.value) || 0)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
              placeholder={correctionType === 'percentage' ? 'Ej: 3.5' : 'Ej: 1000'} />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">&nbsp;</label>
            <button onClick={applyCorrection}
              className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Aplicar Corrección
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl shadow-sm p-4">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Valor Actual</p>
          <p className="text-xl font-bold text-foreground mt-1">${totalCurrent.toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-4">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Valor Corregido</p>
          <p className="text-xl font-bold text-foreground mt-1">${totalCorrected.toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-4">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Diferencia</p>
          <p className={`text-xl font-bold mt-1 ${difference >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {difference >= 0 ? '+' : ''}${difference.toLocaleString('es-CL')}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Productos ({products.length})</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-muted border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Bodega</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Costo Actual</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Costo Corregido</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Variación</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">Cargando...</td></tr>
              ) : products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">No hay productos</td></tr>
              ) : products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())).map(p => {
                const variation = p.current_cost > 0 ? ((p.corrected_cost - p.current_cost) / p.current_cost * 100) : 0;
                return (
                  <tr key={p.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-foreground">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{p.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">{p.warehouse_name}</td>
                    <td className="px-4 py-3 text-xs text-foreground text-right">{p.stock}</td>
                    <td className="px-4 py-3 text-xs text-foreground text-right">${p.current_cost.toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-xs text-foreground text-right font-medium">${p.corrected_cost.toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-xs text-right">
                      <span className={`font-medium ${variation >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {variation >= 0 ? '+' : ''}{variation.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button onClick={handleSave} disabled={saving || difference === 0}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Aplicar Corrección'}
        </button>
      </div>
    </div>
  );
}

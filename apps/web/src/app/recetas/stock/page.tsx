'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Plus, Minus, ArrowLeft, Check, X, History } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import Link from 'next/link';

interface StockLine {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  unit: string;
  current_stock: number;
  type: 'add' | 'remove';
  quantity: string;
  reason: string;
}

let lineCounter = 0;

export default function StockEntryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lines, setLines] = useState<StockLine[]>([]);
  const [saving, setSaving] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [tab, setTab] = useState<'entry' | 'history'>('entry');
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  useEffect(() => {
    const api = getApiClient();
    api.getRecipeProducts({ limit: '500' }).then((res: any) => {
      setProducts(res.data || []);
      setLoading(false);
    }).catch(() => {
      toast.error('Error al cargar productos');
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (tab === 'history') loadHistory();
  }, [tab, historyPage]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const api = getApiClient();
      const res = await api.getRecipeStockEntries({ page: String(historyPage), limit: '20' });
      setHistory(res.data || []);
      setHistoryTotal(res.pagination?.total || 0);
    } catch {
      toast.error('Error al cargar historial');
    }
    setHistoryLoading(false);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addLine = () => {
    setLines(prev => [...prev, {
      id: `line-${++lineCounter}`,
      product_id: '',
      product_name: '',
      product_sku: '',
      unit: '',
      current_stock: 0,
      type: 'add',
      quantity: '',
      reason: '',
    }]);
  };

  const removeLine = (lineId: string) => {
    setLines(prev => prev.filter(l => l.id !== lineId));
  };

  const updateLine = (lineId: string, updates: Partial<StockLine>) => {
    setLines(prev => prev.map(l => l.id === lineId ? { ...l, ...updates } : l));
  };

  const selectProduct = (lineId: string, product: any) => {
    updateLine(lineId, {
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      unit: product.unit_of_measure,
      current_stock: Number(product.stock) || 0,
    });
    setShowDropdown(null);
    setSearch('');
  };

  const handleSubmit = async () => {
    const validLines = lines.filter(l => l.product_id && l.quantity && parseFloat(l.quantity) > 0);
    if (validLines.length === 0) {
      toast.error('Agrega al menos un producto con cantidad');
      return;
    }

    for (const line of validLines) {
      const qty = parseFloat(line.quantity);
      if (line.type === 'remove' && qty > line.current_stock) {
        toast.error(`${line.product_name}: stock insuficiente (${line.current_stock} ${line.unit})`);
        return;
      }
    }

    setSaving(true);
    try {
      const api = getApiClient();
      const entries = validLines.map(l => ({
        product_id: l.product_id,
        type: l.type,
        quantity: parseFloat(l.quantity),
        reason: l.reason || undefined,
      }));

      const result = await api.createRecipeStockEntries(entries);
      toast.success(`${result.count} movimiento(s) registrado(s)`);

      const res = await api.getRecipeProducts({ limit: '500' });
      setProducts(res.data || []);
      setLines([]);
    } catch {
      toast.error('Error al registrar movimientos');
    }
    setSaving(false);
  };

  const totalAdds = lines.filter(l => l.type === 'add' && l.quantity).reduce((sum, l) => sum + (parseFloat(l.quantity) || 0), 0);
  const totalRemoves = lines.filter(l => l.type === 'remove' && l.quantity).reduce((sum, l) => sum + (parseFloat(l.quantity) || 0), 0);
  const validLineCount = lines.filter(l => l.product_id && l.quantity && parseFloat(l.quantity) > 0).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/recetas/inventory"
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-2 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Entrada de Stock</h1>
            <p className="text-sm text-slate-500 mt-1">Registrar movimientos y consultar historial</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-1 flex gap-1">
        <button onClick={() => setTab('entry')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'entry' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}>
          <Plus className="w-4 h-4" /> Nuevo Movimiento
        </button>
        <button onClick={() => setTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'history' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}>
          <History className="w-4 h-4" /> Historial
          {historyTotal > 0 && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {historyTotal}
            </span>
          )}
        </button>
      </div>

      {tab === 'entry' ? (
        <>
          {/* Add Product Button */}
          <div className="flex justify-end">
            <button onClick={addLine}
              className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Agregar producto
            </button>
          </div>

          {/* Lines Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-5"></th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-28">Stock Actual</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-36">Tipo</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-28">Cantidad</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Motivo</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-28">Stock Final</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center">
                        <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No hay productos agregados</p>
                        <button onClick={addLine}
                          className="text-sm text-indigo-600 hover:underline mt-2 inline-flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Agregar primer producto
                        </button>
                      </td>
                    </tr>
                  ) : lines.map(line => {
                    const qty = parseFloat(line.quantity) || 0;
                    const finalStock = line.type === 'add' ? line.current_stock + qty : line.current_stock - qty;
                    const hasStockError = line.type === 'remove' && qty > line.current_stock;
                    return (
                      <tr key={line.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-2 py-3 text-center">
                          <button onClick={() => removeLine(line.id)}
                            className="p-1 text-slate-300 hover:text-rose-500 transition-colors rounded">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="px-4 py-3 relative">
                          {line.product_id ? (
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-amber-500 shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-slate-900">{line.product_name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{line.product_sku}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <button onClick={() => setShowDropdown(showDropdown === line.id ? null : line.id)}
                                className="w-full text-left bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400 hover:border-slate-300 transition-colors">
                                Seleccionar producto...
                              </button>
                              {showDropdown === line.id && (
                                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                  <div className="sticky top-0 bg-white p-2 border-b border-slate-100">
                                    <div className="relative">
                                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                      <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                        className="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Buscar..." autoFocus />
                                    </div>
                                  </div>
                                  {filteredProducts.length === 0 ? (
                                    <p className="p-3 text-xs text-slate-400 text-center">No encontrado</p>
                                  ) : filteredProducts.map(p => (
                                    <button key={p.id} onClick={() => selectProduct(line.id, p)}
                                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0">
                                      <div className="flex items-center gap-2">
                                        <Package className="w-3.5 h-3.5 text-amber-500" />
                                        <div>
                                          <p className="text-xs font-medium text-slate-900">{p.name}</p>
                                          <p className="text-[9px] text-slate-400 font-mono">{p.sku}</p>
                                        </div>
                                      </div>
                                      <span className="text-[10px] text-slate-500">{(Number(p.stock) || 0)} {p.unit_of_measure}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs text-slate-600">
                            {line.product_id ? `${line.current_stock.toLocaleString('es-CL')} ${line.unit}` : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {line.product_id && (
                            <div className="flex gap-1">
                              <button onClick={() => updateLine(line.id, { type: 'add' })}
                                className={`flex-1 py-1.5 rounded-md text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                                  line.type === 'add' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                                }`}>
                                <Plus className="w-3 h-3" /> Ingreso
                              </button>
                              <button onClick={() => updateLine(line.id, { type: 'remove' })}
                                className={`flex-1 py-1.5 rounded-md text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                                  line.type === 'remove' ? 'bg-rose-100 text-rose-700 border border-rose-300' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                                }`}>
                                <Minus className="w-3 h-3" /> Egreso
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {line.product_id && (
                            <div className="flex items-center gap-1.5">
                              <input type="number" step="0.01" min="0" value={line.quantity}
                                onChange={e => updateLine(line.id, { quantity: e.target.value })}
                                className={`w-full bg-slate-50 border rounded-lg px-2.5 py-1.5 text-xs text-right text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                  hasStockError ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                                }`}
                                placeholder="0" />
                              <span className="text-[10px] text-slate-400 shrink-0">{line.unit}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {line.product_id && (
                            <input type="text" value={line.reason}
                              onChange={e => updateLine(line.id, { reason: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="Motivo..." />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {line.product_id && line.quantity && qty > 0 ? (
                            <span className={`text-xs font-bold ${hasStockError ? 'text-rose-600' : line.type === 'add' ? 'text-emerald-600' : 'text-slate-900'}`}>
                              {hasStockError ? '✗' : `${finalStock.toLocaleString('es-CL')} ${line.unit}`}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary & Submit */}
          {lines.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-slate-500">
                    <span className="font-semibold text-slate-900">{validLineCount}</span> producto(s)
                  </span>
                  {totalAdds > 0 && <span className="text-emerald-600">+{totalAdds.toLocaleString('es-CL')} ingreso(s)</span>}
                  {totalRemoves > 0 && <span className="text-rose-600">-{totalRemoves.toLocaleString('es-CL')} egreso(s)</span>}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setLines([])}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Limpiar
                  </button>
                  <button onClick={handleSubmit} disabled={saving || validLineCount === 0}
                    className="bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                    <Check className="w-4 h-4" />
                    {saving ? 'Guardando...' : `Aplicar ${validLineCount} cambio(s)`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* History Tab */
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cantidad</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock Anterior</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock Nuevo</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="border-b border-slate-100">
                      <td colSpan={7} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No hay movimientos registrados</p>
                    </td>
                  </tr>
                ) : history.map(entry => (
                  <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(entry.created_at).toLocaleDateString('es-CL')} {new Date(entry.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs font-medium text-slate-900">{entry.product_name}</p>
                        <p className="text-[9px] text-slate-400 font-mono">{entry.product_sku}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
                        entry.type === 'add'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {entry.type === 'add' ? '+' : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-semibold text-slate-900">
                      {entry.type === 'add' ? '+' : '-'}{Number(entry.quantity).toLocaleString('es-CL')} {entry.unit_of_measure}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500">
                      {Number(entry.previous_stock).toLocaleString('es-CL')}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-semibold text-slate-900">
                      {Number(entry.new_stock).toLocaleString('es-CL')}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{entry.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {historyTotal > 20 && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <p>Mostrando {(historyPage - 1) * 20 + 1}-{Math.min(historyPage * 20, historyTotal)} de {historyTotal}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setHistoryPage(p => Math.max(1, p - 1))} disabled={historyPage === 1}
                  className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40">Anterior</button>
                <button onClick={() => setHistoryPage(p => p + 1)} disabled={historyPage * 20 >= historyTotal}
                  className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40">Siguiente</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

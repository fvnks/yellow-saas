'use client';

import { useState, useEffect } from 'react';
import { Play, FlaskConical, Package, CheckCircle2, AlertTriangle, ShoppingCart } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import QuickSellModal from '@/components/recetas/QuickSellModal';

export default function ProducePage() {
  const [formulas, setFormulas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormula, setSelectedFormula] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [warehouseId, setWarehouseId] = useState('');
  const [notes, setNotes] = useState('');
  const [outputPrice, setOutputPrice] = useState('');
  const [producing, setProducing] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [lastResult, setLastResult] = useState<any>(null);
  const [showQuickSell, setShowQuickSell] = useState(false);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getFormulas({ active: true, limit: 100 }),
      api.getWarehouses({ limit: '100' }),
    ]).then(([formulasRes, whRes]) => {
      setFormulas(formulasRes.data || []);
      setWarehouses(whRes.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadFormulaDetail = async (formulaId: string) => {
    const api = getApiClient();
    const data = await api.getFormula(formulaId);
    setSelectedFormula(data);
    setOutputPrice(data?.output_product?.sale_price ? String(data.output_product.sale_price) : '');
  };

  const handleProduce = async () => {
    if (!selectedFormula) { toast.error('Selecciona una receta'); return; }
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) { toast.error('Cantidad inválida'); return; }

    setProducing(true);
    try {
      const api = getApiClient();
      const result = await api.produceFormula(selectedFormula.id, {
        quantity: qty,
        warehouse_id: warehouseId || undefined,
        notes: notes || undefined,
      });

      if (selectedFormula.output_product_id && outputPrice) {
        const price = parseFloat(outputPrice);
        if (!isNaN(price) && price !== Number(selectedFormula.output_product?.sale_price)) {
          await api.updateRecipeProduct(selectedFormula.output_product_id, { sale_price: price });
        }
      }

      setLastResult(result);
      toast.success(result.message || 'Producción completada');
      setQuantity('1');
      setNotes('');
      loadFormulaDetail(selectedFormula.id);
    } catch (err: any) {
      toast.error(err.message || 'Error al producir');
    }
    setProducing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Producir</h1>
        <p className="text-sm text-slate-500 mt-1">Selecciona una receta y produce</p>
      </div>

      {/* Formula Selector */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Seleccionar Receta</h3>
        {formulas.length === 0 ? (
          <p className="text-sm text-slate-500">No hay recetas activas</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {formulas.map(f => (
              <button key={f.id} onClick={() => loadFormulaDetail(f.id)}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  selectedFormula?.id === f.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{f.name}</p>
                    <p className="text-[10px] text-slate-500">{f.ingredient_count || 0} ingredientes · {Number(f.yield_quantity)} {f.yield_unit}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Production Form */}
      {selectedFormula && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Configurar Producción</h3>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Cantidad a Producir *</label>
              <input type="number" step="0.01" min="0.01" value={quantity} onChange={e => setQuantity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="1" />
              <p className="text-[10px] text-slate-400">
                Se descontarán {quantity ? (parseFloat(quantity) || 0) : 0}x la cantidad de cada ingrediente
              </p>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Bodega</label>
              <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="">Todas las bodegas</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            {selectedFormula.output_product && (
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Precio de Venta del Producto</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                  <input type="number" step="1" min="0" value={outputPrice} onChange={e => setOutputPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0" />
                </div>
                <p className="text-[10px] text-slate-400">
                  {selectedFormula.output_product.name} — se actualizará al producir
                </p>
              </div>
            )}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Notas</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Notas..." />
            </div>
            <button onClick={handleProduce} disabled={producing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              <Play className="w-4 h-4" /> {producing ? 'Produciendo...' : 'Producir'}
            </button>
          </div>

          {/* Ingredients Preview */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Ingredientes (vista previa)</h3>
            <div className="space-y-3">
              {selectedFormula.ingredients?.map((ing: any) => {
                const required = ing.quantity * (parseFloat(quantity) || 0);
                const hasEnough = ing.current_stock >= required;
                return (
                  <div key={ing.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-medium text-slate-900">{ing.product?.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-600">
                        {required} {ing.unit} <span className="text-slate-400">de {ing.current_stock}</span>
                      </span>
                      {hasEnough ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Last Result */}
      {lastResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-emerald-900">Producción Completada</h3>
          </div>
          <p className="text-xs text-emerald-700">{lastResult.message}</p>
          {lastResult.deductions && (
            <div className="mt-3 space-y-1">
              {lastResult.deductions.map((d: any, i: number) => (
                <p key={i} className="text-[10px] text-emerald-600">
                  {d.product}: -{d.required} (disponible: {d.available})
                </p>
              ))}
            </div>
          )}
          {selectedFormula?.output_product && (
            <button onClick={() => setShowQuickSell(true)}
              className="mt-4 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <ShoppingCart className="w-4 h-4" /> Vender producto producido
            </button>
          )}
        </div>
      )}

      {/* Quick Sell Modal */}
      <QuickSellModal
        open={showQuickSell}
        onClose={() => setShowQuickSell(false)}
        productName={selectedFormula?.output_product?.name}
        productId={selectedFormula?.output_product_id}
        defaultPrice={selectedFormula?.output_product?.sale_price || selectedFormula?.output_product?.price || 0}
        defaultQuantity={parseFloat(quantity) || selectedFormula?.yield_quantity || 1}
      />
    </div>
  );
}

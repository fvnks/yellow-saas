'use client';

import { useState, useEffect } from 'react';
import { Play, FlaskConical, Package, CheckCircle2, AlertTriangle, ShoppingCart } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { formatQuantity } from '@/lib/utils';
import { toast } from 'sonner';
import QuickSellModal from '@/components/recetas/QuickSellModal';
import { useRecetasRefresh } from '@/components/recetas/RefreshContext';

export default function ProducePage() {
  const { refreshKey, triggerRefresh } = useRecetasRefresh();
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
  }, [refreshKey]);

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
      triggerRefresh();
      loadFormulaDetail(selectedFormula.id);
    } catch (err: any) {
      toast.error(err.message || 'Error al producir');
    }
    setProducing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Producir</h1>
        <p className="text-sm text-muted-foreground mt-1">Selecciona una receta y produce</p>
      </div>

      {/* Formula Selector */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Seleccionar Receta</h3>
        {formulas.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay recetas activas</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {formulas.map(f => (
              <button key={f.id} onClick={() => loadFormulaDetail(f.id)}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  selectedFormula?.id === f.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-border hover:border-border'
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground">{f.ingredient_count || 0} ingredientes · {formatQuantity(f.yield_quantity, f.yield_unit)}</p>
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
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Configurar Producción</h3>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Cantidad a Producir *</label>
              <input type="number" step="0.01" min="0.01" value={quantity} onChange={e => setQuantity(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                placeholder="1" />
              <p className="text-[10px] text-muted-foreground">
                Se descontarán {quantity ? (parseFloat(quantity) || 0) : 0}x la cantidad de cada ingrediente
              </p>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Bodega</label>
              <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
                <option value="">Todas las bodegas</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            {selectedFormula.output_product && (
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Precio de Venta del Producto</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <input type="number" step="1" min="0" value={outputPrice} onChange={e => setOutputPrice(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg pl-7 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                    placeholder="0" />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {selectedFormula.output_product.name} — se actualizará al producir
                </p>
              </div>
            )}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Notas</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                placeholder="Notas..." />
            </div>
            <button onClick={handleProduce} disabled={producing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              <Play className="w-4 h-4" /> {producing ? 'Produciendo...' : 'Producir'}
            </button>
          </div>

          {/* Ingredients Preview */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Ingredientes (vista previa)</h3>
            <div className="space-y-3">
              {selectedFormula.ingredients?.map((ing: any) => {
                const required = ing.quantity * (parseFloat(quantity) || 0);
                const hasEnough = ing.current_stock >= required;
                return (
                  <div key={ing.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">{ing.product?.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-foreground">
                        {formatQuantity(required, ing.unit)} <span className="text-muted-foreground">de {formatQuantity(ing.current_stock, ing.unit)}</span>
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
              className="mt-4 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
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

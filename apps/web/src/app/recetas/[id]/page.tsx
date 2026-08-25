'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, MoreVertical, Trash2, Play, Package, CheckCircle2, AlertTriangle, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { formatQuantity } from '@/lib/utils';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import QuickSellModal from '@/components/recetas/QuickSellModal';

export default function RecetaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const formulaId = params.id as string;

  const [formula, setFormula] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showProduce, setShowProduce] = useState(false);
  const [produceQty, setProduceQty] = useState('1');
  const [produceWarehouse, setProduceWarehouse] = useState('');
  const [produceNotes, setProduceNotes] = useState('');
  const [producing, setProducing] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [showQuickSell, setShowQuickSell] = useState(false);

  const loadData = async () => {
    try {
      const api = getApiClient();
      const [formulaData, whData] = await Promise.all([
        api.getFormula(formulaId),
        api.getWarehouses({ limit: '100' }),
      ]);
      setFormula(formulaData);
      setWarehouses(whData.data || []);
    } catch (err) {
      toast.error('Error al cargar receta');
    }
    setLoading(false);
  };

  useEffect(() => { if (formulaId) loadData(); }, [formulaId]);

  const handleDelete = async () => {
      if (!confirm('¿Eliminar esta receta?')) return;
    try {
      const api = getApiClient();
      await api.deleteFormula(formulaId);
      toast.success('Receta eliminada');
      router.push('/recetas');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleProduce = async () => {
    const qty = parseFloat(produceQty);
    if (!qty || qty <= 0) { toast.error('Cantidad inválida'); return; }

    setProducing(true);
    try {
      const api = getApiClient();
      const result = await api.produceFormula(formulaId, {
        quantity: qty,
        warehouse_id: produceWarehouse || undefined,
        notes: produceNotes || undefined,
      });
      toast.success(result.message || 'Producción completada');
      setShowProduce(false);
      setProduceQty('1');
      setProduceNotes('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error al producir');
    }
    setProducing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!formula) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-muted-foreground">Receta no encontrada</p>
        <Link href="/recetas" className="text-sm text-primary hover:underline mt-2 inline-block">Volver</Link>
      </div>
    );
  }

  const canProduce = formula.ingredients?.some((i: any) => i.current_stock < i.quantity);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/recetas" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">{formula.name}</h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
                formula.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-muted text-foreground border-border'
              }`}>
                {formula.is_active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            {formula.description && <p className="text-sm text-muted-foreground mt-1">{formula.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {formula.output_product && (
            <button onClick={() => setShowQuickSell(true)}
              className="bg-primary hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <ShoppingCart className="w-4 h-4" /> Vender
            </button>
          )}
          <button onClick={() => setShowProduce(true)} disabled={!formula.is_active}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            <Play className="w-4 h-4" /> Producir
          </button>
          <Link href={`/recetas/${formulaId}/edit`}
            className="bg-card border border-border hover:bg-muted text-foreground px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
            <Edit className="w-3.5 h-3.5" /> Editar
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Producto Salida</p>
          <p className="text-sm font-medium text-foreground mt-1">{formula.output_product?.name || 'Ninguno'}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Rendimiento</p>
          <p className="text-sm font-medium text-foreground mt-1">{formatQuantity(formula.yield_quantity, formula.yield_unit)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Ingredientes</p>
          <p className="text-sm font-medium text-foreground mt-1">{formula.ingredients?.length || 0}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Margen Mín.</p>
          <p className="text-sm font-medium text-foreground mt-1">{formula.min_margin_pct != null ? `${formula.min_margin_pct}%` : '—'}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Margen Máx.</p>
          <p className="text-sm font-medium text-foreground mt-1">{formula.max_margin_pct != null ? `${formula.max_margin_pct}%` : '—'}</p>
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Ingredientes (por {formatQuantity(formula.yield_quantity, formula.yield_unit)})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Cantidad</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Unidad</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Stock Actual</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {formula.ingredients?.map((ing: any) => {
                const hasEnough = ing.current_stock >= ing.quantity;
                return (
                  <tr key={ing.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">{ing.product?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-foreground">{formatQuantity(ing.quantity, ing.unit)}</td>
                    <td className="px-4 py-3 text-xs text-foreground uppercase">{ing.unit}</td>
                    <td className="px-4 py-3 text-right text-xs text-foreground">{formatQuantity(ing.current_stock, ing.unit)}</td>
                    <td className="px-4 py-3 text-center">
                      {hasEnough ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5" /> OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-2.5 h-2.5" /> Stock bajo
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Productions */}
      {formula.productions?.length > 0 && (
        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Producciones Recientes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Cantidad</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Bodega</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Notas</th>
                </tr>
              </thead>
              <tbody>
                {formula.productions.map((p: any) => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="px-4 py-3 text-xs text-foreground">{new Date(p.created_at).toLocaleDateString('es-CL')}</td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-foreground">{formatQuantity(p.quantity, formula.yield_unit)}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{p.warehouse?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{p.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Produce Modal */}
      {showProduce && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowProduce(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Producir</h2>
              <button onClick={() => setShowProduce(false)} className="text-muted-foreground hover:text-foreground text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground">
                Se descontarán los ingredientes del inventario automáticamente.
              </p>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Cantidad a Producir *</label>
                <input type="number" step="0.01" min="0.01" value={produceQty} onChange={e => setProduceQty(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                  placeholder="1" />
                <p className="text-[10px] text-muted-foreground">
                  Se descontarán {produceQty ? (parseFloat(produceQty) || 0) : 0}x la cantidad de cada ingrediente
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Bodega (opcional)</label>
                <select value={produceWarehouse} onChange={e => setProduceWarehouse(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
                  <option value="">Todas las bodegas</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Notas</label>
                <textarea value={produceNotes} onChange={e => setProduceNotes(e.target.value)} rows={2}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                  placeholder="Notas de producción..." />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowProduce(false)}
                className="bg-card border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Cancelar
              </button>
              <button onClick={handleProduce} disabled={producing || !produceQty}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                <Play className="w-4 h-4" /> {producing ? 'Produciendo...' : 'Producir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Sell Modal */}
      <QuickSellModal
        open={showQuickSell}
        onClose={() => setShowQuickSell(false)}
        productName={formula.output_product?.name}
        productId={formula.output_product_id}
        defaultPrice={formula.output_product?.sale_price || formula.output_product?.price || 0}
        defaultQuantity={formula.yield_quantity || 1}
      />
    </div>
  );
}

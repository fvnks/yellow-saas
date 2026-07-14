'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Trash2, Edit, Tag, Percent, Ruler, FlaskConical, Layers, Bookmark, Palette, Hash, Link2, AlertCircle, ExternalLink } from 'lucide-react';
import { getApiClient } from '../../../../lib/api-client';

type ConfigTab = 'categories' | 'taxes' | 'uom' | 'batches' | 'variants' | 'reservations' | 'reasons' | 'tags' | 'serials' | 'relations';

interface Category { id: string; name: string; description: string; color: string; icon: string; is_active: boolean; product_count?: number; }
interface Tax { id: string; code: string; name: string; rate: number; type: string; is_default: boolean; is_active: boolean; }
interface UOM { id: string; code: string; name: string; type: string; conversion_factor: number; is_active: boolean; }
interface Batch { id: string; batch_number: string; quantity: number; status: string; expiry_date: string | null; product: { name: string; sku: string }; warehouse: { name: string }; }
interface Variant { id: string; sku: string; name: string | null; attributes: Record<string, string>; cost_price: number | null; sale_price: number | null; is_active: boolean; product: { name: string; sku: string }; }
interface Reservation { id: string; quantity: number; status: string; reference_type: string | null; expires_at: string | null; product: { name: string; sku: string }; warehouse: { name: string }; }
interface AdjustmentReason { id: string; name: string; description: string | null; is_active: boolean; }
interface ProductTag { id: string; name: string; color: string; is_active: boolean; product_count?: number; }

const typeLabels: Record<string, string> = { weight: 'Peso', volume: 'Volumen', length: 'Longitud', area: 'Area', piece: 'Pieza', time: 'Tiempo' };
const TAG_COLORS = [
  { name: 'indigo', value: '#6366f1' },
  { name: 'emerald', value: '#10b981' },
  { name: 'amber', value: '#f59e0b' },
  { name: 'rose', value: '#f43f5e' },
  { name: 'blue', value: '#3b82f6' },
  { name: 'slate', value: '#64748b' },
];

export default function InventoryConfigPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ConfigTab>('categories');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', description: '', color: '#6366f1' });

  // Taxes
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [taxForm, setTaxForm] = useState({ code: '', name: '', rate: '', type: 'iva' });

  // UOM
  const [uoms, setUoms] = useState<UOM[]>([]);
  const [showUomForm, setShowUomForm] = useState(false);
  const [uomForm, setUomForm] = useState({ code: '', name: '', type: 'piece', conversion_factor: '1' });

  // Batches
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchForm, setBatchForm] = useState({ product_id: '', warehouse_id: '', batch_number: '', quantity: '0', expiry_date: '' });
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  // Variants
  const [variants, setVariants] = useState<Variant[]>([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [variantForm, setVariantForm] = useState({ product_id: '', sku: '', name: '', attributes: {} as Record<string, string>, cost_price: '', sale_price: '' });
  const [attrKey, setAttrKey] = useState('');
  const [attrVal, setAttrVal] = useState('');

  // Reservations
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Adjustment Reasons
  const [reasons, setReasons] = useState<AdjustmentReason[]>([]);
  const [showReasonForm, setShowReasonForm] = useState(false);
  const [editingReason, setEditingReason] = useState<AdjustmentReason | null>(null);
  const [reasonForm, setReasonForm] = useState({ name: '', description: '' });

  // Tags (inline)
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [showTagForm, setShowTagForm] = useState(false);
  const [editingTag, setEditingTag] = useState<ProductTag | null>(null);
  const [tagForm, setTagForm] = useState({ name: '', color: '#6366f1' });

  useEffect(() => { loadTab(); }, [activeTab, search]);

  const loadTab = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const searchParam: Record<string, string> = search ? { search } : {};
      switch (activeTab) {
        case 'categories': { const r = await api.getCategories({ limit: '200', ...searchParam }); setCategories(r.data || []); break; }
        case 'taxes': { const r = await api.getTaxes({ limit: '200', ...searchParam }); setTaxes(r.data || []); break; }
        case 'uom': { const r = await api.getUnitsOfMeasure({ limit: '200' }); setUoms(r.data || []); break; }
        case 'batches': {
          const [bRes, pRes, wRes] = await Promise.all([
            api.getProductBatches({ limit: '100', ...searchParam }),
            api.getProducts({ limit: '200' }),
            api.getWarehouses({ limit: '100' }),
          ]);
          setBatches(bRes.data || []); setProducts(pRes.data || []); setWarehouses(wRes.data || []);
          break;
        }
        case 'variants': {
          const [vRes, pRes] = await Promise.all([
            api.getProductVariants({ limit: '200', ...searchParam }),
            api.getProducts({ limit: '200' }),
          ]);
          setVariants(vRes.data || []); setProducts(pRes.data || []);
          break;
        }
        case 'reservations': { const r = await api.getStockReservations({ limit: '100' }); setReservations(r.data || []); break; }
        case 'reasons': { const r = await api.getAdjustmentReasons({ limit: '200', ...searchParam }); setReasons(r.data || []); break; }
        case 'tags': { const r = await api.getProductTags({ limit: '200', ...searchParam }); setTags(r.data || []); break; }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // --- Category handlers ---
  const saveCat = async () => {
    if (!catForm.name) return;
    const api = getApiClient();
    await api.createCategory(catForm);
    setShowCatForm(false); setCatForm({ name: '', description: '', color: '#6366f1' }); loadTab();
  };
  const deleteCat = async (id: string) => { if (!confirm('Eliminar?')) return; await getApiClient().deleteCategory(id); loadTab(); };

  // --- Tax handlers ---
  const saveTax = async () => {
    if (!taxForm.code || !taxForm.name || !taxForm.rate) return;
    await getApiClient().createTax({ ...taxForm, rate: Number(taxForm.rate) } as any);
    setShowTaxForm(false); setTaxForm({ code: '', name: '', rate: '', type: 'iva' }); loadTab();
  };
  const deleteTax = async (id: string) => { if (!confirm('Eliminar?')) return; await getApiClient().deleteTax(id); loadTab(); };

  // --- UOM handlers ---
  const saveUom = async () => {
    if (!uomForm.code || !uomForm.name) return;
    await getApiClient().createUnitOfMeasure({ ...uomForm, conversion_factor: Number(uomForm.conversion_factor) } as any);
    setShowUomForm(false); setUomForm({ code: '', name: '', type: 'piece', conversion_factor: '1' }); loadTab();
  };
  const deleteUom = async (id: string) => { if (!confirm('Eliminar?')) return; await getApiClient().deleteUnitOfMeasure(id); loadTab(); };

  // --- Batch handlers ---
  const saveBatch = async () => {
    if (!batchForm.product_id || !batchForm.warehouse_id || !batchForm.batch_number) return;
    await getApiClient().createProductBatch({ ...batchForm, quantity: Number(batchForm.quantity), expiry_date: batchForm.expiry_date || undefined } as any);
    setShowBatchForm(false); setBatchForm({ product_id: '', warehouse_id: '', batch_number: '', quantity: '0', expiry_date: '' }); loadTab();
  };
  const deleteBatch = async (id: string) => { if (!confirm('Eliminar?')) return; await getApiClient().deleteProductBatch(id); loadTab(); };

  // --- Variant handlers ---
  const addAttr = () => {
    if (!attrKey.trim()) return;
    setVariantForm({ ...variantForm, attributes: { ...variantForm.attributes, [attrKey.trim()]: attrVal } });
    setAttrKey(''); setAttrVal('');
  };
  const saveVariant = async () => {
    if (!variantForm.product_id || !variantForm.sku) return;
    await getApiClient().createProductVariant({
      product_id: variantForm.product_id, sku: variantForm.sku, name: variantForm.name || undefined,
      attributes: variantForm.attributes, cost_price: variantForm.cost_price ? Number(variantForm.cost_price) : undefined,
      sale_price: variantForm.sale_price ? Number(variantForm.sale_price) : undefined,
    });
    setShowVariantForm(false); setVariantForm({ product_id: '', sku: '', name: '', attributes: {}, cost_price: '', sale_price: '' }); loadTab();
  };
  const deleteVariant = async (id: string) => { if (!confirm('Eliminar?')) return; await getApiClient().deleteProductVariant(id); loadTab(); };

  // --- Reservation handlers ---
  const releaseReservation = async (id: string) => { if (!confirm('Liberar?')) return; await getApiClient().releaseStockReservation(id); loadTab(); };

  // --- Adjustment Reason handlers ---
  const saveReason = async () => {
    if (!reasonForm.name) return;
    const api = getApiClient();
    if (editingReason) {
      await api.updateAdjustmentReason(editingReason.id, reasonForm);
    } else {
      await api.createAdjustmentReason(reasonForm);
    }
    setShowReasonForm(false); setEditingReason(null); setReasonForm({ name: '', description: '' }); loadTab();
  };
  const editReason = (r: AdjustmentReason) => { setEditingReason(r); setReasonForm({ name: r.name, description: r.description || '' }); setShowReasonForm(true); };
  const deleteReason = async (id: string) => { if (!confirm('Eliminar motivo?')) return; await getApiClient().deleteAdjustmentReason(id); loadTab(); };

  // --- Tag handlers (inline) ---
  const saveTag = async () => {
    if (!tagForm.name) return;
    const api = getApiClient();
    if (editingTag) {
      await api.updateProductTag(editingTag.id, tagForm);
    } else {
      await api.createProductTag(tagForm);
    }
    setShowTagForm(false); setEditingTag(null); setTagForm({ name: '', color: '#6366f1' }); loadTab();
  };
  const editTag = (t: ProductTag) => { setEditingTag(t); setTagForm({ name: t.name, color: t.color }); setShowTagForm(true); };
  const deleteTag = async (id: string) => { if (!confirm('Eliminar tag?')) return; await getApiClient().deleteProductTag(id); loadTab(); };

  const tabs: { id: ConfigTab; label: string; icon: any; count: number }[] = [
    { id: 'categories', label: 'Categorias', icon: Tag, count: categories.length },
    { id: 'taxes', label: 'Impuestos', icon: Percent, count: taxes.length },
    { id: 'uom', label: 'Unidades', icon: Ruler, count: uoms.length },
    { id: 'batches', label: 'Lotes', icon: FlaskConical, count: batches.length },
    { id: 'variants', label: 'Variantes', icon: Layers, count: variants.length },
    { id: 'reservations', label: 'Reservas', icon: Bookmark, count: reservations.length },
    { id: 'reasons', label: 'Motivos', icon: AlertCircle, count: reasons.length },
    { id: 'tags', label: 'Tags', icon: Palette, count: tags.length },
    { id: 'serials', label: 'Seriales', icon: Hash, count: 0 },
    { id: 'relations', label: 'Relaciones', icon: Link2, count: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5 text-slate-600" /></button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Configuracion de Inventario</h1>
            <p className="text-sm text-slate-500 mt-1">Categorias, impuestos, unidades, lotes, variantes y reservas</p>
          </div>
        </div>
        {(activeTab === 'categories' || activeTab === 'taxes' || activeTab === 'uom' || activeTab === 'batches' || activeTab === 'variants' || activeTab === 'reasons' || activeTab === 'tags') && (
          <button onClick={() => {
            if (activeTab === 'categories') { setShowCatForm(true); setCatForm({ name: '', description: '', color: '#6366f1' }); }
            if (activeTab === 'taxes') { setShowTaxForm(true); setTaxForm({ code: '', name: '', rate: '', type: 'iva' }); }
            if (activeTab === 'uom') { setShowUomForm(true); setUomForm({ code: '', name: '', type: 'piece', conversion_factor: '1' }); }
            if (activeTab === 'batches') setShowBatchForm(true);
            if (activeTab === 'variants') setShowVariantForm(true);
            if (activeTab === 'reasons') { setShowReasonForm(true); setEditingReason(null); setReasonForm({ name: '', description: '' }); }
            if (activeTab === 'tags') { setShowTagForm(true); setEditingTag(null); setTagForm({ name: '', color: '#6366f1' }); }
          }}
            className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Nuevo
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearch(''); setShowCatForm(false); setShowTaxForm(false); setShowUomForm(false); setShowBatchForm(false); setShowVariantForm(false); setShowReasonForm(false); setShowTagForm(false); }}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}>
                <Icon className="w-4 h-4" /> {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        {activeTab !== 'reservations' && (
          <div className="p-4 border-b border-slate-100">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
          </div>
        )}

        <div className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}</div>
          ) : (
            <>
              {/* ========== CATEGORIES ========== */}
              {activeTab === 'categories' && (
                <>
                  {showCatForm && (
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input type="text" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} placeholder="Nombre categoria" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="text" value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} placeholder="Descripcion" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <div className="flex gap-2">
                          <input type="color" value={catForm.color} onChange={e => setCatForm({...catForm, color: e.target.value})} className="w-10 h-10 rounded border border-slate-200 cursor-pointer" />
                          <button onClick={saveCat} className="bg-slate-900 hover:bg-black text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">Guardar</button>
                          <button onClick={() => setShowCatForm(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">X</button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Color</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Descripcion</th>
                        <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                      </tr></thead>
                      <tbody>
                        {categories.map(c => (
                          <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2"><div className="w-4 h-4 rounded" style={{ backgroundColor: c.color }} /></td>
                            <td className="px-4 py-2 text-xs font-medium text-slate-900">{c.name}</td>
                            <td className="px-4 py-2 text-xs text-slate-500">{c.description || '-'}</td>
                            <td className="px-4 py-2"><div className="flex justify-end"><button onClick={() => deleteCat(c.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {categories.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No hay categorias</div>}
                  </div>
                </>
              )}

              {/* ========== TAXES ========== */}
              {activeTab === 'taxes' && (
                <>
                  {showTaxForm && (
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <input type="text" value={taxForm.code} onChange={e => setTaxForm({...taxForm, code: e.target.value})} placeholder="Codigo (IVA-19)" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="text" value={taxForm.name} onChange={e => setTaxForm({...taxForm, name: e.target.value})} placeholder="Nombre" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="number" value={taxForm.rate} onChange={e => setTaxForm({...taxForm, rate: e.target.value})} placeholder="Tasa %" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <div className="flex gap-2">
                          <select value={taxForm.type} onChange={e => setTaxForm({...taxForm, type: e.target.value})} className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="iva">IVA</option><option value="exento">Exento</option><option value="otro">Otro</option>
                          </select>
                          <button onClick={saveTax} className="bg-slate-900 hover:bg-black text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">Guardar</button>
                          <button onClick={() => setShowTaxForm(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">X</button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Codigo</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                        <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tasa</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                        <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                      </tr></thead>
                      <tbody>
                        {taxes.map(t => (
                          <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2 text-xs font-mono font-semibold text-slate-900">{t.code}</td>
                            <td className="px-4 py-2 text-xs font-medium text-slate-900">{t.name}</td>
                            <td className="px-4 py-2 text-center text-xs font-bold text-slate-900">{t.rate}%</td>
                            <td className="px-4 py-2"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase">{t.type}</span></td>
                            <td className="px-4 py-2"><div className="flex justify-end"><button onClick={() => deleteTax(t.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {taxes.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No hay impuestos</div>}
                  </div>
                </>
              )}

              {/* ========== UOM ========== */}
              {activeTab === 'uom' && (
                <>
                  {showUomForm && (
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <input type="text" value={uomForm.code} onChange={e => setUomForm({...uomForm, code: e.target.value})} placeholder="Codigo (kg)" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="text" value={uomForm.name} onChange={e => setUomForm({...uomForm, name: e.target.value})} placeholder="Nombre" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <select value={uomForm.type} onChange={e => setUomForm({...uomForm, type: e.target.value})} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <div className="flex gap-2">
                          <input type="number" step="0.000001" value={uomForm.conversion_factor} onChange={e => setUomForm({...uomForm, conversion_factor: e.target.value})} placeholder="Factor" className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                          <button onClick={saveUom} className="bg-slate-900 hover:bg-black text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">Guardar</button>
                          <button onClick={() => setShowUomForm(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">X</button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Codigo</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                        <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Factor</th>
                        <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                      </tr></thead>
                      <tbody>
                        {uoms.map(u => (
                          <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2 text-xs font-mono font-semibold text-slate-900">{u.code}</td>
                            <td className="px-4 py-2 text-xs font-medium text-slate-900">{u.name}</td>
                            <td className="px-4 py-2"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">{typeLabels[u.type] || u.type}</span></td>
                            <td className="px-4 py-2 text-center text-xs text-slate-700">{u.conversion_factor}</td>
                            <td className="px-4 py-2"><div className="flex justify-end"><button onClick={() => deleteUom(u.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {uoms.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No hay unidades</div>}
                  </div>
                </>
              )}

              {/* ========== BATCHES ========== */}
              {activeTab === 'batches' && (
                <>
                  {showBatchForm && (
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <select value={batchForm.product_id} onChange={e => setBatchForm({...batchForm, product_id: e.target.value})} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="">Producto...</option>{products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <select value={batchForm.warehouse_id} onChange={e => setBatchForm({...batchForm, warehouse_id: e.target.value})} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="">Bodega...</option>{warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                        <input type="text" value={batchForm.batch_number} onChange={e => setBatchForm({...batchForm, batch_number: e.target.value})} placeholder="Lote..." className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="number" value={batchForm.quantity} onChange={e => setBatchForm({...batchForm, quantity: e.target.value})} placeholder="Cantidad" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="date" value={batchForm.expiry_date} onChange={e => setBatchForm({...batchForm, expiry_date: e.target.value})} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <div className="flex gap-2">
                          <button onClick={saveBatch} className="bg-slate-900 hover:bg-black text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">Guardar</button>
                          <button onClick={() => setShowBatchForm(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">X</button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Lote</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                        <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cantidad</th>
                        <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Vencimiento</th>
                        <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                      </tr></thead>
                      <tbody>
                        {batches.map(b => (
                          <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2 text-xs font-mono font-semibold text-slate-900">{b.batch_number}</td>
                            <td className="px-4 py-2 text-xs text-slate-700">{b.product?.name}</td>
                            <td className="px-4 py-2 text-xs text-slate-700">{b.warehouse?.name}</td>
                            <td className="px-4 py-2 text-center text-xs font-bold text-slate-900">{b.quantity}</td>
                            <td className="px-4 py-2 text-center text-xs text-slate-500">{b.expiry_date ? new Date(b.expiry_date).toLocaleDateString('es-CL') : '-'}</td>
                            <td className="px-4 py-2"><div className="flex justify-end"><button onClick={() => deleteBatch(b.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {batches.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No hay lotes</div>}
                  </div>
                </>
              )}

              {/* ========== VARIANTS ========== */}
              {activeTab === 'variants' && (
                <>
                  {showVariantForm && (
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                        <select value={variantForm.product_id} onChange={e => setVariantForm({...variantForm, product_id: e.target.value})} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="">Producto...</option>{products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input type="text" value={variantForm.sku} onChange={e => setVariantForm({...variantForm, sku: e.target.value})} placeholder="SKU variante" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="text" value={variantForm.name} onChange={e => setVariantForm({...variantForm, name: e.target.value})} placeholder="Nombre (Rojo L)" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="number" value={variantForm.cost_price} onChange={e => setVariantForm({...variantForm, cost_price: e.target.value})} placeholder="Costo" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="number" value={variantForm.sale_price} onChange={e => setVariantForm({...variantForm, sale_price: e.target.value})} placeholder="Precio" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <div className="flex gap-2">
                          <button onClick={saveVariant} className="bg-slate-900 hover:bg-black text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">Guardar</button>
                          <button onClick={() => setShowVariantForm(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">X</button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={attrKey} onChange={e => setAttrKey(e.target.value)} placeholder="Atributo (color)" className="w-32 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="text" value={attrVal} onChange={e => setAttrVal(e.target.value)} placeholder="Valor (Rojo)" className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <button onClick={addAttr} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">+ Atributo</button>
                      </div>
                      {Object.keys(variantForm.attributes).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {Object.entries(variantForm.attributes).map(([k, v]) => (
                            <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[9px] font-semibold">
                              {k}: {v}
                              <button onClick={() => { const a = {...variantForm.attributes}; delete a[k]; setVariantForm({...variantForm, attributes: a}); }} className="text-indigo-400 hover:text-indigo-600">&times;</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Atributos</th>
                        <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Precio</th>
                        <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                      </tr></thead>
                      <tbody>
                        {variants.map(v => (
                          <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2 text-xs font-mono font-semibold text-slate-900">{v.sku}</td>
                            <td className="px-4 py-2 text-xs text-slate-700">{v.product?.name}</td>
                            <td className="px-4 py-2"><div className="flex flex-wrap gap-1">{Object.entries(v.attributes || {}).map(([k, val]) => (
                              <span key={k} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px]">{k}: {val}</span>
                            ))}</div></td>
                            <td className="px-4 py-2 text-right text-xs text-slate-700">{v.sale_price ? `$${v.sale_price.toLocaleString()}` : '-'}</td>
                            <td className="px-4 py-2"><div className="flex justify-end"><button onClick={() => deleteVariant(v.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {variants.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No hay variantes</div>}
                  </div>
                </>
              )}

              {/* ========== RESERVATIONS ========== */}
              {activeTab === 'reservations' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cantidad</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Expira</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                      <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                    </tr></thead>
                    <tbody>
                      {reservations.map(r => (
                        <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2 text-xs font-medium text-slate-900">{r.product?.name}</td>
                          <td className="px-4 py-2 text-xs text-slate-700">{r.warehouse?.name}</td>
                          <td className="px-4 py-2 text-center text-xs font-bold text-slate-900">{r.quantity}</td>
                          <td className="px-4 py-2 text-xs text-slate-500 capitalize">{r.reference_type}</td>
                          <td className="px-4 py-2 text-center text-xs text-slate-500">{r.expires_at ? new Date(r.expires_at).toLocaleDateString('es-CL') : '-'}</td>
                          <td className="px-4 py-2 text-center"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${r.status === 'active' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>{r.status === 'active' ? 'Activa' : r.status}</span></td>
                          <td className="px-4 py-2"><div className="flex justify-end">{r.status === 'active' && (
                            <button onClick={() => releaseReservation(r.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors text-[9px] font-medium">Liberar</button>
                          )}</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reservations.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No hay reservas</div>}
                </div>
              )}

              {/* ========== REASONS ========== */}
              {activeTab === 'reasons' && (
                <>
                  {showReasonForm && (
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input type="text" value={reasonForm.name} onChange={e => setReasonForm({...reasonForm, name: e.target.value})} placeholder="Nombre del motivo" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="text" value={reasonForm.description} onChange={e => setReasonForm({...reasonForm, description: e.target.value})} placeholder="Descripcion (opcional)" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <div className="flex gap-2">
                          <button onClick={saveReason} className="bg-slate-900 hover:bg-black text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">{editingReason ? 'Actualizar' : 'Guardar'}</button>
                          <button onClick={() => { setShowReasonForm(false); setEditingReason(null); }} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">X</button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Descripcion</th>
                        <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                        <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                      </tr></thead>
                      <tbody>
                        {reasons.map(r => (
                          <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2 text-xs font-medium text-slate-900">{r.name}</td>
                            <td className="px-4 py-2 text-xs text-slate-500">{r.description || '-'}</td>
                            <td className="px-4 py-2 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${r.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                {r.is_active ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="px-4 py-2"><div className="flex justify-end gap-1">
                              <button onClick={() => editReason(r)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                              <button onClick={() => deleteReason(r.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {reasons.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No hay motivos de ajuste</div>}
                  </div>
                </>
              )}

              {/* ========== TAGS (INLINE) ========== */}
              {activeTab === 'tags' && (
                <>
                  {showTagForm && (
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input type="text" value={tagForm.name} onChange={e => setTagForm({...tagForm, name: e.target.value})} placeholder="Nombre del tag" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <div className="flex gap-2 items-center">
                          {TAG_COLORS.map(c => (
                            <button key={c.name} onClick={() => setTagForm({...tagForm, color: c.value})}
                              className={`w-8 h-8 rounded-lg border-2 transition-all ${tagForm.color === c.value ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-105'}`}
                              style={{ backgroundColor: c.value }} title={c.name} />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={saveTag} className="bg-slate-900 hover:bg-black text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">{editingTag ? 'Actualizar' : 'Guardar'}</button>
                          <button onClick={() => { setShowTagForm(false); setEditingTag(null); }} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">X</button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Color</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                        <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Productos</th>
                        <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                      </tr></thead>
                      <tbody>
                        {tags.map(t => (
                          <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2"><div className="w-4 h-4 rounded" style={{ backgroundColor: t.color }} /></td>
                            <td className="px-4 py-2 text-xs font-medium text-slate-900">{t.name}</td>
                            <td className="px-4 py-2 text-center text-xs text-slate-500">{t.product_count ?? 0}</td>
                            <td className="px-4 py-2"><div className="flex justify-end gap-1">
                              <button onClick={() => editTag(t)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                              <button onClick={() => deleteTag(t.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {tags.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No hay tags</div>}
                  </div>
                </>
              )}

              {/* ========== SERIALS (LINK) ========== */}
              {activeTab === 'serials' && (
                <div className="p-8 text-center">
                  <Hash className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 mb-4">Gestion de numeros de serie por producto</p>
                  <a href="/dashboard/inventory/serials" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Ir a Seriales <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* ========== RELATIONS (LINK) ========== */}
              {activeTab === 'relations' && (
                <div className="p-8 text-center">
                  <Link2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 mb-4">Conecta productos relacionados entre si</p>
                  <a href="/dashboard/inventory/relations" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Ir a Relaciones <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

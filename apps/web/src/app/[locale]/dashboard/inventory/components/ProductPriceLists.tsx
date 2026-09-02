'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Star, Edit3, X, Check, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface PriceListItem {
  product_id: string;
  product_name: string;
  sku: string;
  unit_price: number;
  min_quantity: number;
  discount_pct: number;
  sale_price: number;
}

interface PriceList {
  id: string;
  name: string;
  description: string;
  currency: string;
  is_default: boolean;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  item_count: number;
  items?: PriceListItem[];
}

export default function ProductPriceLists() {
  const [lists, setLists] = useState<PriceList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedList, setSelectedList] = useState<PriceList | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '', description: '', currency: 'CLP', is_default: false,
    valid_from: '', valid_until: '',
  });
  const [newItem, setNewItem] = useState({ product_id: '', unit_price: 0, min_quantity: 1, discount_pct: 0 });

  useEffect(() => { loadLists(); loadProducts(); }, []);

  const loadLists = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/price-lists`);
      if (res.ok) {
        const json = await res.json();
        setLists(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadProducts = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/products?limit=200`);
      if (res.ok) {
        const json = await res.json();
        setProducts(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e) { console.error(e); }
  };

  const loadListDetail = async (listId: string) => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/price-lists/${listId}`);
      if (res.ok) {
        const json = await res.json();
        setSelectedList(json.data);
      }
    } catch (e) { toast.error('Error al cargar lista'); }
  };

  const handleCreate = async () => {
    if (!form.name) { toast.error('Nombre requerido'); return; }
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/price-lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Lista creada');
        setShowCreate(false);
        setForm({ name: '', description: '', currency: 'CLP', is_default: false, valid_from: '', valid_until: '' });
        loadLists();
      }
    } catch (e) { toast.error('Error al crear'); }
  };

  const handleAddItem = async () => {
    if (!selectedList || !newItem.product_id || newItem.unit_price <= 0) {
      toast.error('Producto y precio requeridos'); return;
    }
    try {
      const companyId = localStorage.getItem('company_id');
      const existingItems = selectedList.items || [];
      const res = await fetch(`/api/companies/${companyId}/price-lists/${selectedList.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [...existingItems, newItem] }),
      });
      if (res.ok) {
        toast.success('Item agregado');
        setNewItem({ product_id: '', unit_price: 0, min_quantity: 1, discount_pct: 0 });
        loadListDetail(selectedList.id);
      }
    } catch (e) { toast.error('Error al agregar'); }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!selectedList) return;
    try {
      const companyId = localStorage.getItem('company_id');
      const items = (selectedList.items || []).filter(i => i.product_id !== productId);
      const res = await fetch(`/api/companies/${companyId}/price-lists/${selectedList.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        toast.success('Item eliminado');
        loadListDetail(selectedList.id);
      }
    } catch (e) { toast.error('Error al eliminar'); }
  };

  const handleDelete = async (listId: string) => {
    if (!confirm('Eliminar lista de precios?')) return;
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/price-lists/${listId}`, { method: 'DELETE' });
      toast.success('Lista eliminada');
      loadLists();
    } catch (e) { toast.error('Error al eliminar'); }
  };

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
            Listas de Precios ({lists.length})
          </span>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nueva Lista
        </button>
      </div>

      {showCreate && (
        <div className="bg-muted border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Crear Lista de Precios</span>
            <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-muted rounded">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white"
              placeholder="Nombre de la lista" />
            <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white">
              <option value="CLP">CLP - Peso Chileno</option>
              <option value="USD">USD - Dolar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="col-span-2 bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white"
              placeholder="Descripcion (opcional)" />
            <div className="flex items-center gap-2">
              <input type="date" value={form.valid_from} onChange={e => setForm({ ...form, valid_from: e.target.value })}
                className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white" />
              <span className="text-xs text-muted-foreground">a</span>
              <input type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })}
                className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card dark:border-border dark:text-white" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20" />
              <span className="text-xs text-foreground">Lista por defecto</span>
            </label>
          </div>
          <button onClick={handleCreate}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Crear Lista
          </button>
        </div>
      )}

      {selectedList && (
        <div className="bg-card border border-border rounded-xl overflow-hidden dark:bg-primary dark:border-border">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-foreground">{selectedList.name}</h3>
              {selectedList.is_default && (
                <span className="px-2 py-0.5 bg-blue-50 text-primary text-[9px] font-semibold rounded-full">Default</span>
              )}
            </div>
            <button onClick={() => setSelectedList(null)}
              className="px-3 py-1.5 bg-card border border-border hover:bg-muted text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground dark:bg-card dark:border-border dark:hover:bg-primary/90 dark:text-foreground rounded-lg text-xs font-medium transition-colors">
              Cerrar
            </button>
          </div>

          <div className="px-6 py-3 border-b border-border bg-muted">
            <div className="flex items-center gap-2">
              <select value={newItem.product_id} onChange={e => setNewItem({ ...newItem, product_id: e.target.value })}
                className="flex-1 bg-card border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none dark:bg-card dark:border-border dark:text-white focus:ring-2 focus:ring-primary/20">
                <option value="">Producto...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
              <input type="number" value={newItem.unit_price || ''} onChange={e => setNewItem({ ...newItem, unit_price: Number(e.target.value) })}
                className="w-28 bg-card border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none dark:bg-card dark:border-border dark:text-white focus:ring-2 focus:ring-primary/20"
                placeholder="Precio" />
              <input type="number" value={newItem.min_quantity} onChange={e => setNewItem({ ...newItem, min_quantity: Number(e.target.value) })}
                min={1} className="w-20 bg-card border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none dark:bg-card dark:border-border dark:text-white focus:ring-2 focus:ring-primary/20"
                placeholder="Min" />
              <button onClick={handleAddItem}
                className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-medium transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">SKU</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Precio Lista</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Precio Normal</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Cant. Min</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Desc.</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {selectedList.items?.map(item => (
                  <tr key={item.product_id} className="border-b border-border hover:bg-muted">
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{item.product_name}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{item.sku}</td>
                    <td className="px-4 py-3 text-xs text-right font-bold text-primary">${item.unit_price}</td>
                    <td className="px-4 py-3 text-xs text-right text-foreground">${item.sale_price}</td>
                    <td className="px-4 py-3 text-xs text-right text-foreground">{item.min_quantity}</td>
                    <td className="px-4 py-3 text-xs text-right text-foreground">{item.discount_pct}%</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleRemoveItem(item.product_id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!selectedList && (
        lists.length === 0 ? (
          <div className="text-center py-12 bg-muted border border-dashed border-border rounded-xl">
            <Tag className="w-8 h-8 text-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Sin listas de precios configuradas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lists.map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl hover:shadow-sm transition-all cursor-pointer"
                onClick={() => loadListDetail(l.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Tag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{l.name}</p>
                      {l.is_default && (
                        <span className="px-1.5 py-0.5 bg-blue-50 text-primary text-[8px] font-semibold rounded">DEFAULT</span>
                      )}
                    </div>
                    <p className="text-[9px] text-muted-foreground">{l.currency} | {l.item_count} productos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {l.valid_until && (
                    <span className="text-[9px] text-muted-foreground">
                      Vence: {new Date(l.valid_until).toLocaleDateString('es-CL')}
                    </span>
                  )}
                  <button onClick={e => { e.stopPropagation(); handleDelete(l.id); }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

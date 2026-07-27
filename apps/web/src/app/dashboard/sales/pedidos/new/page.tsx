'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Package } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface OrderItem {
  product_id: string;
  quantity: number;
  notes: string;
}

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [warehouseId, setWarehouseId] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([
    { product_id: '', quantity: 1, notes: '' },
  ]);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getWarehouses(),
      api.getProducts({ limit: '500' }),
    ]).then(([w, p]) => {
      setWarehouses(w.data || []);
      setProducts(p.data || []);
    });
  }, []);

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addItem = () => {
    setItems(prev => [...prev, { product_id: '', quantity: 1, notes: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId) { setError('Selecciona una bodega destino'); return; }
    const validItems = items.filter(i => i.product_id && i.quantity > 0);
    if (validItems.length === 0) { setError('Agrega al menos un producto'); return; }

    setLoading(true);
    setError('');
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/internal-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouse_id: warehouseId,
          priority,
          notes,
          items: validItems,
        }),
      });
      if (!res.ok) throw new Error('Error al crear el pedido');
      router.push('/dashboard/sales/pedidos');
    } catch (err: any) {
      setError(err.message || 'Error al crear el pedido');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <button onClick={() => router.push('/dashboard/sales/pedidos')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="w-4 h-4" /> Volver a Pedidos
      </button>

      <div>
        <h1 className="text-xl font-bold text-slate-900">Nuevo Pedido Interno</h1>
        <p className="text-sm text-slate-500 mt-1">Solicitar productos para una bodega</p>
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Información del Pedido</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Bodega Destino *</label>
              <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="">Seleccionar bodega...</option>
                {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Prioridad</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="low">Baja</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Notas</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Motivo del pedido..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Productos a Solicitar</h3>
            <button type="button" onClick={addItem}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Agregar
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-8">#</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-24">Cantidad</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Notas</th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      <select value={item.product_id} onChange={e => handleItemChange(index, 'product_id', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        <option value="">Seleccionar producto...</option>
                        {products.map((p: any) => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="1" value={item.quantity}
                        onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="text" value={item.notes} placeholder="Opcional..."
                        onChange={e => handleItemChange(index, 'notes', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => removeItem(index)} disabled={items.length === 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors disabled:opacity-40">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => router.push('/dashboard/sales/pedidos')}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? 'Creando...' : 'Crear Pedido'}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@yellow-erp/ui';
import { Plus, Search, Package, Layers, Trash2, Edit, ChevronDown, ChevronUp, Calculator } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '../../../../../lib/api-client';

interface BOMItem {
  id: string;
  parent_product_id: string;
  component_product_id: string;
  quantity: number;
  unit_of_measure: string;
  scrap_percent: number;
  is_optional: boolean;
  sort_order: number;
  parent_product: { id: string; name: string; sku: string; unit_of_measure: string; cost_price: number };
  component_product: { id: string; name: string; sku: string; unit_of_measure: string; cost_price: number; sale_price: number };
}

export default function BOMsPage() {
  const [boms, setBoms] = useState<BOMItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    parent_product_id: '',
    component_product_id: '',
    quantity: 1,
    unit_of_measure: 'UN',
    scrap_percent: 0,
    is_optional: false,
    sort_order: 0,
  });
  const [parentProducts, setParentProducts] = useState<{ id: string; name: string; sku: string }[]>([]);
  const [componentProducts, setComponentProducts] = useState<{ id: string; name: string; sku: string; cost_price: number }[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBOMs();
    loadProducts();
  }, [search]);

  const loadBOMs = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const res = await api.getProductBOMs({ search, limit: '200' });
      setBoms(res.data || []);
    } catch (err) {
      setError('Error cargando BOMs');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const api = getApiClient();
      const [parentsRes, componentsRes] = await Promise.all([
        api.getProducts({ type: 'combo', limit: '500', include_inactive: 'true' }),
        api.getProducts({ limit: '500', include_inactive: 'true' }),
      ]);
      setParentProducts((parentsRes.data || []).map((p: any) => ({ id: p.id, name: p.name, sku: p.sku })));
      setComponentProducts((componentsRes.data || []).map((p: any) => ({ id: p.id, name: p.name, sku: p.sku, cost_price: p.cost_price || 0 })));
    } catch (err) {
      console.error('Error loading products', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const api = getApiClient();
      if (editingId) {
        await api.updateProductBOM(editingId, formData);
      } else {
        await api.createProductBOM(formData);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadBOMs();
    } catch (err: any) {
      setError(err.message || 'Error guardando BOM');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este componente del BOM?')) return;
    try {
      const api = getApiClient();
      await api.deleteProductBOM(id);
      loadBOMs();
    } catch (err) {
      setError('Error eliminando BOM');
    }
  };

  const handleEdit = (bom: BOMItem) => {
    setFormData({
      parent_product_id: bom.parent_product_id,
      component_product_id: bom.component_product_id,
      quantity: bom.quantity,
      unit_of_measure: bom.unit_of_measure,
      scrap_percent: bom.scrap_percent,
      is_optional: bom.is_optional,
      sort_order: bom.sort_order,
    });
    setEditingId(bom.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      parent_product_id: '',
      component_product_id: '',
      quantity: 1,
      unit_of_measure: 'UN',
      scrap_percent: 0,
      is_optional: false,
      sort_order: 0,
    });
  };

  const handleExplode = async (productId: string) => {
    try {
      const api = getApiClient();
      const res = await api.explodeBOM(productId, 1);
      alert(`Explosión BOM: ${res.data?.components?.length || 0} componentes\nCosto estimado total: $${res.data?.total_estimated_cost?.toLocaleString('es-CL') || 0}`);
    } catch (err) {
      setError('Error calculando explosión');
    }
  };

  const filteredBoms = boms;

  const groupedBoms = filteredBoms.reduce((acc, bom) => {
    const key = bom.parent_product_id;
    if (!acc[key]) acc[key] = { parent: bom.parent_product, components: [] };
    acc[key].components.push(bom);
    return acc;
  }, {} as Record<string, { parent: any; components: BOMItem[] }>);

  if (loading) return <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="animate-pulse bg-slate-200 h-32 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Listas de Materiales (BOMs / Kits)</h1>
          <p className="text-sm text-slate-500 mt-1">Define componentes para productos tipo Combo</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo Componente
        </Button>
      </div>

      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Componente' : 'Agregar Componente a Kit'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Producto Padre (Kit/Combo) *</label>
                  <Select
                    value={formData.parent_product_id}
                    onChange={(e) => setFormData({ ...formData, parent_product_id: e.target.value })}
                    options={[{ value: '', label: 'Seleccionar...' }, ...parentProducts.map(p => ({ value: p.id, label: `${p.name} (${p.sku})` }))]}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Componente *</label>
                  <Select
                    value={formData.component_product_id}
                    onChange={(e) => setFormData({ ...formData, component_product_id: e.target.value })}
                    options={[{ value: '', label: 'Seleccionar...' }, ...componentProducts.map(p => ({ value: p.id, label: `${p.name} (${p.sku}) - $${p.cost_price.toLocaleString('es-CL')}` }))]}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input label="Cantidad" type="number" step="0.001" min="0.001" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 1 })} required />
                <Input label="U.M." value={formData.unit_of_measure} onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })} />
                <Input label="Merma %" type="number" step="0.01" min="0" value={formData.scrap_percent} onChange={(e) => setFormData({ ...formData, scrap_percent: parseFloat(e.target.value) || 0 })} />
                <Input label="Orden" type="number" min="0" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formData.is_optional} onChange={(e) => setFormData({ ...formData, is_optional: e.target.checked })} className="rounded border-slate-300" />
                  Componente opcional
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}>Cancelar</Button>
                <Button type="submit">{editingId ? 'Actualizar' : 'Agregar'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {Object.keys(groupedBoms).length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-sm">No hay BOMs configurados. Crea uno para empezar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Kit / Combo</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Componente</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cant.</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">U.M.</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Merma %</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Opcional</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Orden</th>
                    <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Costo Est.</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedBoms).map(([_, group]) => (
                    <React.Fragment key={group.parent.id}>
                      {group.components.map((bom, idx) => (
                        <tr key={bom.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-xs">
                            {idx === 0 && (
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-indigo-600" />
                                <span className="font-medium text-slate-900">{group.parent.name}</span>
                                <span className="text-slate-500">({group.parent.sku})</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium text-slate-700">{bom.component_product.name}</td>
                          <td className="px-4 py-3 text-center text-xs font-mono">{bom.quantity}</td>
                          <td className="px-4 py-3 text-center text-xs text-slate-500">{bom.unit_of_measure}</td>
                          <td className="px-4 py-3 text-center text-xs text-slate-500">{bom.scrap_percent}%</td>
                          <td className="px-4 py-3 text-center">
                            {bom.is_optional ? (
                              <Badge variant="warning">Opcional</Badge>
                            ) : (
                              <Badge variant="neutral">Requerido</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-slate-500">{bom.sort_order}</td>
                          <td className="px-4 py-3 text-center text-xs font-medium text-slate-700">
                            ${(bom.quantity * (bom.component_product.cost_price || 0) * (1 + bom.scrap_percent / 100)).toLocaleString('es-CL', { minimumFractionDigits: 0 })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleExplode(group.parent.id)}>
                                <Calculator className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(bom)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(bom.id)} className="text-rose-600 hover:bg-rose-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
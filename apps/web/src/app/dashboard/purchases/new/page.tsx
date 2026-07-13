'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@yellow-erp/ui';
import { ArrowLeft, Save, Plus, Trash2, Package } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '../../../../lib/api-client';

const suppliers = [
  { id: '1', name: 'Logistica Norte SpA', code: 'SUP-001' },
  { id: '2', name: 'Distribuidora Chile', code: 'SUP-002' },
  { id: '3', name: 'Mecánica y Repuestos', code: 'SUP-003' },
  { id: '4', name: 'Almacenes Sur', code: 'SUP-004' },
];

const warehouses = [
  { id: '1', name: 'Bodega Central', code: 'BC-01' },
  { id: '2', name: 'Bodega Norte', code: 'BN-02' },
  { id: '3', name: 'Bodega Sur', code: 'BS-03' },
];

const products = [
  { id: '1', name: 'Laptop HP ProBook 450', sku: 'LP-HP-450', price: 650000 },
  { id: '2', name: 'Mouse Logitech MX Master 3S', sku: 'MS-LG-MX3', price: 89000 },
  { id: '3', name: 'Monitor Dell 27" 4K', sku: 'MN-DELL-27', price: 420000 },
  { id: '4', name: 'Teclado Mecánico Keychron K2', sku: 'KB-KC-K2', price: 95000 },
  { id: '5', name: 'Disco SSD Samsung 980 PRO 1TB', sku: 'SSD-SAM-980', price: 110000 },
];

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    supplierId: '',
    warehouseId: '',
    expectedDate: '',
    paymentTerms: '30',
    notes: '',
    internalNotes: '',
  });
  const [items, setItems] = useState<OrderItem[]>([
    { productId: '', quantity: 1, unitPrice: 0 },
  ]);

  const handleFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    setItems(prev => {
      const newItems = [...prev];
      if (field === 'productId') {
        const product = products.find(p => p.id === value);
        newItems[index] = {
          ...newItems[index],
          productId: value as string,
          unitPrice: product?.price || 0,
        };
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
      return newItems;
    });
  };

  const addItem = () => {
    setItems(prev => [...prev, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = Math.round(subtotal * 0.19);
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const api = getApiClient();
      await api.createPurchaseOrder({
        supplier_id: formData.supplierId,
        warehouse_id: formData.warehouseId,
        expected_date: formData.expectedDate,
        payment_terms: parseInt(formData.paymentTerms),
        notes: formData.notes,
        items: items.filter(i => i.productId).map(i => ({
          product_id: i.productId,
          quantity: i.quantity,
          unit_price: i.unitPrice,
          discount_percent: 0,
          tax_rate: 19,
        })),
      });
      router.push('/dashboard/purchases');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la orden de compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/purchases" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Nueva Orden de Compra</h1>
          <p className="text-sm text-slate-500 mt-1">Crear una nueva orden de compra a proveedor</p>
        </div>
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Supplier & Warehouse */}
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Proveedor"
                    value={formData.supplierId}
                    onChange={handleFormChange('supplierId')}
                    options={[{ value: '', label: 'Seleccionar proveedor...' }, ...suppliers.map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))]}
                    required
                  />
                  <Select
                    label="Almacén de Destino"
                    value={formData.warehouseId}
                    onChange={handleFormChange('warehouseId')}
                    options={[{ value: '', label: 'Seleccionar almacén...' }, ...warehouses.map(w => ({ value: w.id, label: `${w.code} - ${w.name}` }))]}
                    required
                  />
                  <Input
                    label="Fecha de Entrega Esperada"
                    type="date"
                    value={formData.expectedDate}
                    onChange={handleFormChange('expectedDate')}
                  />
                  <Select
                    label="Plazo de Pago"
                    value={formData.paymentTerms}
                    onChange={handleFormChange('paymentTerms')}
                    options={[
                      { value: '0', label: 'Contado' },
                      { value: '15', label: '15 días' },
                      { value: '30', label: '30 días' },
                      { value: '45', label: '45 días' },
                      { value: '60', label: '60 días' },
                      { value: '90', label: '90 días' },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Items de la Orden</CardTitle>
                <Button type="button" variant="secondary" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Item
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-8">#</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-24">Cantidad</th>
                      <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-32">Precio Unit.</th>
                      <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-32">Total</th>
                      <th className="w-12 px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-xs text-slate-500">{index + 1}</td>
                        <td className="px-4 py-3">
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                          >
                            <option value="">Seleccionar producto...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">
                          ${(item.quantity * item.unitPrice).toLocaleString('es-CL')}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            aria-label="Eliminar item"
                            disabled={items.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Notas para el Proveedor</label>
                  <textarea
                    value={formData.notes}
                    onChange={handleFormChange('notes')}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Instrucciones especiales para el proveedor..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Notas Internas</label>
                  <textarea
                    value={formData.internalNotes}
                    onChange={handleFormChange('internalNotes')}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Notas internas (no se ven en el documento)..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-900">${subtotal.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">IVA (19%)</span>
                    <span className="font-medium text-slate-900">${taxAmount.toLocaleString('es-CL')}</span>
                  </div>
                  <hr className="border-slate-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">Total</span>
                    <span className="text-xl font-bold text-slate-900">${total.toLocaleString('es-CL')}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Items:</span>
                    <span className="font-medium">{items.filter(i => i.productId).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Moneda:</span>
                    <span className="font-medium">CLP</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <Button type="submit" className="w-full" loading={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Crear Orden
                  </Button>
                  <Link href="/dashboard/purchases" className="w-full">
                    <Button type="button" variant="secondary" className="w-full">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

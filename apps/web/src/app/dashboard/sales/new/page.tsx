'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@yellow-erp/ui';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export default function NewSalePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState<{id: string; name: string; tax_id: string}[]>([]);
  const [warehouses, setWarehouses] = useState<{id: string; name: string; code: string}[]>([]);
  const [products, setProducts] = useState<{id: string; name: string; sku: string; price: number; stock?: number}[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getCustomers(),
      api.getWarehouses(),
      api.getProducts(),
    ]).then(([customersRes, warehousesRes, productsRes]) => {
      setCustomers((customersRes.data || []).map((c: any) => ({ id: c.id, name: c.name, tax_id: c.tax_id })));
      setWarehouses((warehousesRes.data || []).map((w: any) => ({ id: w.id, name: w.name, code: w.code })));
      setProducts((productsRes.data || []).map((p: any) => ({ id: p.id, name: p.name, sku: p.sku, price: p.price || 0, stock: p.quantity || p.stock || 0 })));
    }).finally(() => setDataLoading(false));
  }, []);
  const [formData, setFormData] = useState({
    customerId: '',
    warehouseId: '',
    deliveryDate: '',
    paymentMethod: '',
    paymentTerms: '30',
    shippingAddress: '',
    notes: '',
  });
  const [items, setItems] = useState<OrderItem[]>([
    { productId: '', quantity: 1, unitPrice: 0, discount: 0 },
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
    setItems(prev => [...prev, { productId: '', quantity: 1, unitPrice: 0, discount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const getLineTotal = (item: OrderItem) => {
    const subtotal = item.quantity * item.unitPrice;
    return subtotal - (subtotal * item.discount) / 100;
  };

  const subtotal = items.reduce((sum, item) => sum + getLineTotal(item), 0);
  const taxAmount = Math.round(subtotal * 0.19);
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const api = getApiClient();
      const result = await api.createSalesOrder({
        customer_id: formData.customerId,
        warehouse_id: formData.warehouseId,
        delivery_date: formData.deliveryDate,
        payment_method: formData.paymentMethod,
        payment_terms: parseInt(formData.paymentTerms),
        shipping_address: formData.shippingAddress,
        notes: formData.notes,
        items: items.filter(i => i.productId).map(i => ({
          product_id: i.productId,
          quantity: i.quantity,
          unit_price: i.unitPrice,
          discount_percent: i.discount || 0,
          tax_rate: 19,
        })),
      });
      router.push('/dashboard/sales');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la orden de venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/sales" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Nueva Venta</h1>
          <p className="text-sm text-slate-500 mt-1">Crear una nueva orden de venta</p>
        </div>
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm mb-4">{error}</div>}

      {dataLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-slate-400 text-sm">Cargando datos...</div>
        </div>
      )}

      {!dataLoading && <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Warehouse */}
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Cliente"
                    value={formData.customerId}
                    onChange={handleFormChange('customerId')}
                    options={[{ value: '', label: 'Seleccionar cliente...' }, ...customers.map(c => ({ value: c.id, label: c.name }))]}
                    required
                  />
                  <Select
                    label="Almacén de Origen"
                    value={formData.warehouseId}
                    onChange={handleFormChange('warehouseId')}
                    options={[{ value: '', label: 'Seleccionar almacén...' }, ...warehouses.map(w => ({ value: w.id, label: `${w.code} - ${w.name}` }))]}
                    required
                  />
                  <Input
                    label="Fecha de Entrega"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={handleFormChange('deliveryDate')}
                  />
                  <Select
                    label="Método de Pago"
                    value={formData.paymentMethod}
                    onChange={handleFormChange('paymentMethod')}
                    options={[
                      { value: '', label: 'Seleccionar método...' },
                      { value: 'transfer', label: 'Transferencia Bancaria' },
                      { value: 'credit', label: 'Tarjeta de Crédito' },
                      { value: 'debit', label: 'Tarjeta de Débito' },
                      { value: 'cash', label: 'Efectivo' },
                      { value: 'check', label: 'Cheque' },
                    ]}
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
                <Input
                  label="Dirección de Envío"
                  value={formData.shippingAddress}
                  onChange={handleFormChange('shippingAddress')}
                  placeholder="Av. Principal 1234, Santiago, Chile"
                />
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Items de la Venta</CardTitle>
                <Button type="button" variant="secondary" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Item
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-8">#</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-20">Stock</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-24">Cantidad</th>
                      <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-28">Precio Unit.</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-20">Dto %</th>
                      <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-28">Total Línea</th>
                      <th className="w-12 px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const product = products.find(p => p.id === item.productId);
                      return (
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
                          <td className="px-4 py-3 text-center">
                            {product && product.stock != null ? (
                              <span className={`text-xs font-medium ${product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                                {product.stock} uds
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
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
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discount}
                              onChange={(e) => handleItemChange(index, 'discount', parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">
                            ${getLineTotal(item).toLocaleString('es-CL')}
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
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Notas de la Orden</label>
                  <textarea
                    value={formData.notes}
                    onChange={handleFormChange('notes')}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Instrucciones especiales, notas al cliente..."
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
                    Crear Venta
                  </Button>
                  <Link href="/dashboard/sales" className="w-full">
                    <Button type="button" variant="secondary" className="w-full">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>}
    </div>
  );
}


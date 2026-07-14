'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@yellow-erp/ui';
import { ArrowLeft, AlertTriangle, Truck } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

const transportCompanies = ['Chilexpress', 'Starken', 'Correo de Chile'];

interface DispatchItem {
  productId: string;
  name: string;
  sku: string;
  stock: number;
  quantity: number;
  observation: string;
}

export default function NewDeliveryGuidePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orders, setOrders] = useState<{id: string; order_number: string}[]>([]);
  const [products, setProducts] = useState<{id: string; name: string; sku: string; quantity?: number; stock?: number}[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [formData, setFormData] = useState({
    orderId: '',
    transportCompany: '',
    deliveryDate: '',
    driverName: '',
    vehiclePlate: '',
    shippingAddress: '',
  });

  const [items, setItems] = useState<DispatchItem[]>([]);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getSalesOrders(),
      api.getProducts(),
    ]).then(([ordersRes, productsRes]) => {
      setOrders((ordersRes.data || []).map((o: any) => ({ id: o.id, order_number: o.order_number })));
      setProducts((productsRes.data || []).map((p: any) => ({ id: p.id, name: p.name, sku: p.sku, quantity: p.quantity || p.stock || 0 })));
    }).finally(() => setDataLoading(false));
  }, []);

  const handleFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleItemChange = (index: number, field: keyof DispatchItem, value: string | number) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const api = getApiClient();
      const result = await api.createDeliveryGuide({
        order_id: formData.orderId,
        warehouse_id: '',
        transport: formData.transportCompany,
        driver_name: formData.driverName,
        vehicle_plate: formData.vehiclePlate,
        shipping_address: formData.shippingAddress,
        items: items.filter(i => i.productId).map(i => ({
          product_id: i.productId,
          quantity: i.quantity,
          observation: i.observation,
        })),
      });
      setSuccess(`Guía ${result.guide_number} creada correctamente.`);
      setTimeout(() => router.push('/dashboard/sales'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la guía de despacho');
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
          <h1 className="text-xl font-bold text-slate-900">Nueva Guía de Despacho</h1>
          <p className="text-sm text-slate-500 mt-1">Crear guía de despacho para envío de mercadería</p>
        </div>
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm mb-4">{error}</div>}
      {success && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Guía</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Orden de Referencia"
                    value={formData.orderId}
                    onChange={handleFormChange('orderId')}
                    options={[{ value: '', label: 'Seleccionar orden...' }, ...orders.map(o => ({ value: o.id, label: o.order_number }))]}
                  />
                  <Select
                    label="Transportista"
                    value={formData.transportCompany}
                    onChange={handleFormChange('transportCompany')}
                    options={[{ value: '', label: 'Seleccionar transportista...' }, ...transportCompanies.map(t => ({ value: t, label: t }))]}
                  />
                  <Input
                    label="Fecha de Despacho"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={handleFormChange('deliveryDate')}
                  />
                  <Input
                    label="Nombre del Chofer"
                    value={formData.driverName}
                    onChange={handleFormChange('driverName')}
                    placeholder="Juan Pérez"
                  />
                </div>
                <Input
                  label="Patente del Vehículo"
                  value={formData.vehiclePlate}
                  onChange={handleFormChange('vehiclePlate')}
                  placeholder="ABCD-12"
                />
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Dirección de Envío</label>
                  <textarea
                    value={formData.shippingAddress}
                    onChange={handleFormChange('shippingAddress')}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Av. Principal 1234, Santiago, Chile"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items a Despachar</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-8">#</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-24">Stock Disp.</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-28">Cant. Despachar</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Observación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const isOverStock = item.quantity > item.stock;
                      return (
                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-xs text-slate-500">{index + 1}</td>
                          <td className="px-4 py-3">
                            <select
                              value={item.productId}
                              onChange={(e) => {
                                const product = products.find(p => p.id === e.target.value);
                                if (product) {
                                  setItems(prev => {
                                    const newItems = [...prev];
                                    newItems[index] = { ...newItems[index], productId: product.id, name: product.name, sku: product.sku, stock: product.stock || product.quantity || 0 };
                                    return newItems;
                                  });
                                }
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                            >
                              <option value="">Seleccionar producto...</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">{item.sku}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-medium ${item.stock > 10 ? 'text-emerald-600' : item.stock > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                              {item.stock} uds
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="1"
                              max={item.stock}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                              className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${isOverStock ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.observation}
                              onChange={(e) => handleItemChange(index, 'observation', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                              placeholder="Observación..."
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
                <div className="px-4 py-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setItems(prev => [...prev, { productId: '', name: '', sku: '', stock: 0, quantity: 1, observation: '' }])}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    + Agregar producto
                  </button>
                </div>
              </CardContent>
            </Card>

            {items.some(item => item.quantity > item.stock) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Stock insuficiente</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Algunos items exceden el stock disponible. La cantidad será ajustada automáticamente al stock disponible.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Items a despachar</span>
                    <span className="font-medium text-slate-900">{items.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Total unidades</span>
                    <span className="font-medium text-slate-900">{totalUnits} uds</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Orden ref.</span>
                    <span className="font-medium text-slate-900">
                      {orders.find(o => o.id === formData.orderId)?.order_number || '—'}
                    </span>
                  </div>
                  <hr className="border-slate-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">Estado</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      Borrador
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <Button type="submit" className="w-full" loading={loading}>
                    <Truck className="w-4 h-4 mr-2" />
                    Confirmar Despacho
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
      </form>
    </div>
  );
}

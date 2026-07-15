'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@yellow-erp/ui';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface InvoiceItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orders, setOrders] = useState<{id: string; order_number: string; customer_name?: string}[]>([]);
  const [customers, setCustomers] = useState<{id: string; name: string; tax_id: string; email?: string; address?: string}[]>([]);
  const [products, setProducts] = useState<{id: string; name: string; sku: string; price: number}[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [formData, setFormData] = useState({
    orderId: '',
    invoiceDate: '',
    dueDate: '',
    paymentMethod: '',
    customerId: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [paidAmount, setPaidAmount] = useState(0);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getSalesOrders(),
      api.getCustomers(),
      api.getProducts(),
    ]).then(([ordersRes, customersRes, productsRes]) => {
      setOrders((ordersRes.data || []).map((o: any) => ({ id: o.id, order_number: o.order_number })));
      setCustomers((customersRes.data || []).map((c: any) => ({ id: c.id, name: c.name, tax_id: c.tax_id, email: c.email, address: c.address })));
      setProducts((productsRes.data || []).map((p: any) => ({ id: p.id, name: p.name, sku: p.sku, price: p.price || 0 })));
    }).finally(() => setDataLoading(false));
  }, []);

  const handleFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const getLineTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unitPrice;
    return subtotal - (subtotal * item.discount) / 100;
  };

  const subtotal = items.reduce((sum, item) => sum + getLineTotal(item), 0);
  const taxAmount = Math.round(subtotal * 0.19);
  const total = subtotal + taxAmount;
  const balance = total - paidAmount;

  const selectedCustomer = customers.find(c => c.id === formData.customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const api = getApiClient();
      const result = await api.createInvoice({
        order_id: formData.orderId,
        customer_id: formData.customerId,
        invoice_date: formData.invoiceDate,
        due_date: formData.dueDate,
        payment_method: formData.paymentMethod,
        items: items.filter(i => i.productId).map(i => ({
          product_id: i.productId,
          description: i.name || '',
          quantity: i.quantity,
          unit_price: i.unitPrice,
          discount: i.discount,
          total: getLineTotal(i),
        })),
      });
      setSuccess(`Factura ${result.invoice_number} emitida correctamente.`);
      setTimeout(() => router.push('/dashboard/sales'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al emitir la factura');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const api = getApiClient();
      const result = await api.createInvoice({
        order_id: formData.orderId,
        customer_id: formData.customerId,
        invoice_date: formData.invoiceDate || new Date().toISOString().split('T')[0],
        due_date: formData.dueDate,
        payment_method: formData.paymentMethod,
        status: 'draft',
        items: items.filter(i => i.productId).map(i => ({
          product_id: i.productId,
          description: i.name || '',
          quantity: i.quantity,
          unit_price: i.unitPrice,
          discount: i.discount,
          total: getLineTotal(i),
        })),
      });
      setSuccess(`Borrador ${result.invoice_number} guardado.`);
      setTimeout(() => router.push('/dashboard/sales'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar borrador');
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
          <h1 className="text-xl font-bold text-slate-900">Nueva Factura de Venta</h1>
          <p className="text-sm text-slate-500 mt-1">Emitir factura para una orden de venta</p>
        </div>
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm mb-4">{error}</div>}
      {success && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Datos de la Factura</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Orden de Referencia"
                    value={formData.orderId}
                    onChange={handleFormChange('orderId')}
                    options={[{ value: '', label: 'Seleccionar orden...' }, ...orders.map(o => ({ value: o.id, label: o.order_number }))]}
                  />
                  <Input
                    label="Fecha de Factura"
                    type="date"
                    value={formData.invoiceDate}
                    onChange={handleFormChange('invoiceDate')}
                  />
                  <Input
                    label="Fecha de Vencimiento"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleFormChange('dueDate')}
                  />
                  <Select
                    label="Método de Pago"
                    value={formData.paymentMethod}
                    onChange={handleFormChange('paymentMethod')}
                    options={[
                      { value: '', label: 'Seleccionar método...' },
                      { value: 'efectivo', label: 'Efectivo' },
                      { value: 'transferencia', label: 'Transferencia' },
                      { value: 'tarjeta', label: 'Tarjeta' },
                      { value: 'credito', label: 'Crédito' },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Seleccionar Cliente"
                  value={formData.customerId}
                  onChange={handleFormChange('customerId')}
                  options={[{ value: '', label: 'Seleccionar cliente...' }, ...customers.map(c => ({ value: c.id, label: c.name }))]}
                />
                {selectedCustomer && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">Nombre</span>
                      <span className="text-sm text-slate-900 font-medium">{selectedCustomer.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">RUT</span>
                      <span className="text-sm text-slate-900">{selectedCustomer.tax_id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">Email</span>
                      <span className="text-sm text-slate-900">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">Dirección</span>
                      <span className="text-sm text-slate-900">{selectedCustomer.address}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items Facturados</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-8">#</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-20">Cantidad</th>
                      <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-28">Precio Unit.</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-20">Dto %</th>
                      <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const lineTotal = getLineTotal(item);
                      return (
                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-xs text-slate-500">{index + 1}</td>
                          <td className="px-4 py-3 text-xs text-slate-700">{item.name}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{item.sku}</td>
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
                            ${lineTotal.toLocaleString('es-CL')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </CardContent>
            </Card>
          </div>

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

                <div className="space-y-3 pt-2">
                  <Input
                    label="Monto Pagado"
                    type="number"
                    min="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseInt(e.target.value) || 0)}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Saldo</span>
                    <span className={`font-medium ${balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      ${balance.toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <Button type="submit" className="w-full" loading={loading}>
                    <FileText className="w-4 h-4 mr-2" />
                    Emitir Factura
                  </Button>
                  <Button type="button" variant="secondary" className="w-full" onClick={handleSaveDraft} loading={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Borrador
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


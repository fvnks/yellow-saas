'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@yellow-erp/ui';
import { ArrowLeft, Save, FileText, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '../../../../../lib/api-client';

const orders = [
  { id: '1', number: 'SO-2024-001', customer: 'Empresa ABC SpA' },
  { id: '2', number: 'SO-2024-002', customer: 'Comercial XYZ Ltda' },
];

const customers = [
  { id: '1', name: 'Empresa ABC SpA', rut: '76.123.456-7', email: 'contacto@empresaabc.cl', address: 'Av. Providencia 1234, Santiago' },
  { id: '2', name: 'Comercial XYZ Ltda', rut: '89.234.567-8', email: 'ventas@xyz.cl', address: 'Calle Los Aromos 567, ValparaÃ­so' },
  { id: '3', name: 'Distribuidora Norte', rut: '70.345.678-9', email: 'info@distrinorte.cl', address: 'Av. del Comercio 890, Antofagasta' },
  { id: '4', name: 'Retail Sur SA', rut: '90.456.789-0', email: 'compras@retailsur.cl', address: 'Pasaje Las Flores 321, Temuco' },
  { id: '5', name: 'Importadora Chile', rut: '75.567.890-1', email: 'importaciones@importchile.cl', address: 'Bulnes 456, Santiago' },
];

const paymentMethods = ['Efectivo', 'Transferencia', 'Tarjeta', 'CrÃ©dito'];

interface InvoiceItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

const initialItems: InvoiceItem[] = [
  { productId: '1', name: 'Laptop HP ProBook 450', sku: 'LP-HP-450', quantity: 2, unitPrice: 650000, discount: 0 },
  { productId: '2', name: 'Mouse Logitech MX Master 3S', sku: 'MS-LG-MX3', quantity: 5, unitPrice: 89000, discount: 0 },
  { productId: '3', name: 'Monitor Dell 27" 4K', sku: 'MN-DELL-27', quantity: 1, unitPrice: 420000, discount: 0 },
];

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    invoiceNumber: 'FAC-2026-001',
    orderId: '',
    invoiceDate: '',
    dueDate: '',
    paymentMethod: '',
    customerId: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>(initialItems);
  const [paidAmount, setPaidAmount] = useState(0);

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
          quantity: i.quantity,
          unit_price: i.unitPrice,
          discount: i.discount,
        })),
      });
      setSuccess(`Factura ${result.invoice_number} emitida. Stock descontado correctamente.`);
      setTimeout(() => router.push('/dashboard/sales'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al emitir la factura');
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
                  <Input
                    label="NÃºmero de Factura"
                    value={formData.invoiceNumber}
                    onChange={handleFormChange('invoiceNumber')}
                  />
                  <Select
                    label="Orden de Referencia"
                    value={formData.orderId}
                    onChange={handleFormChange('orderId')}
                    options={[{ value: '', label: 'Seleccionar orden...' }, ...orders.map(o => ({ value: o.id, label: o.number }))]}
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
                    label="MÃ©todo de Pago"
                    value={formData.paymentMethod}
                    onChange={handleFormChange('paymentMethod')}
                    options={[{ value: '', label: 'Seleccionar mÃ©todo...' }, ...paymentMethods.map(m => ({ value: m, label: m }))]}
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
                      <span className="text-sm text-slate-900">{selectedCustomer.rut}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">Email</span>
                      <span className="text-sm text-slate-900">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">DirecciÃ³n</span>
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
                  <Button type="button" variant="secondary" className="w-full">
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


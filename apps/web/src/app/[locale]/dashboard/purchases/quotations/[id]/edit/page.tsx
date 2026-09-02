'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@yellow-erp/ui';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface QuoteItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export default function EditQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [suppliers, setSuppliers] = useState<{ id: string; name: string; code: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; sku: string; price: number }[]>([]);
  const [formData, setFormData] = useState({
    supplierId: '',
    expiryDate: '',
    notes: '',
  });
  const [items, setItems] = useState<QuoteItem[]>([]);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getQuotation(id).catch(() => null),
      api.getSuppliers().catch(() => ({ data: [] })),
      api.getProducts().catch(() => ({ data: [] })),
    ]).then(([quoteRes, suppliersRes, productsRes]) => {
      if (quoteRes) {
        const quote = quoteRes as any;
        setFormData({
          supplierId: quote.supplier_id || '',
          expiryDate: quote.expiry_date?.split('T')[0] || '',
          notes: quote.notes || '',
        });
        setItems(
          (quote.items || []).map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
          }))
        );
      }
      setSuppliers((suppliersRes.data || []).map((s: any) => ({ id: s.id, name: s.name, code: s.code || '' })));
      setProducts((productsRes.data || []).map((p: any) => ({ id: p.id, name: p.name, sku: p.sku || '', price: p.sale_price || p.cost_price || p.price || 0 })));
      setLoading(false);
    });
  }, [id]);

  const handleFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: string | number) => {
    setItems(prev => {
      const newItems = [...prev];
      if (field === 'product_id') {
        const product = products.find(p => p.id === value);
        newItems[index] = { ...newItems[index], product_id: value as string, unit_price: product?.price || newItems[index].unit_price };
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
      return newItems;
    });
  };

  const addItem = () => setItems(prev => [...prev, { product_id: '', quantity: 1, unit_price: 0 }]);
  const removeItem = (index: number) => { if (items.length > 1) setItems(prev => prev.filter((_, i) => i !== index)); };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxAmount = Math.round(subtotal * 0.19);
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const api = getApiClient();
      await api.updateQuotation(id, {
        supplier_id: formData.supplierId,
        expiry_date: formData.expiryDate,
        total_amount: total,
        notes: formData.notes,
        items: items.filter(i => i.product_id).map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          discount_percent: 0,
          tax_rate: 19,
        })),
      });
      router.push(`/dashboard/purchases/quotations/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar la cotización');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/purchases/quotations/${id}`} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Editar Cotización</h1>
          <p className="text-sm text-muted-foreground mt-1">Modificar datos de la cotización</p>
        </div>
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Cotización</CardTitle>
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
                  <Input
                    label="Fecha de Vencimiento"
                    type="date"
                    value={formData.expiryDate}
                    onChange={handleFormChange('expiryDate')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Items Cotizados</CardTitle>
                <Button type="button" variant="secondary" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Item
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider w-8">#</th>
                      <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Producto</th>
                      <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider w-24">Cantidad</th>
                      <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider w-32">Precio Unit.</th>
                      <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider w-32">Total</th>
                      <th className="w-12 px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted transition-colors">
                        <td className="px-4 py-3 text-xs text-muted-foreground">{index + 1}</td>
                        <td className="px-4 py-3">
                          <select
                            value={item.product_id}
                            onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-colors"
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
                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-colors"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-colors"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground text-right font-medium">
                          ${(item.quantity * item.unit_price).toLocaleString('es-CL')}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            disabled={items.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={formData.notes}
                  onChange={handleFormChange('notes')}
                  rows={3}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-colors resize-none"
                  placeholder="Observaciones sobre la cotización..."
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">${subtotal.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">IVA (19%)</span>
                    <span className="font-medium text-foreground">${taxAmount.toLocaleString('es-CL')}</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-foreground">${total.toLocaleString('es-CL')}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-4">
                  <Button type="submit" className="w-full" loading={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                  <Link href={`/dashboard/purchases/quotations/${id}`} className="w-full">
                    <Button type="button" variant="secondary" className="w-full">Cancelar</Button>
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

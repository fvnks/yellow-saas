'use client';

import { useState, useEffect } from 'react';
import { X, ShoppingCart, Receipt, FileText, CreditCard, Banknote, Check, Search, User, Printer, Download } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { generatePOSVoucher } from '@/lib/pdf-design';
import { toast } from 'sonner';

interface QuickSellModalProps {
  open: boolean;
  onClose: () => void;
  productName?: string;
  productId?: string;
  defaultPrice?: number;
  defaultQuantity?: number;
}

type Step = 'sale' | 'result';

interface Customer {
  id: string;
  name: string;
  tax_id: string;
}

export default function QuickSellModal({ open, onClose, productName, productId, defaultPrice = 0, defaultQuantity = 1 }: QuickSellModalProps) {
  const [step, setStep] = useState<Step>('sale');
  const [quantity, setQuantity] = useState(String(defaultQuantity));
  const [unitPrice, setUnitPrice] = useState(String(defaultPrice));
  const [documentType, setDocumentType] = useState<'boleta' | 'factura'>('boleta');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [completedInvoice, setCompletedInvoice] = useState<{ id: string; invoice_number: string; total: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep('sale');
    setQuantity(String(defaultQuantity));
    setUnitPrice(String(defaultPrice));
    setDocumentType('boleta');
    setPaymentMethod('cash');
    setAmountPaid(0);
    setSelectedCustomer(null);
    setCustomerSearch('');
    setCompletedInvoice(null);

    const api = getApiClient();
    Promise.all([
      api.getCustomers().catch(() => ({ data: [] })),
      api.getCompany().catch(() => null),
    ]).then(([customersRes, companyRes]) => {
      setCustomers((customersRes.data || []).map((c: any) => ({
        id: c.id, name: c.name || '', tax_id: c.tax_id || '',
      })));
      if (companyRes) setCompany(companyRes);
    });
  }, [open, defaultQuantity, defaultPrice]);

  const qty = parseFloat(quantity) || 0;
  const price = parseFloat(unitPrice) || 0;
  const subtotal = qty * price;
  const taxAmount = Math.round(subtotal * 0.19);
  const total = subtotal + taxAmount;

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.tax_id.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handlePay = async () => {
    if (documentType === 'factura' && !selectedCustomer) return;
    if (!productId || qty <= 0) return;

    setProcessing(true);
    try {
      const api = getApiClient();
      const result = await api.createInvoice({
        customer_id: selectedCustomer?.id || undefined,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: documentType === 'boleta' ? undefined : new Date().toISOString().split('T')[0],
        payment_method: paymentMethod,
        document_type: documentType,
        items: [{
          product_id: productId,
          quantity: qty,
          unit_price: price,
          description: productName,
        }],
      });

      setCompletedInvoice({
        id: result?.id || '',
        invoice_number: result?.invoice_number || '',
        total,
      });
      setStep('result');
    } catch {
      toast.error('Error al procesar pago');
    } finally {
      setProcessing(false);
    }
  };

  const buildVoucherData = () => {
    if (!completedInvoice) return null;
    return {
      id: completedInvoice.id,
      number: completedInvoice.invoice_number,
      type: documentType,
      date: new Date().toLocaleDateString('es-CL'),
      company: company ? {
        name: company.name, tax_id: company.tax_id || undefined, razon_social: company.razon_social || undefined,
        giro: company.giro || undefined, address: company.address || undefined, city: company.city || undefined,
        region: company.region || undefined, phone: company.phone || undefined, email: company.email || undefined,
        logo_url: company.logo_url || undefined,
      } : { name: 'Empresa' },
      customer: selectedCustomer ? { name: selectedCustomer.name, rut: selectedCustomer.tax_id } : undefined,
      items: [{ name: productName || 'Producto', quantity: qty, unit_price: price, total: subtotal }],
      subtotal: Math.round(total / 1.19),
      tax_amount: total - Math.round(total / 1.19),
      total,
      payment_method: paymentMethod,
      amount_paid: paymentMethod === 'cash' ? amountPaid : total,
      change: paymentMethod === 'cash' ? Math.max(0, amountPaid - total) : undefined,
    };
  };

  const handlePrint = () => {
    const data = buildVoucherData();
    if (!data) return;
    const doc = generatePOSVoucher(data);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleDownload = () => {
    const data = buildVoucherData();
    if (!data) return;
    const doc = generatePOSVoucher(data);
    doc.save(`${data.number}.pdf`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {step === 'sale' ? 'Venta Rápida' : 'Venta Registrada'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'sale' && (
          <>
            <div className="p-6 space-y-4">
              {/* Product info */}
              <div className="p-3 bg-muted rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">Producto</p>
                <p className="text-sm font-medium text-foreground">{productName || '—'}</p>
              </div>

              {/* Quantity + Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Cantidad *</label>
                  <input type="number" step="0.01" min="0.01" value={quantity} onChange={e => setQuantity(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Precio Unitario *</label>
                  <input type="number" step="1" min="0" value={unitPrice} onChange={e => setUnitPrice(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
              </div>

              {/* Document Type */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Tipo de Documento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setDocumentType('boleta'); setSelectedCustomer(null); setCustomerSearch(''); }}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors ${
                      documentType === 'boleta' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-border text-slate-600 hover:border-slate-300'
                    }`}>
                    <Receipt className="w-5 h-5" />
                    <span className="text-xs font-medium">Boleta</span>
                    <span className="text-[9px] text-muted-foreground">Sin RUT</span>
                  </button>
                  <button onClick={() => setDocumentType('factura')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors ${
                      documentType === 'factura' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-border text-slate-600 hover:border-slate-300'
                    }`}>
                    <FileText className="w-5 h-5" />
                    <span className="text-xs font-medium">Factura</span>
                    <span className="text-[9px] text-muted-foreground">Requiere RUT</span>
                  </button>
                </div>
              </div>

              {/* Customer */}
              <div className="space-y-1 relative">
                <label className="block text-xs font-medium text-foreground">
                  Cliente {documentType === 'factura' ? '(Requerido) *' : '(Opcional)'}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={customerSearch}
                    onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder={documentType === 'factura' ? 'Buscar por nombre o RUT...' : 'Consumidor Final (sin cliente)'}
                    className="w-full pl-9 pr-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
                </div>
                {selectedCustomer && (
                  <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                    <User className="w-4 h-4 text-indigo-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{selectedCustomer.name}</p>
                      <p className="text-[9px] text-muted-foreground">RUT: {selectedCustomer.tax_id}</p>
                    </div>
                    <button onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }} className="p-1 text-muted-foreground hover:text-rose-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {showCustomerDropdown && !selectedCustomer && customerSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-3 text-center text-sm text-muted-foreground">No se encontraron clientes</div>
                    ) : (
                      filteredCustomers.slice(0, 10).map(c => (
                        <button key={c.id}
                          onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); setShowCustomerDropdown(false); }}
                          className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 border-b border-slate-100 last:border-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{c.name}</p>
                            <p className="text-[9px] text-muted-foreground">RUT: {c.tax_id}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Método de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash', label: 'Efectivo', icon: Banknote },
                    { id: 'card', label: 'Tarjeta', icon: CreditCard },
                    { id: 'transfer', label: 'Transferencia', icon: Receipt },
                  ].map(method => (
                    <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors ${
                        paymentMethod === method.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-border text-slate-600 hover:border-slate-300'
                      }`}>
                      <method.icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash amount */}
              {paymentMethod === 'cash' && (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-foreground">Monto Recibido</label>
                  <input type="number" value={amountPaid || ''} onChange={e => setAmountPaid(parseInt(e.target.value) || 0)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                    placeholder="0" />
                </div>
              )}
              {paymentMethod === 'cash' && amountPaid > 0 && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-700">Vuelto</span>
                    <span className="font-bold text-emerald-700">${Math.max(0, amountPaid - total).toLocaleString('es-CL')}</span>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Total a cobrar</p>
                <p className="text-2xl font-bold text-foreground">${total.toLocaleString('es-CL')}</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={onClose}
                className="bg-card border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Cancelar
              </button>
              <button onClick={handlePay} disabled={processing || qty <= 0 || (paymentMethod === 'cash' && amountPaid < total) || (documentType === 'factura' && !selectedCustomer)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                {processing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirmar Venta
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {step === 'result' && completedInvoice && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Venta Registrada</h3>
            <p className="text-sm text-muted-foreground">{completedInvoice.invoice_number}</p>
            <p className="text-3xl font-bold text-foreground">${completedInvoice.total.toLocaleString('es-CL')}</p>
            <div className="flex gap-3">
              <button onClick={handlePrint}
                className="flex-1 bg-card border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                <Printer className="w-4 h-4" /> Imprimir
              </button>
              <button onClick={handleDownload}
                className="flex-1 bg-card border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                <Download className="w-4 h-4" /> Descargar PDF
              </button>
            </div>
            <button onClick={onClose}
              className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

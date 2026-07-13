'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Select } from '@yellow-erp/ui';
import { Monitor, ShoppingCart, Plus, Search, CreditCard, Banknote, Receipt, ArrowRight, Package, X, Check, User } from 'lucide-react';
import { getApiClient } from '../../../lib/api-client';

interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState(0);

  useEffect(() => {
    const api = getApiClient();
    api.getProducts().then(res => {
      const items = (res.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
      }));
      setProducts(items);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = Math.round(subtotal * 0.19);
  const total = subtotal + taxAmount;

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const handlePayment = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCart([]);
    setShowPaymentModal(false);
    setAmountPaid(0);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-6">
      {/* Products Grid */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Buscar producto por nombre o SKU..."
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl animate-pulse">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg mb-3" />
                  <div className="h-3 bg-slate-200 rounded w-16 mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-5 bg-slate-200 rounded w-20" />
                </div>
              ))
            ) : filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="p-4 bg-white border border-slate-200 rounded-xl text-left hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-50 transition-colors">
                  <Package className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <p className="text-xs text-slate-500 font-mono">{product.sku}</p>
                <p className="text-sm font-medium text-slate-900 mt-1 line-clamp-2">{product.name}</p>
                <p className="text-lg font-bold text-slate-900 mt-2">${product.price.toLocaleString('es-CL')}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white border border-slate-200 rounded-xl flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-slate-500" />
            <h2 className="font-semibold text-slate-900">Carrito</h2>
          </div>
          <span className="text-xs text-slate-500">{cart.length} items</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Carrito vacÃ­o</p>
              <p className="text-xs text-slate-400 mt-1">Selecciona productos para agregar</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">${item.price.toLocaleString('es-CL')} c/u</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-50"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-bold text-slate-900">${(item.price * item.quantity).toLocaleString('es-CL')}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium">${subtotal.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">IVA (19%)</span>
              <span className="font-medium">${taxAmount.toLocaleString('es-CL')}</span>
            </div>
            <hr className="border-slate-200" />
            <div className="flex justify-between">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="text-xl font-bold text-slate-900">${total.toLocaleString('es-CL')}</span>
            </div>
          </div>
          <Button
            className="w-full"
            onClick={() => { setAmountPaid(total); setShowPaymentModal(true); }}
            disabled={cart.length === 0}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Cobrar
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Cobrar Venta</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Total a cobrar</p>
                <p className="text-3xl font-bold text-slate-900">${total.toLocaleString('es-CL')}</p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">MÃ©todo de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash', label: 'Efectivo', icon: Banknote },
                    { id: 'card', label: 'Tarjeta', icon: CreditCard },
                    { id: 'transfer', label: 'Transferencia', icon: Receipt },
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors ${
                        paymentMethod === method.id
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <method.icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <Input
                  label="Monto Recibido"
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(parseInt(e.target.value) || 0)}
                />
              )}

              {paymentMethod === 'cash' && amountPaid > 0 && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-700">Vuelto</span>
                    <span className="font-bold text-emerald-700">${Math.max(0, amountPaid - total).toLocaleString('es-CL')}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancelar</Button>
              <Button onClick={handlePayment} disabled={paymentMethod === 'cash' && amountPaid < total}>
                <Check className="w-4 h-4 mr-2" />
                Confirmar Pago
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


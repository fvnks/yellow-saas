'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@yellow-erp/ui';
import { ArrowLeft, Package, Edit, Tag, BarChart3, MapPin } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '../../../../lib/api-client';

interface ProductData {
  id: string;
  sku: string;
  name: string;
  description: string;
  type: string;
  unit_of_measure: string;
  cost_price: number;
  sale_price: number;
  min_stock: number;
  max_stock: number;
  track_stock: boolean;
  barcode: string;
  is_active: boolean;
  category?: { id: string; name: string } | null;
  stock_levels?: {
    id: string;
    quantity: number;
    available_quantity: number;
    warehouse: { id: string; name: string; code: string };
  }[];
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = getApiClient('demo-company-id');
    api.getProduct(id)
      .then((data) => {
        setProduct(data as unknown as ProductData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="space-y-6">{[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-slate-200 h-32 rounded-xl" />)}</div>;
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/bodega" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
          <p className="text-sm text-slate-500">Producto no encontrado</p>
        </div>
      </div>
    );
  }

  const totalStock = (product.stock_levels || []).reduce((sum, sl) => sum + (sl.quantity || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/bodega" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
            <p className="text-sm text-slate-500 mt-1">SKU: {product.sku}</p>
          </div>
        </div>
        <Link href={`/dashboard/inventory/${id}/edit`}
          className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Edit className="w-4 h-4" /> Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock Total</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalStock}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Precio Venta</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">${(product.sale_price || 0).toLocaleString('es-CL')}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Tag className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Precio Costo</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">${(product.cost_price || 0).toLocaleString('es-CL')}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Informacion del Producto</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</p>
                <p className="text-sm text-slate-900 mt-1">{product.sku}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Codigo de Barras</p>
                <p className="text-sm text-slate-900 mt-1">{product.barcode || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</p>
                <p className="text-sm text-slate-900 mt-1 capitalize">{product.type}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Unidad</p>
                <p className="text-sm text-slate-900 mt-1">{product.unit_of_measure}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Categoria</p>
                <p className="text-sm text-slate-900 mt-1">{product.category?.name || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${product.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {product.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
            {product.description && (
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Descripcion</p>
                <p className="text-sm text-slate-700 mt-1">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Stock por Bodega</h3>
          </div>
          <div className="p-6">
            {(product.stock_levels || []).length > 0 ? (
              <div className="space-y-3">
                {product.stock_levels!.map((sl) => (
                  <div key={sl.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{sl.warehouse?.name}</p>
                        <p className="text-[9px] text-slate-500">{sl.warehouse?.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{sl.quantity}</p>
                      <p className="text-[9px] text-slate-500">disponible: {sl.available_quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Sin stock registrado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

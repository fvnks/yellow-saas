'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select } from '@yellow-erp/ui';
import { Plus, Search, Filter, Download, MoreVertical, Edit, Trash2, Package, Eye } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '../../../lib/api-client';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  cost: number;
  status: string;
  warehouse: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const api = getApiClient();
    api.getProducts().then((res) => {
      const apiData = res.data || [];
      const mapped = apiData.map((p) => ({
        id: p.id,
        name: p.name || '',
        sku: p.sku || '',
        category: '',
        stock: p.stock || 0,
        minStock: 10,
        price: p.price || 0,
        cost: 0,
        status: 'active',
        warehouse: p.warehouse || '',
      }));
      setProducts(mapped);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: 'Sin stock', variant: 'danger' as const };
    if (stock <= minStock) return { label: 'Bajo', variant: 'warning' as const };
    return { label: 'Normal', variant: 'success' as const };
  };

  const getStatusConfig = (status: string) => {
    if (status === 'active') return { label: 'Activo', variant: 'success' as const };
    return { label: 'Inactivo', variant: 'neutral' as const };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventario</h1>
          <p className="text-sm text-slate-500 mt-1">GestiÃ³n de productos y stock</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Link href="/dashboard/inventory/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                placeholder="Buscar por nombre, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            <Select
              placeholder="Estado"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'active', label: 'Activos' },
                { value: 'inactive', label: 'Inactivos' },
              ]}
              className="w-full sm:w-40"
            />
            <Select
              placeholder="CategorÃ­a"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Todas' },
                ...categories.map(c => ({ value: c, label: c })),
              ]}
              className="w-full sm:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Imagen</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>CategorÃ­a</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">MÃ­nimo</TableHead>
                <TableHead className="text-right">Precio Venta</TableHead>
                <TableHead className="text-right">Costo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Bodega</TableHead>
                <TableHead className="w-12">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product, index) => {
                const stockStatus = getStockStatus(product.stock, product.minStock);
                const statusConfig = getStatusConfig(product.status);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-400" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-slate-500">{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-center font-bold" style={{ color: stockStatus.variant === 'danger' ? '#e11d48' : stockStatus.variant === 'warning' ? '#f59e0b' : '#059669' }}>
                      {product.stock}
                    </TableCell>
                    <TableCell className="text-center text-slate-500">{product.minStock}</TableCell>
                    <TableCell className="text-right font-medium">${product.price.toLocaleString('es-CL')}</TableCell>
                    <TableCell className="text-right text-slate-500">${product.cost.toLocaleString('es-CL')}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </TableCell>
                    <TableCell>{product.warehouse}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/dashboard/inventory/${product.id}`}>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" aria-label="Ver">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link href={`/dashboard/inventory/${product.id}/edit`}>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" aria-label="Editar">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" aria-label="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <p>Mostrando 1 a {filteredProducts.length} de {products.length} productos</p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled>Anterior</Button>
          <Button variant="secondary" size="sm" disabled>Siguiente</Button>
        </div>
      </div>
    </div>
  );
}

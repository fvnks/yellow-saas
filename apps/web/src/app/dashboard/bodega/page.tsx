'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select } from '@yellow-erp/ui';
import { Plus, Search, Filter, Download, Edit, Trash2, Package, Warehouse, MapPin, Truck, Users, Activity, Eye, Grid } from 'lucide-react';
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

interface WarehouseItem {
  id: string;
  name: string;
  code: string;
  type: string;
  address: string;
  city: string;
  region: string;
  manager: string;
  phone: string;
  email: string;
  active: boolean;
  products: number;
  movements: number;
}

export default function BodegaPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'warehouses'>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const api = getApiClient('demo-company-id');
    Promise.all([
      api.getProducts(),
      api.getWarehouses()
    ]).then(([productsRes, warehousesRes]) => {
      const productsData = (productsRes.data || []).map((p) => ({
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
      const warehousesData = (warehousesRes.data || []).map((w) => ({
        id: w.id,
        name: w.name || '',
        code: w.code || '',
        type: 'Principal',
        address: '',
        city: '',
        region: '',
        manager: '',
        phone: '',
        email: '',
        active: true,
        products: w.total_products || 0,
        movements: 0,
      }));
      setProducts(productsData);
      setWarehouses(warehousesData);
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

  const filteredWarehouses = warehouses.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase()) || w.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && w.active) || (statusFilter === 'inactive' && !w.active);
    return matchesSearch && matchesStatus;
  });

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: 'Sin stock', variant: 'danger' as const };
    if (stock <= minStock) return { label: 'Bajo', variant: 'warning' as const };
    return { label: 'Normal', variant: 'success' as const };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventario y Bodega</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de inventario y bodegas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          {activeTab === 'inventory' ? (
            <Link href="/dashboard/inventory/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard/warehouses/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Bodega
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Productos</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{products.length}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Bajo</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{products.filter(p => p.stock <= p.minStock && p.stock > 0).length}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bodegas</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{warehouses.length}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Warehouse className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor Total</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString('es-CL')}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="border-b border-slate-200">
          <div className="flex">
            {[
              { id: 'inventory' as const, label: 'Inventario', icon: Package, count: products.length },
              { id: 'warehouses' as const, label: 'Bodegas', icon: Warehouse, count: warehouses.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearch(''); setStatusFilter('all'); setCategoryFilter('all'); }}
                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <Badge variant="neutral">{tab.count}</Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                placeholder={activeTab === 'inventory' ? 'Buscar por nombre, SKU...' : 'Buscar por nombre, código...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
            {activeTab === 'inventory' ? (
              <>
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
                  placeholder="Categoría"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'Todas' },
                    ...categories.map(c => ({ value: c, label: c })),
                  ]}
                  className="w-full sm:w-48"
                />
              </>
            ) : (
              <Select
                placeholder="Estado"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Todas' },
                  { value: 'active', label: 'Activas' },
                  { value: 'inactive', label: 'Inactivas' },
                ]}
                className="w-full sm:w-40"
              />
            )}
          </div>
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div role="tabpanel">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Imagen</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Mínimo</TableHead>
                  <TableHead className="text-right">Precio Venta</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Bodega</TableHead>
                  <TableHead className="w-12">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.minStock);
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
                        <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
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
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <p>Mostrando 1 a {filteredProducts.length} de {products.length} productos</p>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" disabled>Anterior</Button>
                <Button variant="secondary" size="sm" disabled>Siguiente</Button>
              </div>
            </div>
          </div>
        )}

        {/* Warehouses Tab */}
        {activeTab === 'warehouses' && (
          <div role="tabpanel">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ciudad / Región</TableHead>
                  <TableHead>Encargado</TableHead>
                  <TableHead className="text-center">Productos</TableHead>
                  <TableHead className="text-center">Movimientos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-12">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWarehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell>
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Warehouse className="w-5 h-5 text-slate-400" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{warehouse.name}</TableCell>
                    <TableCell className="font-mono text-slate-500">{warehouse.code}</TableCell>
                    <TableCell>
                      <Badge variant="info">{warehouse.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-slate-900">{warehouse.city}</p>
                        <p className="text-xs text-slate-500">{warehouse.region}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-slate-400" />
                        </div>
                        <span>{warehouse.manager}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{warehouse.products}</TableCell>
                    <TableCell className="text-center text-slate-500">{warehouse.movements}</TableCell>
                    <TableCell>
                      <Badge variant={warehouse.active ? 'success' : 'neutral'}>
                        {warehouse.active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/dashboard/bodega/${warehouse.id}/layout`}>
                          <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" aria-label="Layout">
                            <Grid className="w-4 h-4" />
                          </button>
                        </Link>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" aria-label="Ver">
                          <Activity className="w-4 h-4" />
                        </button>
                        <Link href={`/dashboard/warehouses/${warehouse.id}/edit`}>
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
                ))}
              </TableBody>
            </Table>
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <p>Mostrando 1 a {filteredWarehouses.length} de {warehouses.length} bodegas</p>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" disabled>Anterior</Button>
                <Button variant="secondary" size="sm" disabled>Siguiente</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

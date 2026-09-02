'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select } from '@yellow-erp/ui';
import { Plus, Search, Warehouse, MapPin, Truck, Users, Edit, Trash2, Activity, Package, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface Warehouse {
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

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const api = getApiClient();
    api.getWarehouses().then((res) => {
      const apiData = res.data || [];
      const mapped = apiData.map((w: any) => ({
        id: w.id,
        name: w.name || '',
        code: w.code || '',
        type: w.type || 'Principal',
        address: w.address || '',
        city: w.city || '',
        region: w.region || '',
        manager: w.manager || '',
        phone: w.phone || '',
        email: w.email || '',
        active: w.is_active !== false,
        products: w.total_products || 0,
        movements: w.total_movements || 0,
        capacity: w.capacity || 0,
        utilization: 0,
      }));
      setWarehouses(mapped);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredWarehouses = warehouses.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase()) || w.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && w.active) || (statusFilter === 'inactive' && !w.active);
    return matchesSearch && matchesStatus;
  });

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'principal': return { label: 'Principal', variant: 'success' as const, icon: <Warehouse className="w-3 h-3" /> };
      case 'secundaria': return { label: 'Secundaria', variant: 'info' as const, icon: <MapPin className="w-3 h-3" /> };
      case 'temporal': return { label: 'Temporal', variant: 'warning' as const, icon: <Truck className="w-3 h-3" /> };
      default: return { label: type, variant: 'neutral' as const, icon: <Warehouse className="w-3 h-3" /> };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Bodegas</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión de ubicaciones de inventario</p>
        </div>
        <Link href="/dashboard/warehouses/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Bodega
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Bodegas</p>
                <p className="text-2xl font-bold text-foreground mt-1">{warehouses.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Warehouse className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Activas</p>
                <p className="text-2xl font-bold text-foreground mt-1">{warehouses.filter(w => w.active).length}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Productos</p>
                <p className="text-2xl font-bold text-foreground mt-1">{warehouses.reduce((sum, w) => sum + w.products, 0).toLocaleString('es-CL')}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Movimientos Mes</p>
                <p className="text-2xl font-bold text-foreground mt-1">{warehouses.reduce((sum, w) => sum + w.movements, 0).toLocaleString('es-CL')}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Buscar por nombre, código, ciudad..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-colors"
              />
            </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Warehouses Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
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
              {filteredWarehouses.map((warehouse, index) => {
                const typeConfig = getTypeConfig(warehouse.type);
                return (
                  <TableRow key={warehouse.id}>
                    <TableCell>
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Warehouse className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{warehouse.name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{warehouse.code}</TableCell>
                    <TableCell>
                      <Badge variant={typeConfig.variant} className="gap-1">
                        {typeConfig.icon}
                        {typeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-foreground">{warehouse.city}</p>
                        <p className="text-xs text-muted-foreground">{warehouse.region}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span>{warehouse.manager}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{warehouse.products.toLocaleString('es-CL')}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{warehouse.movements.toLocaleString('es-CL')}</TableCell>
                    <TableCell>
                      <Badge variant={warehouse.active ? 'success' : 'neutral'}>
                        {warehouse.active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/dashboard/bodega/${warehouse.id}/detail`}>
                          <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-blue-50 rounded transition-colors" aria-label="Layout">
                            <LayoutGrid className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link href={`/dashboard/warehouses/${warehouse.id}/edit`}>
                          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors" aria-label="Editar">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button disabled className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded transition-colors opacity-50 cursor-not-allowed" aria-label="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <p>Mostrando 1 a {filteredWarehouses.length} de {warehouses.length} bodegas</p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled>Anterior</Button>
          <Button variant="secondary" size="sm" disabled>Siguiente</Button>
        </div>
      </div>
    </div>
  );
}

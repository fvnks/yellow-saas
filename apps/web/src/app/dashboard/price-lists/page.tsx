'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select, KPICard } from '@yellow-erp/ui';
import { Plus, Edit, Trash2, Copy, Tag, Percent, Star, List } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

const fallbackLists: any[] = [];

const fallbackProducts: any[] = [];

export default function PriceListsPage() {
  const [priceLists, setPriceLists] = useState(fallbackLists);
  const [listProducts, setListProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState('1');

  useEffect(() => {
    const api = getApiClient();
    api.getPriceLists()
      .then(res => {
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map(list => ({
            id: list.id,
            name: list.name,
            description: '',
            products: list.items_count,
            status: list.is_default ? 'default' : 'active',
            createdAt: new Date().toISOString().split('T')[0],
          }));
          setPriceLists(mapped);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalLists = priceLists.length;
  const productsWithPrice = priceLists.reduce((sum, list) => sum + list.products, 0);
  const avgDiscount = 0;
  const defaultList = priceLists.find(l => l.status === 'default')?.name || 'Lista General';

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'default': return { label: 'Por defecto', variant: 'info' as const };
      case 'active': return { label: 'Activa', variant: 'success' as const };
      case 'inactive': return { label: 'Inactiva', variant: 'neutral' as const };
      default: return { label: status, variant: 'neutral' as const };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Listas de Precio</h1>
          <p className="text-sm text-slate-500 mt-1">Gestin de precios y descuentos por cliente</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Lista
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Total Listas"
          value={totalLists.toString()}
          change="Configuradas"
          changeType="neutral"
          icon={List}
          iconColor="indigo"
        />
        <KPICard
          label="Productos con Precio"
          value={productsWithPrice.toString()}
          change="En todas las listas"
          changeType="neutral"
          icon={Tag}
          iconColor="emerald"
        />
        <KPICard
          label="Descuento Promedio"
          value={`${avgDiscount}%`}
          change="Sobre precio general"
          changeType="neutral"
          icon={Percent}
          iconColor="amber"
        />
        <KPICard
          label="Lista por Defecto"
          value={defaultList}
          change="Aplicada automticamente"
          changeType="neutral"
          icon={Star}
          iconColor="blue"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listas de Precio</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripcin</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceLists.map(list => {
                const status = getStatusConfig(list.status);
                return (
                  <TableRow key={list.id}>
                    <TableCell className="font-medium">{list.name}</TableCell>
                    <TableCell>{list.description}</TableCell>
                    <TableCell>{list.products}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>{new Date(list.createdAt).toLocaleDateString('es-CL')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Productos en Lista Seleccionada</CardTitle>
            <Select
              value={selectedList}
              onChange={(e) => setSelectedList(e.target.value)}
              options={priceLists.map(l => ({ value: l.id, label: l.name }))}
              className="w-48"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Precio Lista</TableHead>
                <TableHead>Precio General</TableHead>
                <TableHead>Diferencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>${product.listPrice.toLocaleString('es-CL')}</TableCell>
                  <TableCell>${product.generalPrice.toLocaleString('es-CL')}</TableCell>
                  <TableCell>
                    <span className={product.difference < 0 ? 'text-emerald-600' : product.difference > 0 ? 'text-rose-600' : 'text-slate-500'}>
                      {product.difference === 0 ? '-' : `$${product.difference.toLocaleString('es-CL')}`}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select } from '@yellow-erp/ui';
import { Plus, Search, Filter, Download, Eye, Trash2, Truck, Phone, Mail, MapPin, CreditCard, Building2, Package } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const initialSuppliers: any[] = [];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');

  useEffect(() => {
    const api = getApiClient();
    api.getSuppliers().then(res => {
      const apiData = res.data || [];
      if (apiData.length > 0) {
        const mapped = apiData.map((s) => ({
          id: s.id,
          code: `SUP-${s.id.slice(0, 6)}`,
          name: s.name || '',
          tradeName: s.name || '',
          taxId: s.tax_id || '',
          phone: s.phone || '',
          email: s.email || '',
          address: '',
          city: '',
          region: '',
          paymentTerms: 30,
          creditLimit: 0,
          currentBalance: 0,
          currency: 'CLP',
          isActive: true,
          products: 0,
        }));
        setSuppliers(mapped);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.taxId.includes(search) || s.tradeName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.isActive === (statusFilter === 'active');
    const matchesCurrency = currencyFilter === 'all' || s.currency === currencyFilter;
    return matchesSearch && matchesStatus && matchesCurrency;
  });

  const getTaxIdType = (taxId: string) => {
    if (/^[0-9]{7,8}-[0-9]$/.test(taxId)) return 'RUT';
    return 'OTRO';
  };

  const getStatusConfig = (isActive: boolean) => {
    if (isActive) return { label: 'Activo', variant: 'success' as const };
    return { label: 'Inactivo', variant: 'danger' as const };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Proveedores</h1>
          <p className="text-sm text-slate-500 mt-1">Gestin de proveedores y contacto comercial</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Link href="/dashboard/suppliers/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proveedor
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Proveedores</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{suppliers.length}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Activos</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{suppliers.filter(s => s.isActive).length}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Crdito Pendiente</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">${suppliers.filter(s => s.currentBalance > 0).reduce((sum, s) => sum + s.currentBalance, 0).toLocaleString('es-CL')}</p>
              </div>
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Productos Provedos</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{suppliers.reduce((sum, s) => sum + s.products, 0).toLocaleString('es-CL')}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-amber-600" />
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                placeholder="Buscar por nombre, RUT, razn social..."
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
              placeholder="Moneda"
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Todas' },
                { value: 'CLP', label: 'CLP' },
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
              ]}
              className="w-full sm:w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>RUT</TableHead>
                <TableHead>Comercial</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead className="text-center">Plazo</TableHead>
                <TableHead className="text-center">Lmite Crdito</TableHead>
                <TableHead className="text-right">Saldo Actual</TableHead>
                <TableHead className="text-center">Productos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-12">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier, index) => {
                const taxIdType = getTaxIdType(supplier.taxId);
                const statusConfig = getStatusConfig(supplier.isActive);
                return (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-slate-900">{supplier.taxId}</span>
                        <span className="text-xs text-slate-500">({taxIdType})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{supplier.tradeName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <a href={`tel:${supplier.phone}`} className="text-slate-700 hover:text-slate-900">{supplier.phone}</a>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <a href={`mailto:${supplier.email}`} className="text-slate-700 hover:text-slate-900 truncate">{supplier.email}</a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{supplier.city}</span>
                      </div>
                      <div className="text-xs text-slate-500">{supplier.region}</div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{supplier.paymentTerms} das</TableCell>
                    <TableCell className="text-center font-medium">${supplier.creditLimit.toLocaleString('es-CL')}</TableCell>
                    <TableCell className="text-right font-bold" style={{ color: supplier.currentBalance > 0 ? '#e11d48' : '#059669' }}>
                      ${supplier.currentBalance.toLocaleString('es-CL')}
                    </TableCell>
                    <TableCell className="text-center font-medium">{supplier.products.toLocaleString('es-CL')}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/dashboard/suppliers/${supplier.id}`}>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" aria-label="Ver">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={async () => {
                            if (!confirm('¿Eliminar este proveedor?')) return;
                            try {
                              const api = getApiClient();
                              await api.deleteSupplier(supplier.id);
                              setSuppliers(prev => prev.filter(s => s.id !== supplier.id));
                            } catch (err) {
                              toast.error('Error al eliminar proveedor');
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          aria-label="Eliminar"
                        >
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
      <div className="flex items-center justify-between text-xs text-slate-500">
        <p>Mostrando 1 a {filteredSuppliers.length} de {suppliers.length} proveedores</p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled>Anterior</Button>
          <Button variant="secondary" size="sm" disabled>Siguiente</Button>
        </div>
      </div>
    </div>
  );
}

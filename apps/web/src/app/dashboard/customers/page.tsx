'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select } from '@yellow-erp/ui';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Users, Phone, Mail, MapPin, CreditCard, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiClient } from '@/lib/api-client';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [taxExemptFilter, setTaxExemptFilter] = useState('all');

  useEffect(() => {
    const api = getApiClient();
    api.getCustomers().then(res => {
      const apiData = res.data || [];
      const mapped = apiData.map((c) => ({
        id: c.id,
        code: `CUST-${c.id.slice(0, 6)}`,
        name: c.name || '',
        tradeName: c.name || '',
        taxId: c.tax_id || '',
        phone: c.phone || '',
        email: c.email || '',
        address: c.address || '',
        city: '',
        region: '',
        paymentTerms: 30,
        creditLimit: 0,
        currentBalance: 0,
        priceListId: '',
        taxExempt: false,
        status: 'active',
      }));
      setCustomers(mapped);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.taxId.includes(search) || c.tradeName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesTaxExempt = taxExemptFilter === 'all' || (taxExemptFilter === 'exempt' && c.taxExempt) || (taxExemptFilter === 'non-exempt' && !c.taxExempt);
    return matchesSearch && matchesStatus && matchesTaxExempt;
  });

  const getTaxIdType = (taxId: string) => {
    if (/^[0-9]{7,8}-[0-9]$/.test(taxId)) return 'RUT';
    return 'OTRO';
  };

  const getTaxExemptConfig = (taxExempt: boolean) => {
    if (taxExempt) return { label: 'Exento', variant: 'success' as const };
    return { label: 'No Exento', variant: 'neutral' as const };
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Activo', variant: 'success' as const };
      case 'suspended': return { label: 'Suspendido', variant: 'danger' as const };
      case 'prospect': return { label: 'Prospecto', variant: 'warning' as const };
      default: return { label: status, variant: 'neutral' as const };
    }
  };

  const handleExport = useCallback(() => {
    if (filteredCustomers.length === 0) return;
    const headers = ['Nombre', 'RUT', 'Email', 'Teléfono', 'Dirección', 'Estado'];
    const rows = filteredCustomers.map(c => [c.name, c.taxId, c.email, c.phone, c.address, c.status]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredCustomers]);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!confirm(`¿Eliminar cliente "${name}"?`)) return;
    try {
      const api = getApiClient();
      await api.deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('Error al eliminar cliente');
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de clientes y contacto comercial</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Link href="/dashboard/customers/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
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
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Clientes</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{customers.length}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Activos</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{customers.filter(c => c.status === 'active').length}</p>
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
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exentos IVA</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{customers.filter(c => c.taxExempt).length}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Crédito Pendiente</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">${(customers.filter(c => c.currentBalance > 0).reduce((sum, c) => sum + c.currentBalance, 0) || 0).toLocaleString('es-CL')}</p>
              </div>
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-rose-600" />
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
                placeholder="Buscar por nombre, RUT, razón social..."
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
                { value: 'suspended', label: 'Suspendidos' },
                { value: 'prospect', label: 'Prospectos' },
              ]}
              className="w-full sm:w-40"
            />
            <Select
              placeholder="IVA"
              value={taxExemptFilter}
              onChange={(e) => setTaxExemptFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'exempt', label: 'Exentos' },
                { value: 'non-exempt', label: 'No Exentos' },
              ]}
              className="w-full sm:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
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
                <TableHead className="text-center">L�mite Crédito</TableHead>
                <TableHead className="text-right">Saldo Actual</TableHead>
                <TableHead>IVA</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-12">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer, index) => {
                const taxIdType = getTaxIdType(customer.taxId);
                const taxExemptConfig = getTaxExemptConfig(customer.taxExempt);
                const statusConfig = getStatusConfig(customer.status);
                return (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-slate-900">{customer.taxId}</span>
                        <span className="text-xs text-slate-500">({taxIdType})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{customer.tradeName}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">RUT: {customer.taxId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <a href={`tel:${customer.phone}`} className="text-slate-700 hover:text-slate-900">{customer.phone}</a>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <a href={`mailto:${customer.email}`} className="text-slate-700 hover:text-slate-900 truncate">{customer.email}</a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{customer.city}</span>
                      </div>
                      <div className="text-xs text-slate-500">{customer.region}</div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{customer.paymentTerms} días</TableCell>
                    <TableCell className="text-center font-medium">${(customer.creditLimit || 0).toLocaleString('es-CL')}</TableCell>
                    <TableCell className="text-right font-bold" style={{ color: (customer.currentBalance || 0) > 0 ? '#e11d48' : '#059669' }}>
                      ${(customer.currentBalance || 0).toLocaleString('es-CL')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={taxExemptConfig.variant} className="text-[9px]">
                        {taxExemptConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/dashboard/customers/${customer.id}`}>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" aria-label="Ver">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link href={`/dashboard/customers/${customer.id}/edit`}>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" aria-label="Editar">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button onClick={() => handleDelete(customer.id, customer.name)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" aria-label="Eliminar">
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
        <p>Mostrando 1 a {filteredCustomers.length} de {customers.length} clientes</p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled>Anterior</Button>
          <Button variant="secondary" size="sm" disabled>Siguiente</Button>
        </div>
      </div>
    </div>
  );
}

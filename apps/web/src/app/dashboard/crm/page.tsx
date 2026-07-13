'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select } from '@yellow-erp/ui';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Handshake, Users, Phone, Mail, MapPin, UserCheck, TrendingUp, Clock, Building2 } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '../../../lib/api-client';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  company: string;
  companyId: string;
  lastContact: string;
  nextContact: string;
  status: string;
  score: number;
}

export default function CRMPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const api = getApiClient();
    api.getCustomers().then(res => {
      const mapped = (res.data || []).map((c: Record<string, unknown>, i: number) => ({
        id: String(c.id),
        name: String(c.name || ''),
        email: String(c.email || ''),
        phone: String(c.phone || ''),
        role: 'Contacto',
        company: String(c.name || ''),
        companyId: String(c.id),
        lastContact: new Date().toISOString().slice(0, 10),
        nextContact: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        status: 'active',
        score: 80,
      }));
      setContacts(mapped);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Activo', variant: 'success' as const };
      case 'inactive': return { label: 'Inactivo', variant: 'danger' as const };
      case 'prospect': return { label: 'Prospecto', variant: 'warning' as const };
      default: return { label: status, variant: 'neutral' as const };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 font-bold';
    if (score >= 80) return 'text-emerald-600 font-medium';
    if (score >= 70) return 'text-amber-600';
    return 'text-slate-600';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">CRM</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de relaciones con clientes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Link href="/dashboard/crm/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Contacto
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Contactos</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{contacts.length}</p>
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
                <p className="text-2xl font-bold text-slate-900 mt-1">{contacts.filter(c => c.status === 'active').length}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prospectos</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{contacts.filter(c => c.status === 'prospect').length}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sin Contacto</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{contacts.filter(c => new Date(c.nextContact) < new Date()).length}</p>
              </div>
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Score Promedio</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{contacts.length ? Math.round(contacts.reduce((sum, c) => sum + c.score, 0) / contacts.length) : 0}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Handshake className="w-5 h-5 text-blue-600" />
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
                placeholder="Buscar por nombre, email, empresa..."
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
                { value: 'prospect', label: 'Prospectos' },
                { value: 'inactive', label: 'Inactivos' },
              ]}
              className="w-full sm:w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Ãšltimo Contacto</TableHead>
                <TableHead>Próximo Contacto</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-12">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => {
                const statusConfig = getStatusConfig(contact.status);
                return (
                  <TableRow key={contact.id} className={new Date(contact.nextContact) < new Date() ? 'bg-rose-50' : ''}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {contact.company}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <a href={`mailto:${contact.email}`} className="text-slate-700 hover:text-slate-900 truncate">{contact.email}</a>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <a href={`tel:${contact.phone}`} className="text-slate-700 hover:text-slate-900">{contact.phone}</a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">{contact.role}</TableCell>
                    <TableCell className="text-sm">{contact.lastContact}</TableCell>
                    <TableCell className={new Date(contact.nextContact) < new Date() ? 'text-rose-600 font-medium' : ''}>{contact.nextContact}</TableCell>
                    <TableCell className={getScoreColor(contact.score)}>{contact.score}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.variant} className="gap-1">
                        <Handshake className="w-3 h-3" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" aria-label="Ver">
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link href={`/dashboard/crm/${contact.id}/edit`}>
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
        <p>Mostrando 1 a {filteredContacts.length} de {contacts.length} contactos</p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled>Anterior</Button>
          <Button variant="secondary" size="sm" disabled>Siguiente</Button>
        </div>
      </div>
    </div>
  );
}


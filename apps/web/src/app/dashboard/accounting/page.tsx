'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select } from '@yellow-erp/ui';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Calculator, Building2, TrendingUp, DollarSign, FileText, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '../../../lib/api-client';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  balance: number;
  isActive: boolean;
  isSystem: boolean;
}

interface Tax {
  id: string;
  code: string;
  name: string;
  rate: number;
  type: string;
  isDefault: boolean;
  sriCode: string;
}

export default function AccountingPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [taxFilter, setTaxFilter] = useState('all');

  useEffect(() => {
    const api = getApiClient();
    api.getJournalEntries().then((entries) => {
      const mapped: Account[] = (entries.data || []).map((e) => ({
        id: String(e.id),
        code: String(e.entry_number || ''),
        name: String(e.description || ''),
        type: 'expense',
        balance: Number(e.total_debit || 0),
        isActive: true,
        isSystem: false,
      }));
      setAccounts(mapped);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredAccounts = accounts.filter(a => {
    const matchesSearch = a.code.includes(search) || a.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'asset': return { label: 'Activo', variant: 'success' as const };
      case 'liability': return { label: 'Pasivo', variant: 'info' as const };
      case 'equity': return { label: 'Patrimonio', variant: 'warning' as const };
      case 'income': return { label: 'Ingresos', variant: 'success' as const };
      case 'expense': return { label: 'Gastos', variant: 'danger' as const };
      default: return { label: type, variant: 'neutral' as const };
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance >= 0) return 'text-slate-900';
    return 'text-rose-600';
  };

  const totalAssets = accounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = accounts.filter(a => a.type === 'equity').reduce((sum, a) => sum + a.balance, 0);
  const totalIncome = accounts.filter(a => a.type === 'income').reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = accounts.filter(a => a.type === 'expense').reduce((sum, a) => sum + a.balance, 0);
  const netIncome = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Contabilidad</h1>
          <p className="text-sm text-slate-500 mt-1">Libro mayor, asientos contables y configuraci�n fiscal</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar Balances
          </Button>
          <Link href="/dashboard/accounting/journal/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Asiento
            </Button>
          </Link>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Activos</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">${totalAssets.toLocaleString('es-CL')}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pasivos</p>
                <p className="text-xl font-bold text-blue-600 mt-1">${totalLiabilities.toLocaleString('es-CL')}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patrimonio</p>
                <p className="text-xl font-bold text-amber-600 mt-1">${totalEquity.toLocaleString('es-CL')}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingresos</p>
                <p className="text-xl font-bold text-indigo-600 mt-1">${totalIncome.toLocaleString('es-CL')}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gastos</p>
                <p className="text-xl font-bold text-rose-600 mt-1">${totalExpenses.toLocaleString('es-CL')}</p>
              </div>
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <Calculator className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart of Accounts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Plan de Cuentas</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              placeholder="Tipo"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'asset', label: 'Activo' },
                { value: 'liability', label: 'Pasivo' },
                { value: 'equity', label: 'Patrimonio' },
                { value: 'income', label: 'Ingresos' },
                { value: 'expense', label: 'Gastos' },
              ]}
              className="w-32"
            />
            <Button variant="secondary" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>C�digo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Saldo Actual</TableHead>
                <TableHead className="w-12">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => {
                const typeConfig = getTypeConfig(account.type);
                return (
                  <TableRow key={account.id}>
                    <TableCell className="font-mono font-medium">{account.code}</TableCell>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>
                      <Badge variant={typeConfig.variant} className="gap-1">
                        <Calculator className="w-3 h-3" />
                        {typeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${getBalanceColor(account.balance)}`}>
                      ${account.balance.toLocaleString('es-CL')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" aria-label="Ver">
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link href={`/dashboard/accounting/accounts/${account.id}/edit`}>
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
          </div>
        </CardContent>
      </Card>

      {/* Tax Rates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Impuestos Configurados</CardTitle>
          <Link href="/dashboard/accounting/taxes" className="text-sm text-slate-500 hover:text-slate-700 font-medium">
            Ver todos
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>C�digo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Tasa</TableHead>
                <TableHead className="text-center">SRI</TableHead>
                <TableHead className="text-center">Por Defecto</TableHead>
                <TableHead className="w-12">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxes.map((tax) => {
                const typeConfig = getTypeConfig(tax.type);
                return (
                  <TableRow key={tax.id}>
                    <TableCell className="font-mono font-medium">{tax.code}</TableCell>
                    <TableCell className="font-medium">{tax.name}</TableCell>
                    <TableCell>
                      <Badge variant={typeConfig.variant} className="text-[9px]">{typeConfig.label}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">% {tax.rate}</TableCell>
                    <TableCell className="text-center text-slate-500 font-mono text-[9px]">{tax.sriCode}</TableCell>
                    <TableCell className="text-center">
                      {tax.isDefault ? (<Badge variant="success" className="text-[9px]">S�</Badge>) : (<span className="text-xs text-slate-400">No</span>)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" aria-label="Ver">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" aria-label="Editar">
                          <Edit className="w-4 h-4" />
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
    </div>
  );
}


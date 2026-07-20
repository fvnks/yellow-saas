'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select } from '@yellow-erp/ui';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Calculator, Building2, TrendingUp, DollarSign, FileText, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

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
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [taxFilter, setTaxFilter] = useState('all');
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editForm, setEditForm] = useState({ name: '', type: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getAccounts({ limit: '500' }).catch(() => ({ data: [] })),
      api.getTaxes().catch(() => ({ data: [] })),
      api.getJournalEntries({ limit: '5', sort: 'created_at', order: 'desc' }).catch(() => ({ data: [] })),
    ]).then(([accountsRes, taxesRes, entriesRes]) => {
      const mapped: Account[] = (accountsRes.data || []).map((a: any) => ({
        id: String(a.id),
        code: String(a.code || ''),
        name: String(a.name || ''),
        type: a.type || 'expense',
        balance: Number(a.balance || 0),
        isActive: a.is_active !== false,
        isSystem: a.is_system || false,
      }));
      setAccounts(mapped);
      setTaxes((taxesRes.data || []).map((t: any) => ({
        id: t.id,
        code: t.code || '',
        name: t.name || '',
        rate: t.rate || 0,
        type: t.type || 'IVA',
        isDefault: t.is_default || false,
        sriCode: t.sri_code || '',
        isActive: t.is_active !== false,
      })));
      setRecentEntries(entriesRes.data || []);
      setLoading(false);
    });
  }, []);

  const filteredAccounts = accounts.filter(a => {
    const matchesSearch = a.code.includes(search) || a.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setEditForm({ name: account.name, type: account.type, description: '' });
  };

  const handleSaveAccount = async () => {
    if (!editingAccount || !editForm.name) return;
    setSaving(true);
    try {
      const api = getApiClient();
      await api.updateAccount(editingAccount.id, { name: editForm.name, type: editForm.type });
      setEditingAccount(null);
      // Reload accounts
      const res = await api.getAccounts({ limit: '500' });
      const mapped = (res.data || []).map((a: any) => ({
        id: String(a.id), code: String(a.code || ''), name: String(a.name || ''),
        type: a.type || 'expense', balance: Number(a.balance || 0),
        isActive: a.is_active !== false, isSystem: a.is_system || false,
      }));
      setAccounts(mapped);
    } catch (err) { console.error(err); setError('No se pudieron guardar los cambios'); }
    setSaving(false);
  };

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
          <p className="text-sm text-slate-500 mt-1">Libro mayor, asientos contables y configuración fiscal</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar Balances
          </Button>
          <Link href="/dashboard/accounting/journal-entries/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Asiento
            </Button>
          </Link>
        </div>
      </div>

      {error && <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">{error}</div>}

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
                <TableHead>Código</TableHead>
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
                        <button onClick={() => handleEditAccount(account)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" aria-label="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
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
          <Link href="/dashboard/inventory/taxes" className="text-sm text-slate-500 hover:text-slate-700 font-medium">
            Ver todos
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
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
                      {tax.isDefault ? (<Badge variant="success" className="text-[9px]">S</Badge>) : (<span className="text-xs text-slate-400">No</span>)}
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

      {/* Recent Journal Entries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ultimos Asientos Contables</CardTitle>
          <Link href="/dashboard/accounting/journal-entries" className="text-sm text-slate-500 hover:text-slate-700 font-medium">
            Ver todos
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripcion</TableHead>
                <TableHead className="text-right">Debe</TableHead>
                <TableHead className="text-right">Haber</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-sm text-slate-500">
                    No hay asientos registrados
                  </TableCell>
                </TableRow>
              ) : recentEntries.map((entry: any) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono font-medium text-xs">{entry.entry_number}</TableCell>
                  <TableCell className="text-xs">{new Date(entry.date).toLocaleDateString('es-CL')}</TableCell>
                  <TableCell className="text-xs max-w-xs truncate">{entry.description}</TableCell>
                  <TableCell className="text-right text-xs font-medium">${Number(entry.total_debit).toLocaleString('es-CL')}</TableCell>
                  <TableCell className="text-right text-xs font-medium">${Number(entry.total_credit).toLocaleString('es-CL')}</TableCell>
                  <TableCell>
                    <Badge variant={entry.status === 'posted' ? 'success' : entry.status === 'reversed' ? 'danger' : 'neutral'} className="text-[9px]">
                      {entry.status === 'posted' ? 'Publicado' : entry.status === 'reversed' ? 'Revertido' : 'Borrador'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {editingAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Editar Cuenta</h2>
              <button onClick={() => setEditingAccount(null)} className="text-slate-400 hover:text-slate-600">X</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Codigo</label>
                <input type="text" value={editingAccount.code} disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Nombre *</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Tipo</label>
                <select value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="asset">Activo</option>
                  <option value="liability">Pasivo</option>
                  <option value="equity">Patrimonio</option>
                  <option value="income">Ingresos</option>
                  <option value="expense">Gastos</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setEditingAccount(null)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleSaveAccount} disabled={saving || !editForm.name}
                className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


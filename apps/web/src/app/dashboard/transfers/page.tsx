'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Badge, Button, Select } from '@yellow-erp/ui';
import { ArrowLeft, Plus, Search, Truck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface Transfer {
  id: string;
  transfer_number: string;
  status: string;
  notes: string | null;
  created_at: string;
  source_warehouse: { id: string; name: string; code: string };
  destination_warehouse: { id: string; name: string; code: string };
  items_count: number;
  total_quantity: number;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'info' | 'neutral' }> = {
  draft: { label: 'Borrador', variant: 'neutral' },
  pending: { label: 'Pendiente', variant: 'warning' },
  in_transit: { label: 'En Transito', variant: 'info' },
  delivered: { label: 'Entregada', variant: 'success' },
  cancelled: { label: 'Cancelada', variant: 'danger' },
};

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const api = getApiClient();
    api.getStockTransfers({ limit: '100' })
      .then((res: any) => {
        setTransfers(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = transfers.filter(t => {
    const matchSearch = !search ||
      t.transfer_number.toLowerCase().includes(search.toLowerCase()) ||
      t.source_warehouse?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.destination_warehouse?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/bodega" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Transferencias</h1>
            <p className="text-sm text-muted-foreground mt-1">Movimiento de stock entre bodegas</p>
          </div>
        </div>
        <Link href="/dashboard/transfers/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Transferencia
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Buscar por numero, bodega..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'draft', label: 'Borrador' },
                { value: 'pending', label: 'Pendiente' },
                { value: 'in_transit', label: 'En Transito' },
                { value: 'delivered', label: 'Entregada' },
                { value: 'cancelled', label: 'Cancelada' },
              ]}
              className="w-full sm:w-44"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-pulse bg-muted h-8 w-48 mx-auto rounded" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Truck className="w-10 h-10 text-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Sin transferencias</p>
                <Link href="/dashboard/transfers/new" className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:text-primary font-medium">
                  <Plus className="w-4 h-4" /> Crear primera transferencia
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Numero</th>
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Origen</th>
                    <th className="text-center px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider"></th>
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Destino</th>
                    <th className="text-center px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Items</th>
                    <th className="text-center px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                    <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const st = statusConfig[t.status] || statusConfig.draft;
                    return (
                      <tr key={t.id} className="border-b border-border hover:bg-muted transition-colors">
                        <td className="px-6 py-3">
                          <Link href={`/dashboard/transfers/${t.id}`} className="text-xs font-bold text-primary hover:text-primary">
                            {t.transfer_number}
                          </Link>
                        </td>
                        <td className="px-6 py-3 text-xs text-foreground">{t.source_warehouse?.name}</td>
                        <td className="px-6 py-3 text-center">
                          <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto" />
                        </td>
                        <td className="px-6 py-3 text-xs text-foreground">{t.destination_warehouse?.name}</td>
                        <td className="px-6 py-3 text-center text-xs text-foreground">{t.items_count}</td>
                        <td className="px-6 py-3 text-center">
                          <Badge variant={st.variant}>{st.label}</Badge>
                        </td>
                        <td className="px-6 py-3 text-xs text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString('es-CL')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

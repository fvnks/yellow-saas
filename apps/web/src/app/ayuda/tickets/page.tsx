'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Ticket, Plus, Search, MessageSquare, Inbox, Clock, CheckCircle2, XCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCompanyIdFromToken } from '@/lib/api-client';
import { toast } from 'sonner';

interface TicketItem {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  created_by_name: string;
  assigned_to_name: string | null;
  message_count: number;
}

const statusConfig: Record<string, { label: string; classes: string; icon: any }> = {
  open: { label: 'Abierto', classes: 'bg-blue-50 text-blue-700 border-blue-200', icon: Inbox },
  in_progress: { label: 'En progreso', classes: 'bg-amber-50 text-amber-700 border-amber-200', icon: Loader2 },
  resolved: { label: 'Resuelto', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  closed: { label: 'Cerrado', classes: 'bg-muted text-foreground border-border', icon: XCircle },
};

const priorityConfig: Record<string, { label: string; classes: string }> = {
  low: { label: 'Baja', classes: 'bg-muted text-foreground border-border' },
  medium: { label: 'Media', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  high: { label: 'Alta', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  urgent: { label: 'Urgente', classes: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function MisTicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ subject: '', priority: 'medium', message: '' });
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const getToken = () => document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];

  const fetchTickets = async () => {
    const companyId = getCompanyIdFromToken();
    if (!companyId) return;
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (filter !== 'all') params.set('status', filter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/companies/${companyId}/support/tickets?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setTickets(data.data.tickets || []);
        setTotal(data.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      fetchTickets();
    }, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [page, filter, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim()) { toast.error('Asunto es requerido'); return; }

    setSaving(true);
    const companyId = getCompanyIdFromToken();
    try {
      const res = await fetch(`/api/companies/${companyId}/support/tickets`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: form.subject, priority: form.priority, message: form.message }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Ticket creado correctamente');
        setForm({ subject: '', priority: 'medium', message: '' });
        setShowCreate(false);
        fetchTickets();
      } else {
        toast.error(data.error?.message || 'Error al crear ticket');
      }
    } catch {
      toast.error('Error al crear ticket');
    } finally {
      setSaving(false);
    }
  };

  const openCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Mis Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona tus solicitudes de soporte</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-150 active:scale-[0.98]">
          <Plus className="w-4 h-4" />
          {showCreate ? 'Cancelar' : 'Nuevo Ticket'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Nuevo Ticket de Soporte</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Asunto *</label>
              <input
                type="text"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="Describe el problema en pocas palabras"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Prioridad</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Descripción del problema</label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Explica con detalle qué sucede, qué acción realizabas y qué esperabas..."
                rows={4}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50">
                {saving ? 'Creando...' : 'Crear Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar tickets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f ? 'bg-primary text-white' : 'bg-muted text-foreground hover:bg-muted'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'in_progress' ? 'En progreso' : f === 'open' ? 'Abiertos' : f === 'resolved' ? 'Resueltos' : 'Cerrados'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Ticket</th>
              <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Prioridad</th>
              <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
              <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Última actividad</th>
              <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                </tr>
              ))
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <Ticket className="w-12 h-12 text-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">{search || filter !== 'all' ? 'No hay tickets que coincidan' : 'No tienes tickets de soporte'}</p>
                  <p className="text-xs text-muted-foreground mt-1">{openCount > 0 ? 'Puedes crear uno cuando lo necesites' : 'Cuando crees un ticket aparecerá aquí'}</p>
                </td>
              </tr>
            ) : (
              tickets.map(ticket => {
                const st = statusConfig[ticket.status] || statusConfig.open;
                const pr = priorityConfig[ticket.priority] || priorityConfig.medium;
                const StatusIcon = st.icon;
                return (
                  <tr key={ticket.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground">{ticket.subject}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Creado {new Date(ticket.created_at).toLocaleString('es-CL')}
                        {ticket.message_count > 0 && (
                          <span className="ml-2 inline-flex items-center gap-0.5">
                            <MessageSquare className="w-3 h-3" />
                            {ticket.message_count}
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${pr.classes}`}>
                        {pr.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border ${st.classes}`}>
                        <StatusIcon className="w-3 h-3" />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(ticket.updated_at).toLocaleString('es-CL')}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/ayuda/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <p>Mostrando {total === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} de {total}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-1.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-foreground">Página {page} de {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

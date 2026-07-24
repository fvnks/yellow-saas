'use client';

import { useEffect, useState } from 'react';
import { Headphones, Plus, Search, Building2, AlertTriangle, CheckCircle, Clock, MessageSquare, Send, X } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  company_id: string;
  created_by_name: string;
  assigned_to_name: string;
}

interface TicketDetail extends Ticket {
  messages: { id: string; sender_type: string; sender_name: string; message: string; created_at: string }[];
}

interface Company {
  id: string;
  name: string;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ company_id: '', subject: '', priority: 'medium', message: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTickets();
    fetchCompanies();
  }, []);

  const getToken = () => document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/super-admin/support', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setTickets(data.data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/super-admin/companies', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setCompanies(data.data);
    } catch (err) {
      console.error('Failed to load companies:', err);
    }
  };

  const fetchTicketDetail = async (ticketId: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/super-admin/support/${ticketId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setSelectedTicket(data.data);
    } catch (err) {
      console.error('Failed to load ticket:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/super-admin/support', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Ticket creado correctamente' });
        setForm({ company_id: '', subject: '', priority: 'medium', message: '' });
        setShowCreate(false);
        fetchTickets();
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Error al crear' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/super-admin/support/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyText('');
        fetchTicketDetail(selectedTicket.id);
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    try {
      await fetch(`/api/super-admin/support/${ticketId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchTickets();
      if (selectedTicket?.id === ticketId) fetchTicketDetail(ticketId);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filtered = tickets.filter(t => {
    const matchFilter = filter === 'all' || t.status === filter;
    const matchSearch = search === '' || t.subject.toLowerCase().includes(search.toLowerCase()) || t.company_name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const priorityColors: Record<string, string> = {
    low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const statusColors: Record<string, string> = {
    open: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  if (selectedTicket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">{selectedTicket.subject}</h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${priorityColors[selectedTicket.priority]}`}>
                {selectedTicket.priority}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusColors[selectedTicket.status]}`}>
                {selectedTicket.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{selectedTicket.company_name} — {new Date(selectedTicket.created_at).toLocaleString('es-CL')}</p>
          </div>
          <div className="flex items-center gap-2">
            {['open', 'in_progress', 'resolved', 'closed'].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(selectedTicket.id, s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedTicket.status === s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {s === 'in_progress' ? 'En progreso' : s === 'open' ? 'Abierto' : s === 'resolved' ? 'Resuelto' : 'Cerrado'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 max-h-[500px] overflow-y-auto">
          {loadingDetail ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-slate-800 rounded-lg animate-pulse" />)}
            </div>
          ) : selectedTicket.messages.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">No hay mensajes aún</p>
          ) : (
            selectedTicket.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_type === 'super_admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-xl px-4 py-3 ${
                  msg.sender_type === 'super_admin' ? 'bg-indigo-600/20 border border-indigo-500/20' : 'bg-slate-800 border border-slate-700'
                }`}>
                  <p className="text-[10px] font-bold text-slate-400 mb-1">{msg.sender_name} — {new Date(msg.created_at).toLocaleString('es-CL')}</p>
                  <p className="text-sm text-white">{msg.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Escribe tu respuesta..."
            onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleSendReply}
            disabled={sending || !replyText.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Soporte</h1>
          <p className="text-sm text-slate-400 mt-1">Gestiona tickets de soporte de las empresas</p>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); setMessage({ type: '', text: '' }); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showCreate ? 'Cancelar' : 'Nuevo Ticket'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Crear Ticket de Soporte</h3>
          {message.text && (
            <div className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {message.text}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Empresa</label>
                <select
                  value={form.company_id}
                  onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Seleccionar...</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Asunto</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Asunto del ticket"
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Prioridad</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Mensaje</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Descripción del problema..."
                rows={3}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50">
                {saving ? 'Creando...' : 'Crear Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'in_progress' ? 'En progreso' : f === 'open' ? 'Abiertos' : f === 'resolved' ? 'Resueltos' : 'Cerrados'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Ticket</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Prioridad</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="text-left px-6 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-slate-800 rounded animate-pulse" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Headphones className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No hay tickets de soporte</p>
                </td>
              </tr>
            ) : (
              filtered.map((ticket) => (
                <tr key={ticket.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-white">{ticket.subject}</p>
                    <p className="text-[10px] text-slate-500">{ticket.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      {ticket.company_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${priorityColors[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusColors[ticket.status]}`}>
                      {ticket.status === 'in_progress' ? 'En progreso' : ticket.status === 'open' ? 'Abierto' : ticket.status === 'resolved' ? 'Resuelto' : 'Cerrado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {new Date(ticket.created_at).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => fetchTicketDetail(ticket.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

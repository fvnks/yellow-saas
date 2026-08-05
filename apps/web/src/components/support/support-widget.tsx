'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LifeBuoy, X, Send, Plus, BookOpen, MessageSquare,
  Inbox, Clock, CheckCircle2, Loader2, ChevronLeft, Headphones
} from 'lucide-react';
import { getCompanyIdFromToken } from '@/lib/api-client';
import { toast } from 'sonner';

interface TicketItem {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface Message {
  id: string;
  sender_type: string;
  sender_name: string;
  message: string;
  created_at: string;
}

interface TicketDetail {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  assigned_to_name: string | null;
  messages: Message[];
}

const statusConfig: Record<string, { label: string; classes: string; icon: any }> = {
  open: { label: 'Abierto', classes: 'bg-blue-50 text-blue-700 border-blue-200', icon: Inbox },
  in_progress: { label: 'En progreso', classes: 'bg-amber-50 text-amber-700 border-amber-200', icon: Loader2 },
  resolved: { label: 'Resuelto', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  closed: { label: 'Cerrado', classes: 'bg-slate-100 text-slate-600 border-slate-200', icon: CheckCircle2 },
};

const priorityConfig: Record<string, { label: string; classes: string }> = {
  low: { label: 'Baja', classes: 'bg-slate-100 text-slate-600 border-slate-200' },
  medium: { label: 'Media', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  high: { label: 'Alta', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  urgent: { label: 'Urgente', classes: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export function SupportWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'menu' | 'create' | 'list' | 'chat'>('menu');
  const [unread, setUnread] = useState(0);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ subject: '', priority: 'medium', message: '' });
  const [saving, setSaving] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const getToken = () => document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
  const companyId = getCompanyIdFromToken();

  const isErmPath = pathname.startsWith('/dashboard')
    || pathname.startsWith('/hr')
    || pathname.startsWith('/projects')
    || pathname.startsWith('/mi-cuenta')
    || pathname.startsWith('/recetas');

  const fetchUnread = async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`/api/companies/${companyId}/support/summary`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setUnread(Number(data.data.unread) || 0);
    } catch {
      // noop
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 20000);
    return () => clearInterval(interval);
  }, [companyId]);

  useEffect(() => {
    if (!chatBottomRef.current) return;
    chatBottomRef.current.scrollTop = chatBottomRef.current.scrollHeight;
  }, [ticket?.messages?.length]);

  const fetchTickets = async () => {
    if (!companyId) return;
    setLoadingTickets(true);
    try {
      const res = await fetch(`/api/companies/${companyId}/support/tickets?limit=6`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setTickets(data.data.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const openTicket = async (ticketId: string) => {
    if (!companyId) return;
    setLoadingChat(true);
    setView('chat');
    try {
      const res = await fetch(`/api/companies/${companyId}/support/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setTicket(data.data);
        setUnread(0);
        fetchUnread();
      } else {
        toast.error(data.error?.message || 'Error al cargar ticket');
      }
    } catch {
      toast.error('Error al cargar ticket');
    } finally {
      setLoadingChat(false);
    }
  };

  const refreshTicket = async (ticketId: string) => {
    if (!companyId || !open) return;
    try {
      const res = await fetch(`/api/companies/${companyId}/support/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setTicket(prev => {
          if (!prev || prev.id !== ticketId) return prev;
          return data.data;
        });
      }
    } catch {
      // noop
    }
  };

  useEffect(() => {
    if (!open || view !== 'chat' || !ticket) return;
    const interval = setInterval(() => refreshTicket(ticket.id), 10000);
    return () => clearInterval(interval);
  }, [open, view, ticket?.id]);


  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim()) { toast.error('Asunto es requerido'); return; }
    if (!companyId) return;
    setSaving(true);
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
        openTicket(data.data.id);
      } else {
        toast.error(data.error?.message || 'Error al crear ticket');
      }
    } catch {
      toast.error('Error al crear ticket');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!replyText.trim() || !ticket || !companyId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/companies/${companyId}/support/tickets/${ticket.id}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyText('');
        openTicket(ticket.id);
      } else {
        toast.error(data.error?.message || 'Error al enviar mensaje');
      }
    } catch {
      toast.error('Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  const closeWidget = () => {
    setOpen(false);
    setView('menu');
    setTicket(null);
  };

  if (!isErmPath || !companyId) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl flex items-center justify-center transition-all active:scale-95"
        aria-label="Ayuda y soporte"
      >
        {open ? <X className="w-6 h-6" /> : <LifeBuoy className="w-6 h-6" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
            {unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[60] w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 bg-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Headphones className="w-5 h-5" />
              <div>
                <p className="text-sm font-bold">Ayuda y Soporte</p>
                <p className="text-[10px] text-blue-100">Respuesta del equipo Yellow</p>
              </div>
            </div>
            <button onClick={closeWidget} className="text-blue-100 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-[380px] max-h-[420px] overflow-y-auto">
            {view === 'menu' && (
              <div className="p-4 space-y-3">
                <button
                  onClick={() => { setView('create'); }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Nuevo ticket</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Crea una solicitud de soporte</p>
                  </div>
                </button>
                <button
                  onClick={() => { setView('list'); fetchTickets(); }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Mis tickets</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Conversa con nuestro equipo</p>
                  </div>
                  {unread > 0 && (
                    <span className="min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => router.push('/ayuda')}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Centro de Ayuda</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Preguntas frecuentes y guías</p>
                  </div>
                </button>
              </div>
            )}

            {view === 'create' && (
              <div className="p-4">
                <button
                  onClick={() => setView('menu')}
                  className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-3 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Volver
                </button>
                <form onSubmit={handleCreate} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Asunto *</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      placeholder="Describe el problema en pocas palabras"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Prioridad</label>
                    <select
                      value={form.priority}
                      onChange={e => setForm({ ...form, priority: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Mensaje</label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Explica qué sucede..."
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Creando...' : 'Crear ticket'}
                  </button>
                </form>
              </div>
            )}

            {view === 'list' && (
              <div className="p-4">
                <button
                  onClick={() => setView('menu')}
                  className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-3 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Volver
                </button>
                {loadingTickets ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)}
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">No tienes tickets de soporte</p>
                    <button
                      onClick={() => setView('create')}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Crear uno
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tickets.map(t => {
                      const st = statusConfig[t.status] || statusConfig.open;
                      const pr = priorityConfig[t.priority] || priorityConfig.medium;
                      const StatusIcon = st.icon;
                      const openStatus = t.status === 'open' || t.status === 'in_progress';
                      return (
                        <button
                          key={t.id}
                          onClick={() => openTicket(t.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{t.subject}</p>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border flex-shrink-0 ${st.classes}`}>
                                <StatusIcon className="w-3 h-3" />
                                {st.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${pr.classes}`}>
                                {pr.label}
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(t.updated_at).toLocaleString('es-CL')}
                              </span>
                              {openStatus && t.message_count > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400">
                                  <MessageSquare className="w-3 h-3" />
                                  {t.message_count}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    <button
                      onClick={() => router.push('/ayuda/tickets')}
                      className="w-full text-center text-xs font-medium text-blue-600 hover:underline py-2"
                    >
                      Ver todos los tickets
                    </button>
                  </div>
                )}
              </div>
            )}

            {view === 'chat' && (
              <div className="flex flex-col h-[420px]">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => { setView('list'); setTicket(null); fetchTickets(); }}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{ticket?.subject}</p>
                    {ticket?.assigned_to_name && (
                      <p className="text-[10px] text-slate-400">Atendido por {ticket.assigned_to_name}</p>
                    )}
                  </div>
                </div>

                <div ref={chatBottomRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950/40">
                  {loadingChat ? (
                    <div className="space-y-2">
                      {[1, 2].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)}
                    </div>
                  ) : ticket && ticket.messages.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-8">Aún no hay mensajes</p>
                  ) : (
                    ticket?.messages.map((msg, index) => {
                      const isSupport = msg.sender_type === 'super_admin';
                      return (
                        <div key={msg.id || index} className={`flex ${isSupport ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 border ${
                            isSupport
                              ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                              : 'bg-blue-600 border-blue-600'
                          }`}>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-[10px] font-bold ${isSupport ? 'text-blue-600' : 'text-blue-100'}`}>
                                {isSupport ? (msg.sender_name || 'Soporte') : 'Tú'}
                              </span>
                              <span className={`text-[9px] ${isSupport ? 'text-slate-400' : 'text-blue-200'}`}>
                                {new Date(msg.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className={`text-sm leading-relaxed ${isSupport ? 'text-slate-700 dark:text-slate-200' : 'text-white'}`}>
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {ticket && (ticket.status === 'resolved' || ticket.status === 'closed') ? (
                  <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                      Este ticket está {ticket.status === 'closed' ? 'cerrado' : 'resuelto'}
                    </p>
                  </div>
                ) : (
                  <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSend}
                      disabled={sending || !replyText.trim()}
                      className="w-9 h-9 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
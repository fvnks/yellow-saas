'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Clock, Inbox, Loader2, CheckCircle2, XCircle, Headphones } from 'lucide-react';
import { getCompanyIdFromToken } from '@/lib/api-client';
import { toast } from 'sonner';

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
  created_by_name: string;
  assigned_to_name: string | null;
  messages: Message[];
}

const statusConfig: Record<string, { label: string; classes: string; icon: any }> = {
  open: { label: 'Abierto', classes: 'bg-blue-50 text-blue-700 border-blue-200', icon: Inbox },
  in_progress: { label: 'En progreso', classes: 'bg-amber-50 text-amber-700 border-amber-200', icon: Loader2 },
  resolved: { label: 'Resuelto', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  closed: { label: 'Cerrado', classes: 'bg-slate-100 text-slate-600 border-slate-200', icon: XCircle },
};

const priorityConfig: Record<string, { label: string; classes: string }> = {
  low: { label: 'Baja', classes: 'bg-slate-100 text-slate-600 border-slate-200' },
  medium: { label: 'Media', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  high: { label: 'Alta', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  urgent: { label: 'Urgente', classes: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const getToken = () => document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];

  const fetchDetail = async () => {
    const companyId = getCompanyIdFromToken();
    if (!companyId) return;
    try {
      const res = await fetch(`/api/companies/${companyId}/support/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setTicket(data.data);
      else toast.error(data.error?.message || 'Error al cargar ticket');
    } catch {
      toast.error('Error al cargar ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [ticketId]);

  const handleSend = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    const companyId = getCompanyIdFromToken();
    try {
      const res = await fetch(`/api/companies/${companyId}/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyText('');
        fetchDetail();
      } else {
        toast.error(data.error?.message || 'Error al enviar mensaje');
      }
    } catch {
      toast.error('Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Ticket no encontrado</p>
        <button onClick={() => router.push('/ayuda/tickets')}
          className="mt-4 text-sm text-blue-600 hover:underline">
          Volver a Mis Tickets
        </button>
      </div>
    );
  }

  const st = statusConfig[ticket.status] || statusConfig.open;
  const pr = priorityConfig[ticket.priority] || priorityConfig.medium;
  const StatusIcon = st.icon;
  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/ayuda/tickets')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 truncate">{ticket.subject}</h1>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${pr.classes}`}>
              {pr.label}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border ${st.classes}`}>
              <StatusIcon className="w-3 h-3" />
              {st.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Creado el {new Date(ticket.created_at).toLocaleString('es-CL')}
            {ticket.assigned_to_name && <span className="text-slate-400">· Atendido por {ticket.assigned_to_name}</span>}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4 max-h-[480px] overflow-y-auto">
        {ticket.messages.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">No hay mensajes aún</p>
        ) : (
          ticket.messages.map((msg, index) => {
            const isSupport = msg.sender_type === 'super_admin';
            return (
              <div key={msg.id || index} className={`flex ${isSupport ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] rounded-xl px-4 py-3 border ${
                  isSupport
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold ${isSupport ? 'text-blue-700' : 'text-slate-300'}`}>
                      {isSupport ? (
                        <span className="inline-flex items-center gap-1">
                          <Headphones className="w-3 h-3" />
                          {msg.sender_name || 'Soporte'}
                        </span>
                      ) : (
                        msg.sender_name || 'Tú'
                      )}
                    </span>
                    <span className={`text-[9px] ${isSupport ? 'text-blue-400' : 'text-slate-500'}`}>
                      {new Date(msg.created_at).toLocaleString('es-CL')}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${isSupport ? 'text-slate-700' : 'text-white'}`}>{msg.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isClosed ? (
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-sm text-slate-500">Este ticket está {ticket.status === 'closed' ? 'cerrado' : 'resuelto'}. Si necesitas más ayuda, crea un nuevo ticket.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
          <input
            type="text"
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={sending || !replyText.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Enviar
          </button>
        </div>
      )}
    </div>
  );
}

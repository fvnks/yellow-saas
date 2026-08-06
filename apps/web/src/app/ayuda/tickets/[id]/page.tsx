'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Clock, Inbox, Loader2, CheckCircle2, XCircle, Headphones, RotateCcw, Star, Paperclip, FileText, Image as ImageIcon, X } from 'lucide-react';
import { getCompanyIdFromToken } from '@/lib/api-client';
import { toast } from 'sonner';

interface Attachment {
  id: string;
  name: string;
  mime_type: string;
  file_size: number;
}

interface Message {
  id: string;
  sender_type: string;
  sender_name: string;
  message: string;
  created_at: string;
  attachments?: Attachment[];
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

interface Feedback {
  rating: number;
  comment: string | null;
  created_at: string;
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

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const getToken = () => document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
  const getCompanyId = () => getCompanyIdFromToken();

  const fetchDetail = useCallback(async () => {
    const companyId = getCompanyId();
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
  }, [ticketId]);

  const fetchFeedback = useCallback(async () => {
    const companyId = getCompanyId();
    if (!companyId) return;
    try {
      const res = await fetch(`/api/companies/${companyId}/support/tickets/${ticketId}/feedback`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setFeedback(data.data);
    } catch {
      // noop
    }
  }, [ticketId]);

  useEffect(() => {
    fetchDetail();
    fetchFeedback();
  }, [fetchDetail, fetchFeedback]);

  const handleSend = async () => {
    if (!replyText.trim() && pendingFiles.length === 0) return;
    setSending(true);
    const companyId = getCompanyId();
    try {
      const formData = new FormData();
      formData.append('message', replyText);
      pendingFiles.forEach((f, i) => formData.append(`file${i}`, f));
      const res = await fetch(`/api/companies/${companyId}/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setReplyText('');
        setPendingFiles([]);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPendingFiles(prev => [...prev, ...files].slice(0, 5));
    if (e.target) e.target.value = '';
  };

  const handleChangeStatus = async (status: string) => {
    setChangingStatus(true);
    const companyId = getCompanyId();
    try {
      const res = await fetch(`/api/companies/${companyId}/support/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(status === 'resolved' ? 'Ticket marcado como resuelto' : 'Ticket reabierto');
        fetchDetail();
      } else {
        toast.error(data.error?.message || 'Error al actualizar estado');
      }
    } catch {
      toast.error('Error al actualizar estado');
    } finally {
      setChangingStatus(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (rating < 1) {
      toast.error('Selecciona una calificación');
      return;
    }
    setSubmittingFeedback(true);
    const companyId = getCompanyId();
    try {
      const res = await fetch(`/api/companies/${companyId}/support/tickets/${ticketId}/feedback`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: feedbackComment }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Gracias por tu valoración');
        setFeedback(data.data);
      } else {
        toast.error(data.error?.message || 'Error al enviar valoración');
      }
    } catch {
      toast.error('Error al enviar valoración');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Ticket no encontrado</p>
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
  const isClosed = ticket.status === 'closed';
  const isResolved = ticket.status === 'resolved';
  const canReply = !isClosed && !isResolved;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/ayuda/tickets')}
          className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground truncate">{ticket.subject}</h1>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${pr.classes}`}>
              {pr.label}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border ${st.classes}`}>
              <StatusIcon className="w-3 h-3" />
              {st.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Creado el {new Date(ticket.created_at).toLocaleString('es-CL')}
            {ticket.assigned_to_name && <span className="text-muted-foreground">· Atendido por {ticket.assigned_to_name}</span>}
          </p>
        </div>
      </div>

      {!canReply && (
        <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">
            Este ticket está {isClosed ? 'cerrado' : 'resuelto'}. Si necesitas más ayuda, puedes reabrirlo.
          </p>
          <button
            onClick={() => handleChangeStatus('open')}
            disabled={changingStatus}
            className="inline-flex items-center gap-2 bg-card border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            Reabrir ticket
          </button>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4 max-h-[480px] overflow-y-auto">
        {ticket.messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No hay mensajes aún</p>
        ) : (
          ticket.messages.map((msg, index) => {
            const isSupport = msg.sender_type === 'super_admin';
            return (
              <div key={msg.id || index} className={`flex ${isSupport ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] rounded-xl px-4 py-3 border ${
                  isSupport
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-primary border-border'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold ${isSupport ? 'text-blue-700' : 'text-foreground'}`}>
                      {isSupport ? (
                        <span className="inline-flex items-center gap-1">
                          <Headphones className="w-3 h-3" />
                          {msg.sender_name || 'Soporte'}
                        </span>
                      ) : (
                        msg.sender_name || 'Tú'
                      )}
                    </span>
                    <span className={`text-[9px] ${isSupport ? 'text-blue-400' : 'text-muted-foreground'}`}>
                      {new Date(msg.created_at).toLocaleString('es-CL')}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${isSupport ? 'text-foreground' : 'text-white'}`}>{msg.message}</p>
                  {msg.attachments?.length ? (
                    <div className="mt-2 space-y-1.5">
                      {msg.attachments.map(att => (
                        <a
                          key={att.id}
                          href={`/api/companies/${getCompanyId()}/support/tickets/${ticketId}/attachments/${att.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                            isSupport
                              ? 'bg-white border-border text-foreground hover:bg-muted'
                              : 'bg-muted/30 border-border/40 text-white hover:bg-primary/90/40'
                          }`}
                        >
                          {(att.mime_type || '').startsWith('image/')
                            ? <ImageIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            : <FileText className="w-3.5 h-3.5 flex-shrink-0" />}
                          <span className="text-xs truncate">{att.name}</span>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {isResolved && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          {feedback ? (
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground mb-2">¡Gracias por tu valoración!</p>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`w-5 h-5 ${i <= feedback.rating ? 'text-amber-400 fill-amber-400' : 'text-foreground'}`} />
                ))}
              </div>
              {feedback.comment && <p className="text-sm text-muted-foreground">{feedback.comment}</p>}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground mb-1">¿Cómo calificas la atención recibida?</p>
              <p className="text-xs text-muted-foreground mb-4">Tu opinión nos ayuda a mejorar</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    onClick={() => setRating(i)}
                    className={`p-1.5 rounded-lg transition-colors ${rating >= i ? 'text-amber-400' : 'text-foreground hover:text-muted-foreground'}`}
                  >
                    <Star className={`w-7 h-7 ${rating >= i ? 'fill-amber-400' : ''}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={feedbackComment}
                onChange={e => setFeedbackComment(e.target.value)}
                placeholder="Cuéntanos tu experiencia (opcional)..."
                rows={2}
                className="w-full max-w-md mx-auto block bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <button
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback}
                className="mt-4 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
              >
                {submittingFeedback ? 'Enviando...' : 'Enviar valoración'}
              </button>
            </div>
          )}
        </div>
      )}

      {canReply ? (
        <div className="bg-card border border-border rounded-xl p-4">
          {pendingFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {pendingFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-muted border border-border rounded-lg px-2 py-1">
                  {f.type.startsWith('image/')
                    ? <ImageIcon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    : <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                  <span className="text-xs text-foreground max-w-[120px] truncate">{f.name}</span>
                  <button onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || pendingFiles.length >= 5}
              className="w-10 h-10 bg-muted hover:bg-muted border border-border rounded-lg text-muted-foreground flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0"
              title="Adjuntar archivo"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              disabled={sending || (!replyText.trim() && pendingFiles.length === 0)}
              className="px-4 py-2.5 bg-primary hover:bg-primary/90 rounded-lg text-sm font-medium text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Enviar
            </button>
            <button
              onClick={() => handleChangeStatus('resolved')}
              disabled={changingStatus}
              className="px-4 py-2.5 bg-card border border-border hover:bg-muted rounded-lg text-sm font-medium text-foreground transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Marcar resuelto
            </button>
          </div>
        </div>
      ) : isClosed ? (
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">Este ticket está cerrado. Si necesitas más ayuda, crea un nuevo ticket.</p>
        </div>
      ) : null}
    </div>
  );
}
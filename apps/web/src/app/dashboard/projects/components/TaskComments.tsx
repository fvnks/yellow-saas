'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Trash2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  avatar_url: string;
  created_at: string;
}

interface TaskCommentsProps {
  projectId: string;
  taskId: string;
  currentUserId: string;
}

export default function TaskComments({ projectId, taskId, currentUserId }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadComments(); }, [taskId]);

  const loadComments = async () => {
    try {
      const api = getApiClient();
      const res = await api.getTaskComments(projectId, taskId);
      setComments(Array.isArray(res) ? res : []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const handleSend = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      const api = getApiClient();
      await api.createTaskComment(projectId, taskId, { user_id: currentUserId, content: newComment.trim() });
      setNewComment('');
      loadComments();
    } catch (err) { toast.error('Error al enviar comentario'); }
    setSending(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Eliminar comentario?')) return;
    try {
      const api = getApiClient();
      await api.deleteTaskComment(projectId, taskId, commentId);
      loadComments();
    } catch { toast.error('Error al eliminar'); }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'ahora';
    if (diffMin < 60) return `${diffMin}m`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h`;
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-slate-500" />
        <span className="text-xs font-semibold text-slate-700">{comments.length} comentario{comments.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-64 space-y-3 mb-3">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Sin comentarios aun</p>
        ) : comments.map(comment => (
          <div key={comment.id} className="group flex gap-2">
            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-semibold text-indigo-600">
                {comment.user_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900">{comment.user_name}</span>
                <span className="text-[10px] text-slate-400">{formatTime(comment.created_at)}</span>
                {comment.user_id === currentUserId && (
                  <button onClick={() => handleDelete(comment.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-50 rounded transition-all">
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-700 mt-0.5 whitespace-pre-wrap">{comment.content}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Escribe un comentario..."
        />
        <button onClick={handleSend} disabled={sending || !newComment.trim()}
          className="bg-slate-900 hover:bg-black text-white p-2 rounded-lg transition-colors disabled:opacity-50">
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

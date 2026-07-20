'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Clock, AlertTriangle, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  project_id: string | null;
  read_at: string | null;
  created_at: string;
}

const entityIcons: Record<string, any> = {
  task: Clock,
  milestone: AlertTriangle,
  project: FolderKanban,
};

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasNotified = useRef(false);

  useEffect(() => {
    loadNotifications(true);
    const interval = setInterval(() => loadNotifications(false), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async (isInitial = false) => {
    try {
      const api = getApiClient();
      const res = await api.getNotifications({ limit: 20 });
      const data = res.data || [];
      const unread = data.filter((n: Notification) => !n.read_at).length;
      setNotifications(data);
      setUnreadCount(unread);

      if (isInitial && !hasNotified.current && unread > 2) {
        hasNotified.current = true;
        toast.info(`Tienes ${unread} notificaciones pendientes`, {
          description: 'Revisa tu bandeja de notificaciones para más detalles.',
          duration: 8000,
        });
      }
    } catch {}
  };

  const handleMarkRead = async (id: string) => {
    try {
      const api = getApiClient();
      await api.markNotificationsRead(id);
      loadNotifications();
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      const api = getApiClient();
      await api.markNotificationsRead();
      loadNotifications();
    } catch {}
  };

  const handleCheckDeadlines = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      await api.checkDeadlines();
      loadNotifications();
    } catch {}
    setLoading(false);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'ahora';
    if (diffMin < 60) return `hace ${diffMin}m`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `hace ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    return `hace ${diffD}d`;
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
        <Bell className="w-5 h-5 text-slate-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Notificaciones</h3>
            <div className="flex items-center gap-2">
              <button onClick={handleCheckDeadlines} disabled={loading}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 disabled:opacity-50">
                {loading ? 'Verificando...' : 'Verificar plazos'}
              </button>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-[10px] text-slate-400 hover:text-slate-600">
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Sin notificaciones</p>
              </div>
            ) : (
              notifications.map(n => {
                const Icon = (n.entity_type && entityIcons[n.entity_type]) || Bell;
                return (
                  <div key={n.id}
                    className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${!n.read_at ? 'bg-indigo-50/30' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${!n.read_at ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                        <Icon className={`w-3.5 h-3.5 ${!n.read_at ? 'text-indigo-600' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900">{n.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{formatTime(n.created_at)}</p>
                      </div>
                      {!n.read_at && (
                        <button onClick={() => handleMarkRead(n.id)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors flex-shrink-0">
                          <Check className="w-3 h-3 text-slate-400" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

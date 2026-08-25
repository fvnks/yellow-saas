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
    } catch { /* silent is ok for polling */ }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const api = getApiClient();
      await api.markNotificationsRead({ notification_ids: [id] });
      loadNotifications();
    } catch { toast.error('Error al marcar como leído'); }
  };

  const handleMarkAllRead = async () => {
    try {
      const api = getApiClient();
      await api.markNotificationsRead({ mark_all_read: true, userId: '' });
      loadNotifications();
    } catch { toast.error('Error al marcar como leído'); }
  };

  const handleCheckDeadlines = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      await api.checkDeadlines();
      loadNotifications();
    } catch { toast.error('Error al verificar plazos'); }
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
        className="relative p-2 hover:bg-muted rounded-lg transition-colors">
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 dark:bg-primary dark:border-border">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Notificaciones</h3>
            <div className="flex items-center gap-2">
              <button onClick={handleCheckDeadlines} disabled={loading}
                className="text-[10px] text-primary hover:text-primary disabled:opacity-50">
                {loading ? 'Verificando...' : 'Verificar plazos'}
              </button>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-[10px] text-muted-foreground hover:text-foreground">
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Sin notificaciones</p>
              </div>
            ) : (
              notifications.map(n => {
                const Icon = (n.entity_type && entityIcons[n.entity_type]) || Bell;
                return (
                  <div key={n.id}
                    className={`px-4 py-3 border-b border-border hover:bg-muted transition-colors ${!n.read_at ? 'bg-blue-50/30' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${!n.read_at ? 'bg-blue-50' : 'bg-muted'}`}>
                        <Icon className={`w-3.5 h-3.5 ${!n.read_at ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{n.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{formatTime(n.created_at)}</p>
                      </div>
                      {!n.read_at && (
                        <button onClick={() => handleMarkRead(n.id)}
                          className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0">
                          <Check className="w-3 h-3 text-muted-foreground" />
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

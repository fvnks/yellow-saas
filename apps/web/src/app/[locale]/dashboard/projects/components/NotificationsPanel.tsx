'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, AlertTriangle, Clock, DollarSign, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';

interface Notification {
  id: string;
  project_id: string;
  project_name: string;
  type: string;
  title: string;
  message: string;
  entity_type: string;
  entity_id: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsPanelProps {
  userId: string;
}

const typeConfig: Record<string, { icon: any; color: string }> = {
  task_assigned: { icon: Check, color: 'text-blue-500' },
  task_due_soon: { icon: Clock, color: 'text-amber-500' },
  task_overdue: { icon: AlertTriangle, color: 'text-red-500' },
  milestone_due_soon: { icon: Clock, color: 'text-blue-600' },
  milestone_overdue: { icon: AlertTriangle, color: 'text-red-500' },
  budget_warning: { icon: DollarSign, color: 'text-orange-500' },
  comment_added: { icon: MessageCircle, color: 'text-primary' },
  status_change: { icon: CheckCheck, color: 'text-emerald-500' },
};

export default function NotificationsPanel({ userId }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => { loadNotifications(); generateNotifications(); }, [userId]);

  const loadNotifications = async () => {
    try {
      const api = getApiClient();
      const res = await api.getProjectNotifications(userId);
      setNotifications(Array.isArray(res) ? res : []);
    } catch {} finally { setLoading(false); }
  };

  const generateNotifications = async () => {
    try {
      const api = getApiClient();
      await api.generateProjectNotifications();
      loadNotifications();
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (ids: string[]) => {
    try {
      const api = getApiClient();
      await api.markNotificationsRead({ notification_ids: ids });
      loadNotifications();
    } catch { toast.error('Error al marcar como leido'); }
  };

  const handleMarkAllRead = async () => {
    try {
      const api = getApiClient();
      await api.markNotificationsRead({ mark_all_read: true, userId });
      loadNotifications();
    } catch { toast.error('Error'); }
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
    const diffD = Math.floor(diffH / 24);
    return `${diffD}d`;
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-muted rounded-lg transition-colors">
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-xl shadow-xl z-50">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Notificaciones</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-primary hover:text-primary">
                Marcar todo leido
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />)}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Sin notificaciones</p>
              </div>
            ) : (
              notifications.map(n => {
                const config = typeConfig[n.type] || { icon: Bell, color: 'text-muted-foreground' };
                const Icon = config.icon;
                return (
                  <div key={n.id}
                    className={`px-4 py-3 border-b border-border hover:bg-muted transition-colors cursor-pointer ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                    onClick={() => !n.is_read && handleMarkRead([n.id])}>
                    <div className="flex gap-3">
                      <div className={`mt-0.5 ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs ${!n.is_read ? 'font-semibold text-foreground' : 'text-foreground'}`}>{n.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{n.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">{n.project_name}</span>
                          <span className="text-[10px] text-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground">{formatTime(n.created_at)}</span>
                        </div>
                      </div>
                      {!n.is_read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />}
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

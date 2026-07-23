'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, Hash, Plus, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  projectId: string;
}

interface Settings {
  slack_webhook_url: string;
  slack_channel: string;
  email_recipients: string[];
  notify_task_created: boolean;
  notify_task_completed: boolean;
  notify_task_overdue: boolean;
  notify_milestone_due: boolean;
  notify_budget_alert: boolean;
  notify_comment_added: boolean;
}

const defaultSettings: Settings = {
  slack_webhook_url: '',
  slack_channel: '#proyectos',
  email_recipients: [],
  notify_task_created: true,
  notify_task_completed: true,
  notify_task_overdue: true,
  notify_milestone_due: true,
  notify_budget_alert: true,
  notify_comment_added: true,
};

export default function NotificationSettings({ projectId }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => { loadSettings(); }, [projectId]);

  const loadSettings = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/projects/${projectId}/notification-settings`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) setSettings({ ...defaultSettings, ...json.data });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/projects/${projectId}/notification-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) toast.success('Configuracion guardada');
    } catch (e) { toast.error('Error al guardar'); }
    setSaving(false);
  };

  const addEmail = () => {
    if (!newEmail || !newEmail.includes('@')) return;
    setSettings({ ...settings, email_recipients: [...settings.email_recipients, newEmail] });
    setNewEmail('');
  };

  const removeEmail = (email: string) => {
    setSettings({ ...settings, email_recipients: settings.email_recipients.filter(e => e !== email) });
  };

  const toggle = (key: keyof Settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Notificaciones</h3>
        </div>
        <button onClick={saveSettings} disabled={saving}
          className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {/* Slack Configuration */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Hash className="w-4 h-4 text-purple-600" />
          <h4 className="text-sm font-semibold text-slate-900">Slack</h4>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Webhook URL</label>
            <input type="url" value={settings.slack_webhook_url} onChange={e => setSettings({ ...settings, slack_webhook_url: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://hooks.slack.com/services/..." />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Canal</label>
            <input type="text" value={settings.slack_channel} onChange={e => setSettings({ ...settings, slack_channel: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="#proyectos" />
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-semibold text-slate-900">Email</h4>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addEmail()}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="correo@empresa.cl" />
            <button onClick={addEmail} className="bg-slate-900 hover:bg-black text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {settings.email_recipients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {settings.email_recipients.map(email => (
                <span key={email} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-700">
                  {email}
                  <button onClick={() => removeEmail(email)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Toggles */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 dark:bg-slate-900 dark:border-slate-800">
        <h4 className="text-sm font-semibold text-slate-900 mb-4">Eventos a Notificar</h4>
        <div className="space-y-3">
          {[
            { key: 'notify_task_created' as const, label: 'Tarea creada' },
            { key: 'notify_task_completed' as const, label: 'Tarea completada' },
            { key: 'notify_task_overdue' as const, label: 'Tarea vencida' },
            { key: 'notify_milestone_due' as const, label: 'Hito proximo a vencer' },
            { key: 'notify_budget_alert' as const, label: 'Alerta de presupuesto' },
            { key: 'notify_comment_added' as const, label: 'Comentario agregado' },
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-700">{item.label}</span>
              <button onClick={() => toggle(item.key)}
                className={`w-10 h-5 rounded-full transition-colors relative ${settings[item.key] ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

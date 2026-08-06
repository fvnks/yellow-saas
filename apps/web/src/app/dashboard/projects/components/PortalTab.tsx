'use client';

import { useState } from 'react';
import { Globe, Copy, Check, ExternalLink } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface PortalTabProps {
  projectId: string;
  project: any;
  onRefresh: () => void;
}

export default function PortalTab({ projectId, project, onRefresh }: PortalTabProps) {
  const [enabled, setEnabled] = useState(project.portal_enabled || false);
  const [showBudget, setShowBudget] = useState(project.portal_show_budget || false);
  const [showCosts, setShowCosts] = useState(project.portal_show_costs || false);
  const [portalToken, setPortalToken] = useState(project.portal_token || '');
  const [portalUrl, setPortalUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const api = getApiClient();
      const res = await api.toggleProjectPortal(projectId, { enabled, show_budget: showBudget, show_costs: showCosts });
      if (res?.portal_token) setPortalToken(res.portal_token);
      if (res?.portal_url) setPortalUrl(res.portal_url);
      onRefresh();
    } catch (err) {
      toast.error('Error al configurar portal');
    }
    setSaving(false);
  };

  const handleCopy = () => {
    const url = portalUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/portal/${portalToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fullUrl = portalUrl || (portalToken ? `${typeof window !== 'undefined' ? window.location.origin : ''}/portal/${portalToken}` : '');

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-semibold text-foreground">Portal del Cliente</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          Permite a los clientes ver el estado del proyecto con un enlace publico.
        </p>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-primary/20" />
            <span className="text-sm text-foreground">Habilitar portal publico</span>
          </label>

          {enabled && (
            <div className="ml-7 space-y-3 border-l-2 border-indigo-200 pl-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={showBudget} onChange={e => setShowBudget(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-primary/20" />
                <span className="text-sm text-foreground">Mostrar presupuesto</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={showCosts} onChange={e => setShowCosts(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-primary/20" />
                <span className="text-sm text-foreground">Mostrar costos</span>
              </label>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={handleSave} disabled={saving}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar Configuracion'}
          </button>
        </div>
      </div>

      {enabled && portalToken && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
          <h3 className="text-sm font-semibold text-foreground mb-3">Enlace Publico</h3>
          <div className="flex items-center gap-3 bg-muted border border-border rounded-lg p-3">
            <span className="text-xs text-slate-600 truncate flex-1 font-mono">{fullUrl}</span>
            <button onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 bg-card border border-border hover:bg-muted rounded-lg text-xs font-medium text-foreground transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <a href={fullUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg text-xs font-medium text-indigo-700 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Abrir
            </a>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Este enlace es de solo lectura y no requiere autenticacion.
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Building2, Users, TrendingUp, DollarSign, Shield, Activity } from 'lucide-react';

interface Metrics {
  totalCompanies: number;
  activeCompanies: number;
  trialCompanies: number;
  totalUsers: number;
  activeUsers: number;
  recentSignups: number;
  superAdmins: number;
  dbStatus: string;
  dbLatency: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalCompanies: 0, activeCompanies: 0, trialCompanies: 0,
    totalUsers: 0, activeUsers: 0, recentSignups: 0, superAdmins: 0,
    dbStatus: 'checking', dbLatency: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      const res = await fetch('/api/super-admin/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMetrics(data.data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: 'Total Empresas', value: metrics.totalCompanies, icon: Building2, color: 'bg-primary/10 text-primary/70 border-primary/20' },
    { label: 'Empresas Activas', value: metrics.activeCompanies, icon: Activity, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { label: 'En Prueba', value: metrics.trialCompanies, icon: TrendingUp, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { label: 'Total Usuarios', value: metrics.totalUsers, icon: Users, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { label: 'Usuarios Activos', value: metrics.activeUsers, icon: Shield, color: 'bg-blue-600/10 text-blue-500 border-blue-500/20' },
    { label: 'Registros Recientes', value: metrics.recentSignups, icon: DollarSign, color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Vista general de la plataforma Yellow ERP</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-primary border border-border rounded-xl p-6 hover:border-border transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{card.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {loading ? (
                      <span className="inline-block w-16 h-8 bg-card rounded animate-pulse" />
                    ) : (
                      card.value.toLocaleString('es-CL')
                    )}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-primary border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <a href="/admin/companies" className="flex items-center gap-3 p-3 bg-card/50 rounded-lg hover:bg-primary/90 transition-colors">
              <Building2 className="w-4 h-4 text-primary/70" />
              <span className="text-sm text-foreground">Gestionar Empresas</span>
            </a>
            <a href="/admin/users" className="flex items-center gap-3 p-3 bg-card/50 rounded-lg hover:bg-primary/90 transition-colors">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-foreground">Gestionar Usuarios</span>
            </a>
            <a href="/admin/grants" className="flex items-center gap-3 p-3 bg-card/50 rounded-lg hover:bg-primary/90 transition-colors">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-foreground">Solicitudes de Acceso</span>
            </a>
          </div>
        </div>

        <div className="bg-primary border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Estado del Sistema</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Base de datos</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                metrics.dbStatus === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : metrics.dbStatus === 'error'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  metrics.dbStatus === 'connected' ? 'bg-emerald-400' : metrics.dbStatus === 'error' ? 'bg-rose-400' : 'bg-amber-400'
                }`} />
                {metrics.dbStatus === 'connected' ? 'Conectada' : metrics.dbStatus === 'error' ? 'Error' : 'Verificando...'}
                {metrics.dbStatus === 'connected' && metrics.dbLatency > 0 && (
                  <span className="text-emerald-500/70 ml-1">{metrics.dbLatency}ms</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Super Admins</span>
              <span className="text-sm font-medium text-white">{loading ? '—' : metrics.superAdmins}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Empresas Totales</span>
              <span className="text-sm font-medium text-white">{loading ? '—' : metrics.totalCompanies}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Usuarios Totales</span>
              <span className="text-sm font-medium text-white">{loading ? '—' : metrics.totalUsers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

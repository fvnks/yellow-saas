'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Dog, Stethoscope, DollarSign, Users, Activity, Loader2 } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

const clpFormatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
const formatCLP = (val: number) => clpFormatter.format(val);

export default function VetReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const api = getApiClient();
        const [dashboard, appointments, payments, patients] = await Promise.all([
          api.getVetDashboard(),
          api.getVetAppointments({ limit: '200' }),
          api.getVetPayments({ limit: '200', status: 'completado' }),
          api.getVetPatients({ limit: '500' }),
        ]);

        const aptData = appointments.data || [];
        const payData = payments.data || [];
        const patData = patients.data || [];

        // Species distribution
        const speciesMap: Record<string, number> = {};
        patData.forEach((p: any) => {
          const sp = p.species || 'Otro';
          speciesMap[sp] = (speciesMap[sp] || 0) + 1;
        });
        const speciesDist = Object.entries(speciesMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

        // Appointments by status
        const statusMap: Record<string, number> = {};
        aptData.forEach((a: any) => {
          statusMap[a.status] = (statusMap[a.status] || 0) + 1;
        });

        // Revenue
        const totalRevenue = payData.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);

        // Services distribution
        const serviceMap: Record<string, number> = {};
        aptData.forEach((a: any) => {
          const svc = a.service_name || 'Otro';
          serviceMap[svc] = (serviceMap[svc] || 0) + 1;
        });
        const serviceDist = Object.entries(serviceMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

        // Appointments by day of week
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const dayMap: Record<string, number> = {};
        aptData.forEach((a: any) => {
          const d = new Date(a.appointment_date).getDay();
          dayMap[dayNames[d]] = (dayMap[dayNames[d]] || 0) + 1;
        });
        const dayDist = dayNames.map(d => ({ day: d, count: dayMap[d] || 0 }));

        setData({
          dashboard: dashboard.data || {},
          speciesDist,
          statusMap,
          totalRevenue,
          serviceDist,
          dayDist,
          totalAppointments: aptData.length,
          totalPatients: patData.length,
          avgRevenue: payData.length > 0 ? totalRevenue / payData.length : 0,
        });
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  const maxSpecies = data ? Math.max(...data.speciesDist.map((s: any[]) => s[1]), 1) : 1;
  const maxService = data ? Math.max(...data.serviceDist.map((s: any[]) => s[1]), 1) : 1;
  const maxDay = data ? Math.max(...data.dayDist.map((d: any) => d.count), 1) : 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-purple-600" />
            Reportes Veterinarios
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Métricas de la clínica, distribución de especies e ingresos.</p>
        </div>
        <div className="flex gap-1">
          {['week', 'month', 'year'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${period === p ? 'bg-[#0F172A] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4">
          <Calendar className="w-5 h-5 text-blue-500 mb-1" />
          <div className="text-2xl font-black text-slate-900">{data?.totalAppointments || 0}</div>
          <div className="text-[11px] text-slate-500 font-bold">Citas Totales</div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4">
          <Dog className="w-5 h-5 text-emerald-500 mb-1" />
          <div className="text-2xl font-black text-slate-900">{data?.totalPatients || 0}</div>
          <div className="text-[11px] text-slate-500 font-bold">Pacientes Activos</div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4">
          <DollarSign className="w-5 h-5 text-amber-500 mb-1" />
          <div className="text-2xl font-black text-slate-900">{formatCLP(data?.totalRevenue || 0)}</div>
          <div className="text-[11px] text-slate-500 font-bold">Ingresos Totales</div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4">
          <TrendingUp className="w-5 h-5 text-purple-500 mb-1" />
          <div className="text-2xl font-black text-slate-900">{formatCLP(data?.avgRevenue || 0)}</div>
          <div className="text-[11px] text-slate-500 font-bold">Ticket Promedio</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/80">
            <h2 className="text-sm font-bold text-slate-900">Distribución por Especie</h2>
          </div>
          <div className="p-5 space-y-3">
            {data?.speciesDist.map(([species, count]: [string, number]) => (
              <div key={species} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 w-24 truncate capitalize">{species}</span>
                <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-lg transition-all" style={{ width: `${(count / maxSpecies) * 100}%` }} />
                </div>
                <span className="text-xs font-black text-slate-900 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/80">
            <h2 className="text-sm font-bold text-slate-900">Servicios Más Solicitados</h2>
          </div>
          <div className="p-5 space-y-3">
            {data?.serviceDist.map(([service, count]: [string, number]) => (
              <div key={service} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 w-24 truncate">{service}</span>
                <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-lg transition-all" style={{ width: `${(count / maxService) * 100}%` }} />
                </div>
                <span className="text-xs font-black text-slate-900 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/80">
            <h2 className="text-sm font-bold text-slate-900">Citas por Día de la Semana</h2>
          </div>
          <div className="p-5 flex items-end gap-2 h-48">
            {data?.dayDist.map((d: any) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-slate-900">{d.count}</span>
                <div className="w-full bg-purple-500 rounded-t-lg transition-all" style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }} />
                <span className="text-[10px] font-bold text-slate-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/80">
            <h2 className="text-sm font-bold text-slate-900">Estado de Citas</h2>
          </div>
          <div className="p-5 space-y-3">
            {Object.entries(data?.statusMap || {}).map(([status, count]: [string, any]) => {
              const colors: Record<string, string> = {
                agendada: 'bg-blue-500', confirmada: 'bg-amber-500', en_espera: 'bg-purple-500',
                en_atencion: 'bg-emerald-500', finalizada: 'bg-slate-500', cancelada: 'bg-rose-500', no_asistio: 'bg-orange-500',
              };
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${colors[status] || 'bg-slate-400'}`} />
                  <span className="text-xs font-bold text-slate-700 capitalize flex-1">{status.replace('_', ' ')}</span>
                  <span className="text-xs font-black text-slate-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

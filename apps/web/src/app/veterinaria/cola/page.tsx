'use client';

import React, { useEffect } from 'react';
import { Users, Clock, Stethoscope, AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useQueue } from '../hooks/use-queue';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  agendada: { label: 'Agendada', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Clock },
  confirmada: { label: 'Confirmada', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: CheckCircle2 },
  en_espera: { label: 'En Sala de Espera', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: Users },
  en_atencion: { label: 'En Atención', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: Stethoscope },
};

export default function WaitingRoomPage() {
  const { queue, counts, loading, refresh } = useQueue();

  useEffect(() => {
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const api = getApiClient();
      await api.updateVetAppointment(appointmentId, { status: newStatus });
      await refresh();
      toast.success('Estado actualizado');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar');
    }
  };

  const getNextStatus = (current: string) => {
    const flow: Record<string, string> = { agendada: 'confirmada', confirmada: 'en_espera', en_espera: 'en_atencion', en_atencion: 'finalizada' };
    return flow[current];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-600" />
            Sala de Espera
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Tablero en tiempo real — se actualiza cada 30 segundos.</p>
        </div>
        <button onClick={refresh} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4 text-center`}>
            <cfg.icon className={`w-6 h-6 ${cfg.color} mx-auto mb-1`} />
            <div className={`text-2xl font-black ${cfg.color}`}>{counts[key] || 0}</div>
            <div className="text-[11px] font-bold text-slate-600 uppercase">{cfg.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : queue.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">No hay pacientes en cola hoy</p>
            </div>
          ) : (
            queue.map((apt: any) => {
              const cfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.agendada;
              const next = getNextStatus(apt.status);
              return (
                <div key={apt.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
                      <span className="text-lg font-black text-slate-900">{apt.appointment_time?.slice(0, 5)}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{apt.patient_name}</h3>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold capitalize">{apt.species}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md capitalize ${cfg.bg} ${cfg.color} border ${cfg.border}`}>{cfg.label}</span>
                      </div>
                      <p className="text-xs text-slate-600"><strong>Tutor:</strong> {apt.client_name} • <strong>Servicio:</strong> {apt.service_name}</p>
                      <p className="text-xs text-slate-500"><strong>Médico:</strong> Dr(a). {apt.professional_name} {apt.room_name && `• Box: ${apt.room_name}`}</p>
                      {apt.wait_minutes > 0 && apt.status === 'en_espera' && (
                        <p className="text-xs text-amber-600 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Esperando {Math.round(apt.wait_minutes)} min
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {next && (
                      <button onClick={() => handleStatusChange(apt.id, next)} className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all">
                        → {STATUS_CONFIG[next]?.label || next}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

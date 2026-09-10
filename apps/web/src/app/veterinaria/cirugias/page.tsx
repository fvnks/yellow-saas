'use client';

import React, { useState } from 'react';
import { Syringe, Calendar, Clock, User, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import InformedConsentModal from './components/informed-consent-modal';
import { useSurgeries } from '../hooks/use-surgeries';
import { usePatients } from '../hooks/use-patients';
import { useProfessionals } from '../hooks/use-professionals';
import { useRooms } from '../hooks/use-rooms';

export default function VeterinarySurgeriesPage() {
  const [selectedSurgery, setSelectedSurgery] = useState<any | null>(null);
  const { data: surgeries, loading, error, refresh } = useSurgeries();
  const { data: patients } = usePatients();
  const { data: professionals } = useProfessionals();
  const { data: rooms } = useRooms();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Cirugías & Programación de Quirófano
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Registro pre-quirúrgico, consentimiento informado (Ley 21.020) y protocolo anestésico.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Cargando cirugías...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
          <p className="text-sm text-rose-700 font-bold">{error}</p>
          <button onClick={refresh} className="mt-2 text-xs text-rose-600 underline font-semibold">Reintentar</button>
        </div>
      ) : (
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
        {surgeries.map((s) => (
          <div key={s.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{s.patientName}</h3>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold capitalize">{s.species}</span>
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-0.5 rounded border border-purple-200 uppercase">
                  {s.status}
                </span>
              </div>
              <p className="text-sm font-bold text-emerald-700">{s.surgeryName}</p>
              <p className="text-xs text-slate-600">
                <strong>Cirujano/a:</strong> {s.surgeonName} • <strong>Anestesista:</strong> {s.anesthetistName}
              </p>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center">
              <button
                onClick={() => setSelectedSurgery(s)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Consentimiento Informado Ley 21.020
              </button>

              <div className="text-right text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Fecha Programada</span>
                <strong className="text-slate-900 text-sm">{s.scheduledDate}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {selectedSurgery && (
        <InformedConsentModal
          isOpen={!!selectedSurgery}
          onClose={() => setSelectedSurgery(null)}
          patientName={selectedSurgery.patientName}
          species={selectedSurgery.species}
          breed={selectedSurgery.breed}
          clientName={selectedSurgery.clientName}
          clientRut={selectedSurgery.clientRut}
          surgeryName={selectedSurgery.surgeryName}
          surgeonName={selectedSurgery.surgeonName}
        />
      )}
    </div>
  );
}

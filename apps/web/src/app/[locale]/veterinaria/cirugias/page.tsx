'use client';

import React, { useState } from 'react';
import { Syringe, Calendar, Clock, User, CheckCircle2, ShieldCheck } from 'lucide-react';
import InformedConsentModal from './components/informed-consent-modal';

export default function VeterinarySurgeriesPage() {
  const [selectedSurgery, setSelectedSurgery] = useState<any | null>(null);

  const surgeries = [
    {
      id: 'surg-1',
      patientName: 'Luna',
      species: 'gato',
      breed: 'Mestizo Felino',
      clientName: 'María José Valenzuela',
      clientRut: '15.482.910-K',
      surgeryName: 'OVH / Esterilización Felina + Limpieza Dental',
      surgeonName: 'Dra. Andrea Morales Soto',
      anesthetistName: 'Dr. Sebastián Contreras P.',
      scheduledDate: '2025-03-02 09:30',
      roomName: 'Quirófano Principal',
      status: 'programada',
    },
  ];

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

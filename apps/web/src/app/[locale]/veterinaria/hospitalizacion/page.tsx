'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BedDouble,
  Activity,
  Plus,
  Clock,
  Dog,
  CheckCircle2,
  Heart,
  Thermometer,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { INITIAL_HOSPITALIZATIONS, INITIAL_PATIENTS, Hospitalization } from '../lib/veterinary-store';

export default function VeterinaryHospitalizationPage() {
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>(INITIAL_HOSPITALIZATIONS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Hospitalización & Pacientes Críticos (UCI)
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Monitoreo continuo de constantes vitales, jaulas, fluidoterapia e historial de enfermería.
          </p>
        </div>
      </div>

      {/* Hospitalization Cards */}
      <div className="space-y-6">
        {hospitalizations.map((hosp) => (
          <div key={hosp.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold">
                  <BedDouble className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{hosp.patientName}</h3>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold capitalize">
                      {hosp.species}
                    </span>
                    <span className="bg-rose-100 text-rose-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-rose-200">
                      Prioridad {hosp.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <strong>Ubicación:</strong> {hosp.cageNumber} • <strong>Médico Responsable:</strong> {hosp.attendingVetName}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-400 block">Ingreso Hosp.</span>
                <span className="font-bold text-slate-800">{hosp.admissionDate}</span>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <h4 className="text-xs font-bold text-slate-700 uppercase">Diagnóstico de Ingreso</h4>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{hosp.initialDiagnosis}</p>
            </div>

            {/* Logs Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                Hoja de Controles & Fluidoterapia
              </h4>

              <div className="space-y-2">
                {hosp.logs.map((log) => (
                  <div key={log.id} className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span>{log.logTime} por <strong className="text-slate-800">{log.professionalName}</strong></span>
                      <div className="flex gap-3 text-slate-700 font-bold">
                        <span>T°: {log.temperatureC}°C</span>
                        <span>FC: {log.heartRateBpm} bpm</span>
                        <span>FR: {log.respiratoryRateBpm} rpm</span>
                      </div>
                    </div>
                    {log.hydration && <p className="text-slate-700"><strong>Hidratación:</strong> {log.hydration}</p>}
                    {log.medicationGiven && <p className="text-slate-700"><strong>Fármacos:</strong> {log.medicationGiven}</p>}
                    {log.notes && <p className="text-slate-600 italic mt-1">{log.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

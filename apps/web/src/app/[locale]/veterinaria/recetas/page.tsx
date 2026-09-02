'use client';

import React from 'react';
import { FileText, Pill, Printer, Download, CheckCircle2 } from 'lucide-react';
import { INITIAL_PATIENTS, INITIAL_PROFESSIONALS } from '../lib/veterinary-store';

export default function VeterinaryPrescriptionsPage() {
  const prescriptions = [
    {
      id: 'rec-001',
      prescriptionDate: '2025-02-15',
      patientName: 'Apollo',
      clientName: 'María José Valenzuela',
      professionalName: 'Dr. Sebastián Contreras P.',
      medicationsCount: 2,
      status: 'activa',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Recetas Médicas & Prescripciones
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Emisión y consulta de recetas médicas firmadas para tutores y farmacia veterinaria.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {prescriptions.map((p) => (
            <div key={p.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Receta #{p.id}</h3>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded border border-emerald-200">
                    {p.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Paciente:</strong> {p.patientName} (Tutor: {p.clientName})
                </p>
                <p className="text-xs text-slate-500">
                  Emitida por {p.professionalName} el {p.prescriptionDate}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

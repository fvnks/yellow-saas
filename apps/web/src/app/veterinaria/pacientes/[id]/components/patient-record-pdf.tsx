'use client';

import React from 'react';
import { Printer, Shield, Dog, Cat, Cpu } from 'lucide-react';

interface Props {
  patient: any;
  client: any;
  consultations: any[];
  vaccinations: any[];
  dewormings: any[];
}

export default function PatientRecordPdf({
  patient,
  client,
  consultations,
  vaccinations,
  dewormings,
}: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
      {/* Header Print */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="text-xl font-black text-slate-900 uppercase tracking-tight">
            Yellow ERP • Ficha Clínica Veterinaria 360°
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Registro Oficial de Atención Médica Veterinaria (Ley 21.020 / SII)
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5 print:hidden"
        >
          <Printer className="w-3.5 h-3.5 text-emerald-400" />
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* Patient & Client Overview */}
      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
        <div>
          <h4 className="font-extrabold text-slate-900 uppercase text-[11px] mb-2 border-b border-slate-200 pb-1">
            Datos de la Mascota
          </h4>
          <p><strong>Nombre:</strong> {patient.name}</p>
          <p><strong>Especie:</strong> {patient.species} ({patient.breed})</p>
          <p><strong>Sexo:</strong> {patient.gender} • <strong>Esterilizado:</strong> {patient.isSterilized ? 'Sí' : 'No'}</p>
          <p><strong>Fecha Nac:</strong> {patient.birthDate} • <strong>Peso Actual:</strong> {patient.currentWeightKg} kg</p>
          {patient.microchip && <p className="font-mono font-bold text-emerald-800 mt-1">N° Chip: {patient.microchip}</p>}
        </div>

        <div>
          <h4 className="font-extrabold text-slate-900 uppercase text-[11px] mb-2 border-b border-slate-200 pb-1">
            Datos del Tutor Responsable
          </h4>
          {client ? (
            <>
              <p><strong>Nombre:</strong> {client.fullName}</p>
              <p><strong>RUT:</strong> {client.rut}</p>
              <p><strong>Teléfono:</strong> {client.phone}</p>
              <p><strong>Email:</strong> {client.email}</p>
              <p><strong>Dirección:</strong> {client.address}, {client.commune}</p>
            </>
          ) : (
            <p className="text-slate-400">Sin datos de tutor</p>
          )}
        </div>
      </div>

      {/* Consultations Summary */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
          Historial de Atenciones Clínicas
        </h4>

        {consultations.map((c, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 bg-slate-50/50">
            <div className="flex justify-between font-bold text-slate-900 border-b border-slate-100 pb-1">
              <span>{c.consultationDate} — Dr(a). {c.professionalName}</span>
              <span>Peso: {c.weightKg}kg • Temp: {c.temperatureC}°C</span>
            </div>
            <p><strong>Motivo:</strong> {c.reasonForVisit}</p>
            <p><strong>Diagnóstico:</strong> <span className="font-bold text-emerald-800">{c.primaryDiagnosis}</span></p>
            {c.treatmentPlan && <p><strong>Tratamiento:</strong> {c.treatmentPlan}</p>}
          </div>
        ))}
      </div>

      {/* Vaccinations Summary */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
          Historial de Vacunación & Inmunizaciones
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {vaccinations.map((v, i) => (
            <div key={i} className="bg-emerald-50/50 border border-emerald-200/80 p-2.5 rounded-lg space-y-0.5">
              <div className="font-bold text-emerald-900">{v.vaccineName}</div>
              <p className="text-slate-600">Aplicada: {v.applicationDate} • Vence: <strong className="text-slate-900">{v.nextDueDate}</strong></p>
              <p className="text-slate-500 font-mono text-[10px]">Lote: {v.batchNumber}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

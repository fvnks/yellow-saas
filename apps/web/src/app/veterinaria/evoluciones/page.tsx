'use client';

import React, { useState } from 'react';
import {
  Stethoscope,
  Plus,
  ClipboardList,
  User,
  Calendar,
  Weight,
  Thermometer,
  Heart,
  Wind,
  FileText,
} from 'lucide-react';
import { INITIAL_PATIENTS, INITIAL_SPECIES, INITIAL_EVOLUTIONS, VeterinaryEvolution } from '../lib/veterinary-store';
import SoapEditor from '../components/soap-editor';
const typeLabels: Record<string, string> = {
  consulta: 'Consulta',
  control: 'Control',
  procedimiento: 'Procedimiento',
  post_operatorio: 'Post Operatorio',
  hospitalizacion: 'Hospitalización',
  examen: 'Examen',
};

const typeBadges: Record<string, string> = {
  consulta: 'bg-blue-100 text-blue-800 border-blue-200',
  control: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  procedimiento: 'bg-amber-100 text-amber-800 border-amber-200',
  post_operatorio: 'bg-rose-100 text-rose-800 border-rose-200',
  hospitalizacion: 'bg-purple-100 text-purple-800 border-purple-200',
  examen: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

export default function VeterinaryEvolutionsPage() {
  const [evolutions, setEvolutions] = useState<VeterinaryEvolution[]>(INITIAL_EVOLUTIONS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('todos');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [showEditor, setShowEditor] = useState(false);
  const [fastPatientId, setFastPatientId] = useState(INITIAL_PATIENTS[0]?.id || '');

  const selectedPatient = INITIAL_PATIENTS.find((p) => p.id === selectedPatientId);
  const speciesName = (key: string) => {
    const sp = INITIAL_SPECIES.find((s) => s.key === key);
    return sp ? sp.name.split('(')[0].trim() : key;
  };

  const filtered = evolutions
    .filter((e) => selectedPatientId === 'todos' || e.patientId === selectedPatientId)
    .filter((e) => typeFilter === 'todos' || e.type === typeFilter)
    .sort((a, b) => (a.evolutionDate + a.evolutionTime > b.evolutionDate + b.evolutionTime ? -1 : 1));

  const handleSave = (evo: Omit<VeterinaryEvolution, 'id' | 'createdAt'>) => {
    const newEvo: VeterinaryEvolution = {
      ...evo,
      id: `ev-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setEvolutions([newEvo, ...evolutions]);
    setShowEditor(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Evolución Clínica & Notas SOAP
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Registro estructurado de la evolución de cada paciente con metodología SOAP y línea de tiempo médica.
          </p>
        </div>
        <button
          onClick={() => setShowEditor(true)}
          className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nueva Nota SOAP
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Stethoscope className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 cursor-pointer"
          >
            <option value="todos">Todos los Pacientes</option>
            {INITIAL_PATIENTS.map((p) => (
              <option key={p.id} value={p.id}>{p.name} - {speciesName(p.species)}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'consulta', label: 'Consultas' },
            { id: 'control', label: 'Controles' },
            { id: 'hospitalizacion', label: 'Hosp.' },
            { id: 'post_operatorio', label: 'Post-Op' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                typeFilter === t.id ? 'bg-[#0F172A] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Notas Registradas</div>
            <div className="text-xl font-black text-slate-900">{filtered.length}</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center"><ClipboardList className="w-5 h-5" /></div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">{selectedPatient ? selectedPatient.name : 'Todos'} - Especie</div>
            <div className="text-xl font-black text-slate-900 capitalize">{selectedPatient ? speciesName(selectedPatient.species) : 'General'}</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center"><Calendar className="w-5 h-5" /></div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Última Actualización</div>
            <div className="text-xl font-black text-slate-900">{filtered[0] ? filtered[0].evolutionDate : '—'}</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-slate-500 text-sm">
            No hay evoluciones clínicas registradas para este filtro.
          </div>
        ) : (
          filtered.map((evo) => (
            <div key={evo.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-emerald-400 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      {evo.patientName}
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${typeBadges[evo.type] || typeBadges.consulta}`}>
                        {typeLabels[evo.type] || evo.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{evo.diagnosis || 'Sin diagnóstico codificado'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-700">{evo.evolutionDate} · {evo.evolutionTime}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{evo.professionalName}</div>
                </div>
              </div>

              {/* Vitals */}
              {(evo.weightKg != null || evo.temperatureC != null || evo.heartRateBpm != null || evo.respiratoryRateBpm != null) && (
                <div className="flex flex-wrap gap-2">
                  {evo.weightKg != null && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg"><Weight className="w-3 h-3 text-slate-400" /> {evo.weightKg} kg</span>
                  )}
                  {evo.temperatureC != null && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg"><Thermometer className="w-3 h-3 text-rose-400" /> {evo.temperatureC}°C</span>
                  )}
                  {evo.heartRateBpm != null && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg"><Heart className="w-3 h-3 text-rose-400" /> {evo.heartRateBpm} lpm</span>
                  )}
                  {evo.respiratoryRateBpm != null && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg"><Wind className="w-3 h-3 text-sky-400" /> {evo.respiratoryRateBpm} rpm</span>
                  )}
                </div>
              )}

              {/* SOAP Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <SoapBlock color="border-blue-200 bg-blue-50/40" badge="bg-blue-600" letter="S" label="Subjetivo" text={evo.soap.subjective} />
                <SoapBlock color="border-emerald-200 bg-emerald-50/40" badge="bg-emerald-600" letter="O" label="Objetivo" text={evo.soap.objective} />
                <SoapBlock color="border-amber-200 bg-amber-50/40" badge="bg-amber-500" letter="A" label="Evaluación" text={evo.soap.assessment} />
                <SoapBlock color="border-rose-200 bg-rose-50/40" badge="bg-rose-600" letter="P" label="Plan" text={evo.soap.plan} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Soap Editor Modal */}
      {showEditor && (
        <SoapEditor
          patientId={fastPatientId}
          patientName={(() => { const p = INITIAL_PATIENTS.find((x) => x.id === fastPatientId); return p ? p.name : 'Paciente'; })()}
          onSave={handleSave}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}

function SoapBlock({
  color,
  badge,
  letter,
  label,
  text,
}: {
  color: string;
  badge: string;
  letter: string;
  label: string;
  text: string;
}) {
  return (
    <div className={`border rounded-xl p-3 ${color} space-y-1`}>
      <div className="flex items-center gap-2">
        <span className={`text-white text-[10px] font-black px-2 py-0.5 rounded ${badge}`}>{letter}</span>
        <span className="text-[11px] font-extrabold text-slate-700 uppercase">{label}</span>
      </div>
      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
        {text || <span className="text-slate-400 italic">Sin registro</span>}
      </p>
    </div>
  );
}

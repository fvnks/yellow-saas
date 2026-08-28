'use client';

import React, { useState } from 'react';
import { X, Save, Stethoscope } from 'lucide-react';
import { VeterinaryEvolution, EvolutionType, SoapNote, INITIAL_PROFESSIONALS } from '../lib/veterinary-store';

interface SoapEditorProps {
  patientId: string;
  patientName: string;
  professionalName?: string;
  onSave: (evolution: Omit<VeterinaryEvolution, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  prefillSoap?: SoapNote;
}

const EVOLUTION_TYPES: { value: EvolutionType; label: string }[] = [
  { value: 'consulta', label: 'Consulta' },
  { value: 'control', label: 'Control' },
  { value: 'procedimiento', label: 'Procedimiento' },
  { value: 'post_operatorio', label: 'Post Operatorio' },
  { value: 'hospitalizacion', label: 'Hospitalización' },
  { value: 'examen', label: 'Examen' },
];

export default function SoapEditor({
  patientId,
  patientName,
  professionalName,
  onSave,
  onClose,
  prefillSoap,
}: SoapEditorProps) {
  const defaultProfessional = INITIAL_PROFESSIONALS[0];
  const [type, setType] = useState<EvolutionType>('consulta');
  const [soap, setSoap] = useState<SoapNote>(
    prefillSoap || { subjective: '', objective: '', assessment: '', plan: '' }
  );
  const [weightKg, setWeightKg] = useState<number | undefined>();
  const [temperatureC, setTemperatureC] = useState<number | undefined>();
  const [heartRateBpm, setHeartRateBpm] = useState<number | undefined>();
  const [respiratoryRateBpm, setRespiratoryRateBpm] = useState<number | undefined>();
  const [diagnosis, setDiagnosis] = useState('');
  const [selectedProfId, setSelectedProfId] = useState(defaultProfessional?.id || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soap.subjective.trim() && !soap.objective.trim() && !soap.assessment.trim() && !soap.plan.trim()) {
      setError('Debe completar al menos una sección SOAP para registrar la evolución.');
      return;
    }

    const now = new Date();
    const pro = INITIAL_PROFESSIONALS.find((p) => p.id === selectedProfId);

    onSave({
      patientId,
      patientName,
      type,
      soap,
      weightKg,
      temperatureC,
      heartRateBpm,
      respiratoryRateBpm,
      professionalId: selectedProfId,
      professionalName: pro?.fullName || professionalName || 'Personal Clínico',
      evolutionDate: now.toISOString().split('T')[0],
      evolutionTime: now.toTimeString().slice(0, 5),
      diagnosis: diagnosis || undefined,
      status: 'final',
    });
  };

  const updateSoap = (key: keyof SoapNote, value: string) => {
    setSoap({ ...soap, [key]: value });
    if (error) setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-3xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-emerald-600" />
              Nota Clínica SOAP - {patientName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Subjetivo • Objetivo • Evaluación • Plan
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Tipo + Profesional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo de Evolución *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EvolutionType)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {EVOLUTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Profesional</label>
              <select
                value={selectedProfId}
                onChange={(e) => setSelectedProfId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {INITIAL_PROFESSIONALS.map((p) => (
                  <option key={p.id} value={p.id}>{p.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Constantes Vitales */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Constantes Vitales (Opcional)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Peso (kg)</label>
                <input
                  type="number" step="0.1"
                  value={weightKg ?? ''}
                  onChange={(e) => setWeightKg(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">T° (°C)</label>
                <input
                  type="number" step="0.1"
                  value={temperatureC ?? ''}
                  onChange={(e) => setTemperatureC(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">FC (lpm)</label>
                <input
                  type="number"
                  value={heartRateBpm ?? ''}
                  onChange={(e) => setHeartRateBpm(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">FR (rpm)</label>
                <input
                  type="number"
                  value={respiratoryRateBpm ?? ''}
                  onChange={(e) => setRespiratoryRateBpm(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SOAP Sections */}
          <div className="space-y-3">
            <SectionEditor
              color="bg-blue-50 border-blue-200"
              badge="bg-blue-600"
              label="S - Subjetivo"
              hint="Historia referida por el tutor, motivo de consulta, anamnesis."
              value={soap.subjective}
              onChange={(v) => updateSoap('subjective', v)}
            />
            <SectionEditor
              color="bg-emerald-50 border-emerald-200"
              badge="bg-emerald-600"
              label="O - Objetivo"
              hint="Hallazgos del examen físico y constantes vitales medibles."
              value={soap.objective}
              onChange={(v) => updateSoap('objective', v)}
            />
            <SectionEditor
              color="bg-amber-50 border-amber-200"
              badge="bg-amber-500"
              label="A - Evaluación (Assessment)"
              hint="Diagnóstico diferencial, problemas identificados y análisis."
              value={soap.assessment}
              onChange={(v) => updateSoap('assessment', v)}
            />
            <SectionEditor
              color="bg-rose-50 border-rose-200"
              badge="bg-rose-600"
              label="P - Plan"
              hint="Tratamiento, medicación, procedimientos, seguimiento y controles."
              value={soap.plan}
              onChange={(v) => updateSoap('plan', v)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Diagnóstico Asociado</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Ej. Otitis externa bacteriana"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>
          )}
        </form>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar Evolución SOAP
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionEditor({
  color,
  badge,
  label,
  hint,
  value,
  onChange,
}: {
  color: string;
  badge: string;
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={`border rounded-xl p-3 ${color} bg-opacity-40 space-y-1.5`}>
      <div className="flex items-center gap-2">
        <span className={`text-white text-[10px] font-black px-2 py-0.5 rounded ${badge}`}>{label[0]}</span>
        <span className="text-xs font-extrabold text-slate-800 uppercase">{label}</span>
      </div>
      <p className="text-[11px] text-slate-500 italic">{hint}</p>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
      />
    </div>
  );
}

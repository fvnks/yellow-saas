'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Save,
  Dog,
  Activity,
  FileText,
  Pill,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Thermometer,
} from 'lucide-react';
import MedicationStockSelector, { InventoryMedication } from './components/medication-stock-selector';
import BillingOrderGenerator from './components/billing-order-generator';
import {
  INITIAL_PATIENTS,
  INITIAL_CLIENTS,
  INITIAL_PROFESSIONALS,
  INITIAL_CONSULTATIONS,
  VeterinaryConsultation,
  PrescriptionItem,
  SoapNote,
} from '../lib/veterinary-store';

export default function VeterinaryConsultationsPage() {
  const [selectedPatientId, setSelectedPatientId] = useState(INITIAL_PATIENTS[0]?.id || '');
  const [selectedProfessionalId, setSelectedProfessionalId] = useState(INITIAL_PROFESSIONALS[0]?.id || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form Vitals
  const [weightKg, setWeightKg] = useState<number>(INITIAL_PATIENTS[0]?.currentWeightKg || 10.0);
  const [temperatureC, setTemperatureC] = useState<number>(38.5);
  const [heartRateBpm, setHeartRateBpm] = useState<number>(90);
  const [respiratoryRateBpm, setRespiratoryRateBpm] = useState<number>(24);
  const [capillaryRefillTimeSec, setCapillaryRefillTimeSec] = useState<number>(2);
  const [mucousMembranes, setMucousMembranes] = useState<string>('Rosadas y húmedas');
  const [bodyCondition, setBodyCondition] = useState<'1/5' | '2/5' | '3/5' | '4/5' | '5/5'>('3/5');

  // Form Clinical
  const [reasonForVisit, setReasonForVisit] = useState<string>('');
  const [anamnesis, setAnamnesis] = useState<string>('');
  const [physicalExamFindings, setPhysicalExamFindings] = useState<string>('');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState<string>('');
  const [treatmentPlan, setTreatmentPlan] = useState<string>('');

  // SOAP Clinical Evolution
  const [soap, setSoap] = useState<SoapNote>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });
  const updateSoap = (key: keyof SoapNote, value: string) => setSoap((s) => ({ ...s, [key]: value }));

  // Prescription Items
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    {
      id: 'pitem-1',
      medicationName: 'Amoxicilina + Ac. Clavulánico 250mg',
      dose: '1/2 comprimido',
      frequency: 'Cada 12 horas',
      duration: '7 días',
      route: 'oral',
      specialInstructions: 'Administrar junto a las comidas principales.',
    },
  ]);

  const [dispensedMeds, setDispensedMeds] = useState<{ med: InventoryMedication; quantity: number }[]>([]);

  const selectedPatient = INITIAL_PATIENTS.find((p) => p.id === selectedPatientId) || INITIAL_PATIENTS[0] || null;
  const selectedClient = INITIAL_CLIENTS.find((c) => c.id === selectedPatient?.clientId);
  const selectedProfessional = INITIAL_PROFESSIONALS.find((pr) => pr.id === selectedProfessionalId) || INITIAL_PROFESSIONALS[0] || null;

  const handleAddMedication = () => {
    const newItem: PrescriptionItem = {
      id: `pitem-${Date.now()}`,
      medicationName: '',
      dose: '',
      frequency: 'Cada 24 horas',
      duration: '5 días',
      route: 'oral',
    };
    setPrescriptionItems([...prescriptionItems, newItem]);
  };

  const handleRemoveMedication = (id: string) => {
    setPrescriptionItems(prescriptionItems.filter((i) => i.id !== id));
  };

  const handleSaveConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonForVisit || !primaryDiagnosis) return;

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Ficha de Atención & Registro Clínico
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Evaluación física multiespecie, anamnesis, constantes vitales y emisión de receta médica.
          </p>
        </div>

        <button
          onClick={handleSaveConsultation}
          className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98] shrink-0"
        >
          <Save className="w-4 h-4" />
          Guardar Consulta & Receta
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          Consulta clínica guardada exitosamente y sincronizada con el historial del paciente.
        </div>
      )}

      {/* Patient & Vet Selector Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Paciente / Mascota *</label>
          <select
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              const p = INITIAL_PATIENTS.find((item) => item.id === e.target.value);
              if (p) setWeightKg(p.currentWeightKg);
            }}
            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {INITIAL_PATIENTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - {p.species.toUpperCase()} ({p.breed}) • Tutor: {p.clientName}
              </option>
            ))}
          </select>

          {selectedPatient && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
              <p><strong>Alergias:</strong> <span className="text-rose-600 font-bold">{selectedPatient.allergies || 'Ninguna registrada'}</span></p>
              <p><strong>Condiciones Crónicas:</strong> {selectedPatient.chronicConditions || 'Sin patologías'}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Médico Veterinario Tratante *</label>
          <select
            value={selectedProfessionalId}
            onChange={(e) => setSelectedProfessionalId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {INITIAL_PROFESSIONALS.map((pr) => (
              <option key={pr.id} value={pr.id}>
                {pr.fullName} ({pr.professionalLicense}) - {pr.specialty}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Clinical Form */}
      <form onSubmit={handleSaveConsultation} className="space-y-6">
        {/* Constantes Vitales */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            Constantes Vitales & Examen Físico Inicial
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Peso (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Temp (°C) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={temperatureC}
                onChange={(e) => setTemperatureC(parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">FC (bpm)</label>
              <input
                type="number"
                value={heartRateBpm}
                onChange={(e) => setHeartRateBpm(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">FR (rpm)</label>
              <input
                type="number"
                value={respiratoryRateBpm}
                onChange={(e) => setRespiratoryRateBpm(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">TRC (seg)</label>
              <input
                type="number"
                value={capillaryRefillTimeSec}
                onChange={(e) => setCapillaryRefillTimeSec(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Cond. Corporal</label>
              <select
                value={bodyCondition}
                onChange={(e) => setBodyCondition(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="1/5">1/5 (Caquéctico)</option>
                <option value="2/5">2/5 (Delgado)</option>
                <option value="3/5">3/5 (Ideal)</option>
                <option value="4/5">4/5 (Sobrepeso)</option>
                <option value="5/5">5/5 (Obeso)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clinical Assessment */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            Evaluación Clínica & Diagnóstico
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Motivo de Consulta *</label>
              <input
                type="text"
                required
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                placeholder="Ej. Cuadro de prurito generalizado y eritema en pabellones auriculares."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Anamnesis del Tutor</label>
              <textarea
                rows={2}
                value={anamnesis}
                onChange={(e) => setAnamnesis(e.target.value)}
                placeholder="Reporte del tutor respecto a comportamiento, alimentación y deposiciones..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hallazgos del Examen Físico</label>
              <textarea
                rows={3}
                value={physicalExamFindings}
                onChange={(e) => setPhysicalExamFindings(e.target.value)}
                placeholder="Palpación abdominal, otoscopia, auscultación cardiopulmonar..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Diagnóstico Principal *</label>
              <input
                type="text"
                required
                value={primaryDiagnosis}
                onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                placeholder="Ej. Dermatitis atópica con otitis externa secundaria por Malassezia."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Plan de Tratamiento & Indicaciones</label>
              <textarea
                rows={3}
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                placeholder="Indicaciones médicas generales para el tutor..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* SOAP Clinical Note Section */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Nota Clínica SOAP & Evolución
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Documentación médica estructurada que quedará registrada en la evolución del paciente (Subjetivo, Objetivo, Evaluación, Plan).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <SoapField
              letter="S"
              label="Subjetivo"
              hint="Historia referida por el tutor, evolución de síntomas desde la última visita."
              color="border-blue-200 bg-blue-50/40"
              badge="bg-blue-600"
              value={soap.subjective}
              onChange={(v) => updateSoap('subjective', v)}
            />
            <SoapField
              letter="O"
              label="Objetivo"
              hint="Hallazgos del examen físico, constantes vitales y pruebas objetivas."
              color="border-emerald-200 bg-emerald-50/40"
              badge="bg-emerald-600"
              value={soap.objective}
              onChange={(v) => updateSoap('objective', v)}
            />
            <SoapField
              letter="A"
              label="Evaluación (Assessment)"
              hint="Diagnóstico(s), problemas activos, evaluación del estado actual."
              color="border-amber-200 bg-amber-50/40"
              badge="bg-amber-500"
              value={soap.assessment}
              onChange={(v) => updateSoap('assessment', v)}
            />
            <SoapField
              letter="P"
              label="Plan"
              hint="Plan terapéutico, controles, exámenes, derivaciones y seguimiento."
              color="border-rose-200 bg-rose-50/40"
              badge="bg-rose-600"
              value={soap.plan}
              onChange={(v) => updateSoap('plan', v)}
            />
          </div>
        </div>

        {/* Prescriptions Section */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-600" />
              Receta Médica Electrónica
            </h3>

            <button
              type="button"
              onClick={handleAddMedication}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar Fármaco
            </button>
          </div>

          <div className="space-y-3">
            {prescriptionItems.map((item, idx) => (
              <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Fármaco #{idx + 1}</span>
                  {prescriptionItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(item.id)}
                      className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Quitar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nombre Medicamento / Presentación</label>
                    <input
                      type="text"
                      value={item.medicationName}
                      onChange={(e) => {
                        const updated = [...prescriptionItems];
                        updated[idx].medicationName = e.target.value;
                        setPrescriptionItems(updated);
                      }}
                      placeholder="Ej. Cefalexina 500mg"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Dosis</label>
                    <input
                      type="text"
                      value={item.dose}
                      onChange={(e) => {
                        const updated = [...prescriptionItems];
                        updated[idx].dose = e.target.value;
                        setPrescriptionItems(updated);
                      }}
                      placeholder="1 comp"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Frecuencia</label>
                    <input
                      type="text"
                      value={item.frequency}
                      onChange={(e) => {
                        const updated = [...prescriptionItems];
                        updated[idx].frequency = e.target.value;
                        setPrescriptionItems(updated);
                      }}
                      placeholder="Cada 12h"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase 2: Stock Deduction & Billing Generator */}
        <MedicationStockSelector
          onSelectMedication={(med, quantity) => {
            setDispensedMeds([...dispensedMeds, { med, quantity }]);
          }}
        />

        <BillingOrderGenerator
          patientName={selectedPatient?.name || ''}
          clientName={selectedClient?.fullName || selectedPatient?.clientName || ''}
          clientRut={selectedClient?.rut || ''}
          consultationFeeCLP={32000}
          dispensedMeds={dispensedMeds}
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            Finalizar & Emitir Receta
          </button>
        </div>
      </form>
    </div>
  );
}

function SoapField({
  letter,
  label,
  hint,
  color,
  badge,
  value,
  onChange,
}: {
  letter: string;
  label: string;
  hint: string;
  color: string;
  badge: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={`border rounded-xl p-3 ${color} space-y-1.5`}>
      <div className="flex items-center gap-2">
        <span className={`text-white text-[10px] font-black px-2 py-0.5 rounded ${badge}`}>{letter}</span>
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

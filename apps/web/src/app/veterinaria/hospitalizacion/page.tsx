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
  Loader2,
  Stethoscope,
} from 'lucide-react';
import { toast } from 'sonner';
import { useHospitalizations } from '../hooks/use-hospitalizations';
import { usePatients } from '../hooks/use-patients';
import { useProfessionals } from '../hooks/use-professionals';
import { getApiClient } from '@/lib/api-client';

export default function VeterinaryHospitalizationPage() {
  const { data: hospitalizations, loading, refresh } = useHospitalizations();
  const { data: patients } = usePatients();
  const { data: professionals } = useProfessionals();
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedHospId, setSelectedHospId] = useState<string>('');
  const [logForm, setLogForm] = useState({
    temperatureC: '',
    heartRateBpm: '',
    respiratoryRateBpm: '',
    feeding: '',
    hydration: '',
    medicationGiven: '',
    urinated: false,
    defecated: false,
    notes: '',
    professionalId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [dischargingId, setDischargingId] = useState<string | null>(null);
  const [confirmDischargeId, setConfirmDischargeId] = useState<string | null>(null);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospId) return;
    setSubmitting(true);
    try {
      const api = getApiClient();
      await api.createVetHospitalizationLog({
        hospitalization_id: selectedHospId,
        temperature_c: logForm.temperatureC ? parseFloat(logForm.temperatureC) : null,
        heart_rate_bpm: logForm.heartRateBpm ? parseInt(logForm.heartRateBpm) : null,
        respiratory_rate_bpm: logForm.respiratoryRateBpm ? parseInt(logForm.respiratoryRateBpm) : null,
        feeding: logForm.feeding || null,
        hydration: logForm.hydration || null,
        medication_given: logForm.medicationGiven || null,
        urinated: logForm.urinated,
        defecated: logForm.defecated,
        notes: logForm.notes || null,
        professional_id: logForm.professionalId || null,
      });
      toast.success('Control de enfermería registrado correctamente');
      refresh();
      setShowLogModal(false);
      setLogForm({ temperatureC: '', heartRateBpm: '', respiratoryRateBpm: '', feeding: '', hydration: '', medicationGiven: '', urinated: false, defecated: false, notes: '', professionalId: '' });
    } catch (err) {
      toast.error('Error al registrar control de enfermería');
      console.error('Error creating log:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDischarge = async (hospId: string) => {
    setDischargingId(hospId);
    try {
      const api = getApiClient();
      await api.dischargeVetHospitalization(hospId, { discharge_summary: 'Paciente dado de alta' });
      toast.success('Paciente dado de alta correctamente');
      refresh();
    } catch (err) {
      toast.error('Error al dar de alta al paciente');
      console.error('Error discharging:', err);
    } finally {
      setDischargingId(null);
      setConfirmDischargeId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-80 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-slate-100 rounded-lg animate-pulse mt-2" />
          </div>
        </div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-64 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            <div className="space-y-2">
              {[...Array(2)].map((_, j) => (
                <div key={j} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

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
        {hospitalizations.map((hosp: any) => {
          const priorityBadge: Record<string, string> = {
            baja: 'bg-slate-100 text-slate-700 border-slate-200',
            media: 'bg-blue-100 text-blue-800 border-blue-200',
            alta: 'bg-amber-100 text-amber-800 border-amber-200',
            critica: 'bg-rose-100 text-rose-800 border-rose-200',
          };
          const badgeClass = priorityBadge[hosp.priority] || priorityBadge.media;
          return (
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
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${badgeClass}`}>
                      Prioridad {hosp.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <strong>Ubicación:</strong> {hosp.cageNumber} • <strong>Médico Responsable:</strong> {hosp.attendingVetName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right text-xs">
                  <span className="text-slate-400 block">Ingreso Hosp.</span>
                  <span className="font-bold text-slate-800">{hosp.admissionDate}</span>
                </div>
                {hosp.status !== 'discharged' && (
                  <button
                    onClick={() => {
                      setSelectedHospId(hosp.id);
                      setShowLogModal(true);
                    }}
                    className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-sm flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Nuevo Control
                  </button>
                )}
                {hosp.status !== 'discharged' && !confirmDischargeId && (
                  <button
                    onClick={() => setConfirmDischargeId(hosp.id)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-all border border-emerald-200 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Alta
                  </button>
                )}
                {hosp.status !== 'discharged' && confirmDischargeId === hosp.id && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-semibold">¿Dar de alta?</span>
                    <button
                      onClick={() => handleDischarge(hosp.id)}
                      disabled={dischargingId === hosp.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1"
                    >
                      {dischargingId === hosp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Confirmar
                    </button>
                    <button
                      onClick={() => setConfirmDischargeId(null)}
                      className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
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
                {(hosp.logs || []).map((log: any) => (
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
        );
        })}
      </div>

      {/* Add Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Registrar Control de Enfermería</h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLog} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">T° (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={logForm.temperatureC}
                    onChange={(e) => setLogForm({ ...logForm, temperatureC: e.target.value })}
                    placeholder="38.5"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">FC (bpm)</label>
                  <input
                    type="number"
                    value={logForm.heartRateBpm}
                    onChange={(e) => setLogForm({ ...logForm, heartRateBpm: e.target.value })}
                    placeholder="120"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">FR (rpm)</label>
                  <input
                    type="number"
                    value={logForm.respiratoryRateBpm}
                    onChange={(e) => setLogForm({ ...logForm, respiratoryRateBpm: e.target.value })}
                    placeholder="24"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Alimentación</label>
                <input
                  type="text"
                  value={logForm.feeding}
                  onChange={(e) => setLogForm({ ...logForm, feeding: e.target.value })}
                  placeholder="Ej. Comió ración completa 200g"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hidratación</label>
                <input
                  type="text"
                  value={logForm.hydration}
                  onChange={(e) => setLogForm({ ...logForm, hydration: e.target.value })}
                  placeholder="Ej. SC 100ml/h"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fármacos Administrados</label>
                <input
                  type="text"
                  value={logForm.medicationGiven}
                  onChange={(e) => setLogForm({ ...logForm, medicationGiven: e.target.value })}
                  placeholder="Ej. Meloxicam 0.2mg/kg"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={logForm.urinated}
                    onChange={(e) => setLogForm({ ...logForm, urinated: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Orinó
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={logForm.defecated}
                    onChange={(e) => setLogForm({ ...logForm, defecated: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Defecó
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notas</label>
                <textarea
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  placeholder="Observaciones del turno..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Profesional</label>
                <select
                  value={logForm.professionalId}
                  onChange={(e) => setLogForm({ ...logForm, professionalId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seleccionar profesional...</option>
                  {professionals.map((prof: any) => (
                    <option key={prof.id} value={prof.id}>{prof.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Stethoscope className="w-3 h-3" />}
                  Guardar Control
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

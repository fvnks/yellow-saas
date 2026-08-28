'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Dog,
  Cat,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Weight,
  Cpu,
  Shield,
  Activity,
  Stethoscope,
  Syringe,
  Pill,
  BedDouble,
  FileText,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import PatientRecordPDF from './components/patient-record-pdf';
import {
  INITIAL_PATIENTS,
  INITIAL_CLIENTS,
  INITIAL_CONSULTATIONS,
  INITIAL_VACCINATIONS,
  INITIAL_DEWORMINGS,
  INITIAL_REMINDERS,
  VeterinaryPatient,
} from '../../lib/veterinary-store';

export default function VeterinaryPatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;

  const patient = INITIAL_PATIENTS.find((p) => p.id === patientId) || INITIAL_PATIENTS[0];
  const client = INITIAL_CLIENTS.find((c) => c.id === patient.clientId);

  const [activeTab, setActiveTab] = useState<'resumen' | 'consultas' | 'vacunas' | 'desparasitaciones' | 'recetas' | 'peso'>('resumen');

  const patientConsultations = INITIAL_CONSULTATIONS.filter((c) => c.patientId === patient.id);
  const patientVaccinations = INITIAL_VACCINATIONS.filter((v) => v.patientId === patient.id);
  const patientDewormings = INITIAL_DEWORMINGS.filter((d) => d.patientId === patient.id);

  return (
    <div className="space-y-6">
      {/* Patient Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-2xl font-bold shadow-sm shrink-0">
            {patient.species === 'perro' ? <Dog className="w-9 h-9" /> : <Cat className="w-9 h-9" />}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{patient.name}</h1>
              <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-0.5 rounded-md capitalize">
                {patient.species} • {patient.breed}
              </span>
              {patient.isSterilized && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-md border border-emerald-200">
                  Esterilizado/a
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-3">
              <span>Nacimiento: <strong className="text-slate-700">{patient.birthDate}</strong></span>
              <span>Sexo: <strong className="text-slate-700 capitalize">{patient.gender}</strong></span>
              <span>Color: <strong className="text-slate-700">{patient.color}</strong></span>
            </p>

            {patient.microchip && (
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg w-fit mt-1">
                <Cpu className="w-4 h-4 text-emerald-600" />
                Chip: {patient.microchip}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
          <PatientRecordPDF
            patient={patient}
            client={client || { fullName: patient.clientName, rut: '15.482.910-K', phone: '+56 9 8765 4321', email: 'tutor@ejemplo.cl' }}
            consultations={patientConsultations}
            vaccinations={patientVaccinations}
            dewormings={patientDewormings}
          />
          <Link
            href="/veterinaria/consultas"
            className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
          >
            <Stethoscope className="w-4 h-4" />
            Iniciar Consulta
          </Link>
          <Link
            href="/veterinaria/agenda"
            className="bg-[#0F172A] hover:bg-slate-800 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Agendar Cita
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'resumen', label: 'Resumen 360°', icon: Activity },
          { id: 'consultas', label: `Consultas (${patientConsultations.length})`, icon: Stethoscope },
          { id: 'vacunas', label: `Vacunación (${patientVaccinations.length})`, icon: Syringe },
          { id: 'desparasitacion', label: `Desparasitaciones (${patientDewormings.length})`, icon: Shield },
          { id: 'recetas', label: 'Recetas Médicas', icon: Pill },
          { id: 'peso', label: 'Curva de Peso', icon: Weight },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'resumen' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Health Overview & Alerts Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                Alertas Clínicas & Estado de Salud
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider block mb-1">
                    Alergias Conocidas
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {patient.allergies || 'Ninguna registrada'}
                  </p>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <span className="text-xs font-extrabold text-rose-800 uppercase tracking-wider block mb-1">
                    Condiciones Crónicas
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {patient.chronicConditions || 'Sin patologías crónicas'}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <span className="text-xs font-extrabold text-blue-800 uppercase tracking-wider block mb-1">
                    Tratamiento Permanente
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {patient.permanentMedications || 'Sin medicación continua'}
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block mb-1">
                    Dieta Recomendada
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {patient.diet || 'Alimento balanceado estándar'}
                  </p>
                </div>
              </div>
            </div>

            {/* Ultimas Consultas Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Última Consulta Registrada</h3>
                <span className="text-xs font-bold text-emerald-600">Historial completo disponible</span>
              </div>

              {patientConsultations.length > 0 ? (
                <div className="p-6 space-y-3">
                  {patientConsultations.map((c) => (
                    <div key={c.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-500">{c.consultationDate}</span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          Dr(a). {c.professionalName}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{c.reasonForVisit}</h4>
                      <p className="text-xs text-slate-600">
                        <strong>Anamnesis:</strong> {c.anamnesis}
                      </p>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 font-semibold">
                        Diagnóstico: {c.primaryDiagnosis}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-6 text-xs text-slate-500">Sin consultas previas registradas.</p>
              )}
            </div>
          </div>

          {/* Right Col: Contacto del Tutor */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-slate-700" />
                Datos del Tutor Responsable
              </h3>

              {client ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Nombre Completo</span>
                    <strong className="text-sm text-slate-900 font-bold">{client.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">RUT</span>
                    <strong className="text-slate-800 font-mono">{client.rut}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <strong>{client.phone}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{client.address}, {client.commune}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Sin datos de tutor.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'consultas' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Historial de Consultas Médicas</h3>
            <Link
              href="/veterinaria/consultas"
              className="bg-[#0F172A] text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-all"
            >
              + Nueva Consulta
            </Link>
          </div>

          <div className="space-y-4">
            {patientConsultations.map((c) => (
              <div key={c.id} className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{c.consultationDate}</span>
                    <span className="text-xs text-slate-500 ml-2">Atendido por {c.professionalName}</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
                    Consulta Finalizada
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200">
                  <div>Peso: <strong>{c.weightKg} kg</strong></div>
                  <div>Temp: <strong>{c.temperatureC} °C</strong></div>
                  <div>FC: <strong>{c.heartRateBpm} bpm</strong></div>
                  <div>FR: <strong>{c.respiratoryRateBpm} rpm</strong></div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-700 uppercase">Motivo de Consulta</h5>
                  <p className="text-xs text-slate-800 mt-0.5">{c.reasonForVisit}</p>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-700 uppercase">Diagnóstico Principal</h5>
                  <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg mt-0.5">
                    {c.primaryDiagnosis}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Dog,
  Calendar,
  BedDouble,
  Users,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Syringe,
  FileText,
  Search,
  Activity,
} from 'lucide-react';
import {
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_HOSPITALIZATIONS,
  INITIAL_REMINDERS,
  VeterinaryAppointment,
} from './lib/veterinary-store';

export default function VeterinaryDashboardPage() {
  const [appointments, setAppointments] = useState<VeterinaryAppointment[]>(INITIAL_APPOINTMENTS);
  const patients = INITIAL_PATIENTS;
  const hospitalizations = INITIAL_HOSPITALIZATIONS;
  const reminders = INITIAL_REMINDERS;

  // Formatting helper CLP
  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  const handleUpdateStatus = (id: string, newStatus: VeterinaryAppointment['status']) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-slate-900 to-emerald-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                Módulo Veterinaria & Clínica
              </span>
              <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                Norma Ley 21.020 & DTE SII
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Consola Operativa Clínica Veterinaria
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Gestión integral de pacientes multiespecie, fichas clínicas 360°, agenda de boxes, hospitalización y emisión de recetas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/veterinaria/consultas"
              className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
            >
              <Stethoscope className="w-4 h-4" />
              Nueva Consulta
            </Link>
            <Link
              href="/veterinaria/agenda"
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all border border-white/10 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Ver Agenda
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Citas para Hoy</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{appointments.length}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {appointments.filter((a) => a.status === 'confirmada' || a.status === 'en_espera').length} listas para atender
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pacientes Activos</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{patients.length}</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {patients.filter((p) => p.isSterilized).length} esterilizados con chip
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-center text-amber-600">
            <Dog className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hospitalizados UCI</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{hospitalizations.length}</h3>
            <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              1 paciente prioridad alta
            </p>
          </div>
          <div className="w-12 h-12 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-center text-rose-600">
            <BedDouble className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alertas Preventivas</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{reminders.length}</h3>
            <p className="text-xs text-amber-600 font-medium mt-1">
              Vacunas y desparasitación
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-center text-blue-600">
            <Syringe className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Agenda de Citas del Día */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">Agenda de Atenciones del Día</h3>
              </div>
              <Link href="/veterinaria/agenda" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                Ver completa <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-900 text-white font-mono text-xs font-bold px-2.5 py-1.5 rounded-xl text-center shrink-0">
                      {apt.appointmentTime}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{apt.patientName}</h4>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md capitalize font-medium">
                          {apt.species}
                        </span>
                        {apt.status === 'en_espera' && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border border-amber-200">
                            En Sala de Espera
                          </span>
                        )}
                        {apt.status === 'confirmada' && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border border-emerald-200">
                            Confirmada
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">Tutor:</span> {apt.clientName} ({apt.clientPhone})
                      </p>
                      <p className="text-xs text-slate-600 font-medium mt-1">
                        <span className="text-emerald-600 font-bold">{apt.serviceName}</span> • Dr(a). {apt.professionalName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {apt.status !== 'en_atencion' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'en_atencion')}
                        className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                        Llamar a Box
                      </button>
                    )}
                    <Link
                      href={`/veterinaria/pacientes/${apt.patientId}`}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                    >
                      Ver Ficha
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/veterinaria/pacientes" className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all group">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Dog className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Buscar Paciente</h4>
              <p className="text-xs text-slate-500 mt-1">Acceder por nombre, RUT o microchip</p>
            </Link>

            <Link href="/veterinaria/consultas" className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all group">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Registro Clínico</h4>
              <p className="text-xs text-slate-500 mt-1">Anamnesis, constantes vitales y receta</p>
            </Link>

            <Link href="/veterinaria/hospitalizacion" className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-rose-300 transition-all group">
              <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BedDouble className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Hospitalización</h4>
              <p className="text-xs text-slate-500 mt-1">Control de jaulas y tratamiento IV</p>
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Hospitalización Activa & Recordatorios */}
        <div className="space-y-6">
          {/* Hospitalización Activa Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200/80 bg-rose-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Hospitalización Activa</h3>
              </div>
              <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                {hospitalizations.length} Jaulas
              </span>
            </div>

            <div className="p-4 space-y-3">
              {hospitalizations.map((hosp) => (
                <div key={hosp.id} className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{hosp.patientName}</span>
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {hosp.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{hosp.cageNumber}</p>
                  <p className="text-xs text-slate-700 font-medium mt-1 line-clamp-2">
                    {hosp.initialDiagnosis}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">{hosp.attendingVetName}</span>
                    <Link
                      href="/veterinaria/hospitalizacion"
                      className="text-xs font-bold text-rose-600 hover:text-rose-700"
                    >
                      Ver Hoja UCI &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recordatorios de Preventiva */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Syringe className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Próximos Controles</h3>
              </div>
              <span className="text-xs font-bold text-emerald-600">{reminders.length} Pendientes</span>
            </div>

            <div className="divide-y divide-slate-100">
              {reminders.map((rem) => (
                <div key={rem.id} className="p-3.5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{rem.title}</h5>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Paciente: <span className="font-semibold">{rem.patientName}</span> ({rem.clientName})
                      </p>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                      {rem.dueDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

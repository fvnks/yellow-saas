'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  User,
  Dog,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Filter,
} from 'lucide-react';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_PATIENTS,
  INITIAL_PROFESSIONALS,
  INITIAL_SERVICES,
  INITIAL_ROOMS,
  VeterinaryAppointment,
} from '../lib/veterinary-store';

export default function VeterinaryAgendaPage() {
  const [appointments, setAppointments] = useState<VeterinaryAppointment[]>(INITIAL_APPOINTMENTS);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState({
    patientId: INITIAL_PATIENTS[0]?.id || '',
    professionalId: INITIAL_PROFESSIONALS[0]?.id || '',
    serviceId: INITIAL_SERVICES[0]?.id || '',
    roomId: INITIAL_ROOMS[0]?.id || '',
    appointmentDate: selectedDate,
    appointmentTime: '12:00',
    reason: '',
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = INITIAL_PATIENTS.find((p) => p.id === formData.patientId);
    const pro = INITIAL_PROFESSIONALS.find((pr) => pr.id === formData.professionalId);
    const srv = INITIAL_SERVICES.find((s) => s.id === formData.serviceId);
    const rm = INITIAL_ROOMS.find((r) => r.id === formData.roomId);

    if (!pat || !pro || !srv) return;

    const newApt: VeterinaryAppointment = {
      id: `apt-${Date.now()}`,
      patientId: pat.id,
      patientName: pat.name,
      species: pat.species,
      clientId: pat.clientId,
      clientName: pat.clientName,
      clientPhone: pat.clientPhone,
      professionalId: pro.id,
      professionalName: pro.fullName,
      serviceId: srv.id,
      serviceName: srv.name,
      roomId: rm?.id,
      roomName: rm?.name,
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime,
      durationMinutes: srv.durationMinutes,
      reason: formData.reason || 'Consulta agendada',
      status: 'agendada',
    };

    setAppointments([newApt, ...appointments]);
    setShowModal(false);
  };

  const handleUpdateStatus = (id: string, newStatus: VeterinaryAppointment['status']) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Agenda & Control de Citas
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Planificación de consultas, boxes de atención y estado de recepción del paciente.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Agendar Cita
        </button>
      </div>

      {/* Date Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-slate-700" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
            Mostrando citas para el día seleccionado
          </span>
        </div>

        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
          {appointments.length} Citas Programadas
        </div>
      </div>

      {/* Agenda Appointments List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {appointments.map((apt) => (
            <div key={apt.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-[#0F172A] text-white font-mono text-sm font-bold px-3 py-2 rounded-xl text-center shrink-0">
                  <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-0.5" />
                  {apt.appointmentTime}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{apt.patientName}</h3>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold capitalize">
                      {apt.species}
                    </span>
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {apt.serviceName}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong>Tutor:</strong> {apt.clientName} • <strong>Teléfono:</strong> {apt.clientPhone}
                  </p>

                  <p className="text-xs text-slate-500">
                    <strong>Médico:</strong> Dr(a). {apt.professionalName} {apt.roomName && `• ${apt.roomName}`}
                  </p>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                <select
                  value={apt.status}
                  onChange={(e) => handleUpdateStatus(apt.id, e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="agendada">Agendada</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="en_espera">En Sala de Espera</option>
                  <option value="en_atencion">En Atención</option>
                  <option value="finalizada">Finalizada</option>
                  <option value="cancelada">Cancelada</option>
                </select>

                <Link
                  href={`/veterinaria/pacientes/${apt.patientId}`}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                >
                  Ficha Clinica
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Agendar Cita */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Agendar Nueva Cita Veterinaria</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Paciente / Mascota *</label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {INITIAL_PATIENTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.species} - Tutor: {p.clientName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Médico Veterinario *</label>
                  <select
                    value={formData.professionalId}
                    onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {INITIAL_PROFESSIONALS.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.fullName} - {pr.specialty}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Servicio Solicitado *</label>
                  <select
                    value={formData.serviceId}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {INITIAL_SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (${s.priceCLP.toLocaleString('es-CL')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Box de Atención</label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {INITIAL_ROOMS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hora *</label>
                  <input
                    type="time"
                    required
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Motivo o Observación</label>
                <textarea
                  rows={2}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Ej. Control de vacuna óctuple y corte de uñas"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-sm"
                >
                  Confirmar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Car,
  Calendar,
  User,
  Wrench,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { formatCLP, formatDate, getStatusBadgeClass, getStatusLabel } from '../lib/utils';

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  appointment_type: string;
  status: string;
  notes: string;
  auto_vehicles?: {
    patente: string;
    brand: string;
    model: string;
  };
  customers?: {
    nombre: string;
  };
  auto_technicians?: {
    full_name: string;
  };
}

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const res = await fetch(`/api/auto-talleres/agenda?company_id=${process.env.NEXT_PUBLIC_COMPANY_ID}&dateFrom=${filterDate}&dateTo=${filterDate}`);
        const data = await res.json();
        if (data.success) setAppointments(data.data);
      } catch (err) {
        console.error('Error loading appointments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAppointments();
  }, [filterDate]);

  const groupedByDate = appointments.reduce((acc, appt) => {
    const date = appt.appointment_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(appt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A]">Agenda</h1>
          <p className="text-sm text-slate-500 mt-1">Programa y gestiona citas del taller</p>
        </div>
        <Link
          href="/auto-talleres/agenda/new"
          className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
        >
          <Calendar className="w-4 h-4" />
          Nueva Cita
        </Link>
      </div>

      {/* Date Filter */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-slate-700">Filtrar por fecha:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
          <span className="text-sm text-slate-500">
            {appointments.length} citas
          </span>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : Object.keys(groupedByDate).length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200/80 rounded-2xl">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No hay citas programadas</p>
            <p className="text-sm text-slate-400 mt-1">Programa una nueva cita para comenzar</p>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([date, dayAppointments]) => (
            <div key={date}>
              <h2 className="text-sm font-bold text-slate-900 mb-3 px-1">
                {new Date(date).toLocaleString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h2>
              <div className="space-y-2">
                {dayAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="text-center min-w-[80px]">
                      <p className="text-sm font-bold text-slate-900">{appt.start_time}</p>
                      <p className="text-xs text-slate-500">a {appt.end_time}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                      <Car className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{appt.notes || appt.appointment_type}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(appt.status)}`}>
                          {getStatusLabel(appt.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        {appt.auto_vehicles && (
                          <span className="flex items-center gap-1">
                            <Car className="w-3 h-3" />
                            {appt.auto_vehicles.patente} - {appt.auto_vehicles.brand} {appt.auto_vehicles.model}
                          </span>
                        )}
                        {appt.customers && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {appt.customers.nombre}
                          </span>
                        )}
                        {appt.auto_technicians && (
                          <span className="flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            {appt.auto_technicians.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/auto-talleres/agenda/${appt.id}`}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors"
                    >
                      Ver detalle
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { INITIAL_RESERVATIONS, INITIAL_TABLES, Reservation } from '../lib/restaurant-store';
import { CalendarCheck, Mail, Phone, Users, Clock, Plus, CheckCircle, Ticket } from 'lucide-react';
import { toast } from 'sonner';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [tables] = useState(INITIAL_TABLES);

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    tableId: 2,
    date: new Date().toISOString().split('T')[0],
    time: '20:00',
    peopleCount: 2,
  });

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerEmail) {
      toast.error('Por favor completa el nombre y correo de confirmación.');
      return;
    }

    const selectedTable = tables.find(t => t.tableId === Number(form.tableId));
    const reservationCode = `RES-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      reservationCode,
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      customerPhone: form.customerPhone || '+56 9 1234 5678',
      tableId: Number(form.tableId),
      tableName: selectedTable?.tableName || 'Mesa Salon',
      date: form.date,
      time: form.time,
      peopleCount: Number(form.peopleCount),
      status: 'confirmed',
    };

    setReservations(prev => [newRes, ...prev]);
    toast.success(`Reserva ${reservationCode} creada. Correo enviado a ${form.customerEmail}`);
    setForm({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      tableId: 2,
      date: new Date().toISOString().split('T')[0],
      time: '20:00',
      peopleCount: 2,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-amber-500" />
            Reservas Web en Línea & Confirmación
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Recepción de reservas, asignación automática de mesa y emisión de correo con código único.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Nueva Reserva Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-500" />
              Formulario de Nueva Reserva
            </h2>

            <form onSubmit={handleCreateReservation} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Completo del Cliente</label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={e => setForm({ ...form, customerName: e.target.value })}
                  placeholder="Ej. Constanza Morales"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo (Confirmación)</label>
                  <input
                    type="email"
                    required
                    value={form.customerEmail}
                    onChange={e => setForm({ ...form, customerEmail: e.target.value })}
                    placeholder="cliente@email.cl"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    value={form.customerPhone}
                    onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                    placeholder="+56 9 ..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hora</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Personas</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={form.peopleCount}
                    onChange={e => setForm({ ...form, peopleCount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asignar Mesa</label>
                <select
                  value={form.tableId}
                  onChange={e => setForm({ ...form, tableId: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  {tables.map(t => (
                    <option key={t.tableId} value={t.tableId}>
                      {t.tableName} (Cap: {t.capacity} p.)
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs mt-2"
              >
                <Mail className="w-4 h-4" /> Confirmar & Enviar Código por Email
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Reservas del Día List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Listado de Reservas Confirmadas</span>
              <span className="text-xs text-slate-500 font-normal">{reservations.length} Registradas</span>
            </h2>

            <div className="space-y-3">
              {reservations.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 space-y-1">
                  <CalendarCheck className="w-6 h-6 mx-auto text-slate-400" />
                  <p className="text-xs font-bold text-slate-700">No hay reservas registradas</p>
                  <p className="text-[11px] text-slate-500">Crea la primera reserva usando el formulario de la izquierda.</p>
                </div>
              ) : (
                reservations.map(res => (
                <div
                  key={res.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                        {res.reservationCode}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{res.customerName}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" /> {res.customerEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {res.customerPhone}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-[11px] pt-1">
                      <span className="font-semibold">{res.tableName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" /> {res.date} a las {res.time} hrs
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-500" /> {res.peopleCount} pers.
                      </span>
                    </div>
                  </div>

                  <span className="self-start sm:self-center inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" /> Confirmada
                  </span>
                </div>
              ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

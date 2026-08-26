'use client';

import { useState } from 'react';
import {
  CalendarDays, Plus, Clock, Car, ShieldCheck, CheckCircle2,
  Users, DollarSign, Sparkles, Building, AlertTriangle, Trash2
} from 'lucide-react';
import { INITIAL_UNITS, formatCLP } from '@/lib/condominio-client';

interface CommonAreaReservation {
  id: string;
  spaceName: 'Quincho Principal' | 'Salón de Eventos' | 'Multicancha' | 'Gimnasio';
  unitNumber: string;
  reserverName: string;
  date: string;
  timeSlot: string; // e.g. "14:00 - 20:00"
  feeCLP: number;
  depositCLP: number;
  status: 'confirmada' | 'pendiente' | 'finalizada';
}

interface VisitorEntry {
  id: string;
  visitorName: string;
  visitorRut: string;
  vehiclePlate: string;
  destinationUnitNumber: string;
  entryTime: string;
  parkingSpot: string;
  status: 'activo' | 'salio';
}

const INITIAL_RESERVATIONS: CommonAreaReservation[] = [
  {
    id: 'res-1',
    spaceName: 'Quincho Principal',
    unitNumber: 'Dpto 101',
    reserverName: 'Carlos Silva M.',
    date: '2026-04-04',
    timeSlot: '13:00 - 19:00',
    feeCLP: 25000,
    depositCLP: 50000,
    status: 'confirmada',
  },
  {
    id: 'res-2',
    spaceName: 'Salón de Eventos',
    unitNumber: 'Parcela 01',
    reserverName: 'Fernando Araya T.',
    date: '2026-04-11',
    timeSlot: '18:00 - 02:00',
    feeCLP: 45000,
    depositCLP: 100000,
    status: 'confirmada',
  },
];

const INITIAL_VISITORS: VisitorEntry[] = [
  {
    id: 'vis-1',
    visitorName: 'Juan Pablo Morales',
    visitorRut: '18.990.120-4',
    vehiclePlate: 'KJ-88-21',
    destinationUnitNumber: 'Dpto 202',
    entryTime: '14:30',
    parkingSpot: 'Visita V-04',
    status: 'activo',
  },
  {
    id: 'vis-2',
    visitorName: 'Claudia Rojas B.',
    visitorRut: '16.442.110-K',
    vehiclePlate: 'PZ-10-99',
    destinationUnitNumber: 'Dpto 102',
    entryTime: '11:15',
    parkingSpot: 'Visita V-02',
    status: 'salio',
  },
];

export default function EspaciosConsergeriaPage() {
  const [reservations, setReservations] = useState<CommonAreaReservation[]>(INITIAL_RESERVATIONS);
  const [visitors, setVisitors] = useState<VisitorEntry[]>(INITIAL_VISITORS);

  // Modals
  const [showAddReservationModal, setShowAddReservationModal] = useState(false);
  const [showAddVisitorModal, setShowAddVisitorModal] = useState(false);

  // New Reservation Form State
  const [spaceName, setSpaceName] = useState<CommonAreaReservation['spaceName']>('Quincho Principal');
  const [resUnitId, setResUnitId] = useState(INITIAL_UNITS[0].id);
  const [resDate, setResDate] = useState('2026-04-18');
  const [resTimeSlot, setResTimeSlot] = useState('14:00 - 20:00');
  const [resFee, setResFee] = useState('25000');

  // New Visitor Form State
  const [visName, setVisName] = useState('');
  const [visRut, setVisRut] = useState('');
  const [visPlate, setVisPlate] = useState('');
  const [visUnitNumber, setVisUnitNumber] = useState(INITIAL_UNITS[0].number);
  const [visSpot, setVisSpot] = useState('Visita V-01');

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const unitObj = INITIAL_UNITS.find((u) => u.id === resUnitId) || INITIAL_UNITS[0];
    const newRes: CommonAreaReservation = {
      id: `res-${Date.now()}`,
      spaceName: spaceName,
      unitNumber: unitObj.number,
      reserverName: unitObj.ownerName,
      date: resDate,
      timeSlot: resTimeSlot,
      feeCLP: parseInt(resFee, 10) || 0,
      depositCLP: 50000,
      status: 'confirmada',
    };

    setReservations([...reservations, newRes]);
    setShowAddReservationModal(false);
  };

  const handleCreateVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visName) return;

    const newVis: VisitorEntry = {
      id: `vis-${Date.now()}`,
      visitorName: visName,
      visitorRut: visRut || '15.112.334-5',
      vehiclePlate: visPlate || 'AA-00-00',
      destinationUnitNumber: visUnitNumber,
      entryTime: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      parkingSpot: visSpot,
      status: 'activo',
    };

    setVisitors([newVis, ...visitors]);
    setShowAddVisitorModal(false);
    setVisName('');
    setVisPlate('');
  };

  const handleMarkVisitorDeparture = (visId: string) => {
    setVisitors(visitors.map((v) => (v.id === visId ? { ...v, status: 'salio' } : v)));
  };

  const activeVisitorsCount = visitors.filter((v) => v.status === 'activo').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Espacios Comunes & Conserjería
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-cyan-50 text-cyan-700 border border-cyan-200">
              Ley de Copropiedad 21.442
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Reserva de Quinchos y Salones con cobro automático + Bitácora de Estacionamientos de Visitas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddVisitorModal(true)}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Car className="w-4 h-4 text-cyan-600" />
            Registrar Visita / Patente
          </button>

          <button
            onClick={() => setShowAddReservationModal(true)}
            className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 shadow-xs flex items-center gap-2 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Reservar Espacio Común
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Reservas Confirmadas</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{reservations.length}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Espacios reservados este mes</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Estacionamientos Visitas En Uso</span>
          <p className="text-2xl font-black text-cyan-600 mt-2">{activeVisitorsCount} de 10</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Vehículos registrados en conserjería</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-slate-500 text-xs font-semibold">Recaudación por Arriendo Espacios</span>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {formatCLP(reservations.reduce((acc, r) => acc + r.feeCLP, 0))}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Ingresos adicionales condominio</p>
        </div>
      </div>

      {/* Section 1: Common Area Reservations */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-cyan-600" />
            Reservas de Espacios Comunes (Quinchos, Salón de Eventos, Multicancha)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
                <th className="p-3">Espacio</th>
                <th className="p-3">Unidad Responsable</th>
                <th className="p-3">Copropietario</th>
                <th className="p-3">Fecha & Horario</th>
                <th className="p-3 text-right">Tarifa Reserva</th>
                <th className="p-3 text-right">Garantía</th>
                <th className="p-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-50 text-cyan-800 border border-cyan-200">
                      {r.spaceName}
                    </span>
                  </td>
                  <td className="p-3 font-black text-slate-900">{r.unitNumber}</td>
                  <td className="p-3 text-slate-800">{r.reserverName}</td>
                  <td className="p-3 text-slate-600 font-semibold">{r.date} ({r.timeSlot})</td>
                  <td className="p-3 text-right font-black text-slate-900">{formatCLP(r.feeCLP)}</td>
                  <td className="p-3 text-right text-slate-500">{formatCLP(r.depositCLP)}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      ✓ {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Conserjería & Visitors Parking Log */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Car className="w-4 h-4 text-cyan-600" />
            Bitácora de Conserjería - Ingreso de Visitas & Estacionamientos
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
                <th className="p-3">Hora Ingreso</th>
                <th className="p-3">Nombre Visita</th>
                <th className="p-3">RUT Visita</th>
                <th className="p-3">Patente Vehículo</th>
                <th className="p-3">Unidad a Visitar</th>
                <th className="p-3">Estacionamiento</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {visitors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80">
                  <td className="p-3 text-slate-600 font-semibold">{v.entryTime}</td>
                  <td className="p-3 font-bold text-slate-900">{v.visitorName}</td>
                  <td className="p-3 text-slate-500">{v.visitorRut}</td>
                  <td className="p-3 font-mono font-bold text-slate-900 uppercase">{v.vehiclePlate}</td>
                  <td className="p-3 font-bold text-slate-800">{v.destinationUnitNumber}</td>
                  <td className="p-3 text-slate-600 font-semibold">{v.parkingSpot}</td>
                  <td className="p-3 text-center">
                    {v.status === 'activo' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold border border-amber-200">
                        ● Dentro del Condominio
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-medium">
                        Retirado
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {v.status === 'activo' && (
                      <button
                        onClick={() => handleMarkVisitorDeparture(v.id)}
                        className="bg-slate-800 hover:bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs"
                      >
                        Marcar Salida
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Reservation */}
      {showAddReservationModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateReservation} className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">Reservar Espacio Común</h3>
              <button type="button" onClick={() => setShowAddReservationModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Espacio Común</label>
                <select
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="Quincho Principal">Quincho Principal ($25.000)</option>
                  <option value="Salón de Eventos">Salón de Eventos ($45.000)</option>
                  <option value="Multicancha">Multicancha ($10.000)</option>
                  <option value="Gimnasio">Gimnasio ($5.000)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Unidad Responsable</label>
                <select
                  value={resUnitId}
                  onChange={(e) => setResUnitId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  {INITIAL_UNITS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.number} - {u.ownerName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha Reserva</label>
                  <input
                    type="date"
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bloque Horario</label>
                  <input
                    type="text"
                    placeholder="14:00 - 20:00"
                    value={resTimeSlot}
                    onChange={(e) => setResTimeSlot(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddReservationModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FACC15] text-slate-950 font-bold rounded-xl text-xs hover:bg-[#EAB308]"
              >
                Guardar Reserva
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Add Visitor */}
      {showAddVisitorModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateVisitor} className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">Registrar Ingreso de Visita / Vehículo</h3>
              <button type="button" onClick={() => setShowAddVisitorModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Completo Visita</label>
                <input
                  type="text"
                  placeholder="ej. Rodrigo Henríquez"
                  value={visName}
                  onChange={(e) => setVisName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">RUT Visita</label>
                  <input
                    type="text"
                    placeholder="15.112.334-5"
                    value={visRut}
                    onChange={(e) => setVisRut(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patente Vehículo</label>
                  <input
                    type="text"
                    placeholder="KJ-88-21"
                    value={visPlate}
                    onChange={(e) => setVisPlate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl font-mono uppercase font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Unidad a Visitar</label>
                <select
                  value={visUnitNumber}
                  onChange={(e) => setVisUnitNumber(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  {INITIAL_UNITS.map((u) => (
                    <option key={u.id} value={u.number}>
                      {u.number} - {u.ownerName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddVisitorModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-xl text-xs hover:bg-cyan-700"
              >
                Registrar Ingreso
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
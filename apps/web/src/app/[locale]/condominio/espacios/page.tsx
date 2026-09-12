'use client';

import { useState, useEffect } from 'react';
import {
 CalendarDays, Plus, Clock, Car, ShieldCheck, CheckCircle2,
 Users, DollarSign, Sparkles, Building, AlertTriangle, Trash2, MapPin
} from 'lucide-react';
import { formatCLP } from '@/lib/condominio-client';
import { useAuthToken } from '@/hooks/use-auth-token';
import VisitorParkingLayout from './components/visitor-parking-layout';

interface CommonArea {
 id: string;
 name: string;
 description: string;
 capacity: number;
 hourly_rate_clp: number;
 deposit_clp: number;
}

interface Reservation {
 id: string;
 space_name: string;
 unit_number: string;
 reserver_name: string;
 reservation_date: string;
 time_slot: string;
 fee_clp: number;
 deposit_clp: number;
 status: string;
}

interface VisitorEntry {
 id: string;
 visitor_name: string;
 visitor_rut: string;
 vehicle_plate: string;
 destination_unit_number: string;
 entry_time: string;
 parking_spot: string;
 status: string;
 exit_time: string | null;
}

interface CondoUnit {
 id: string;
 number: string;
 ownerName: string;
}

export default function EspaciosConsergeriaPage() {
 const session = useAuthToken();
 const companyId = session?.company_id;

 const [properties, setProperties] = useState<any[]>([]);
 const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
 const [activeTab, setActiveTab] = useState<'parking_map' | 'reservations' | 'consergeria_log'>('parking_map');
 const [reservations, setReservations] = useState<Reservation[]>([]);
 const [visitors, setVisitors] = useState<VisitorEntry[]>([]);
 const [commonAreas, setCommonAreas] = useState<CommonArea[]>([]);
 const [units, setUnits] = useState<CondoUnit[]>([]);
 const [loading, setLoading] = useState(true);

 // Modals
 const [showAddReservationModal, setShowAddReservationModal] = useState(false);
 const [showAddVisitorModal, setShowAddVisitorModal] = useState(false);

 // New Reservation Form State
 const [selectedAreaId, setSelectedAreaId] = useState('');
 const [resUnitId, setResUnitId] = useState('');
 const [resDate, setResDate] = useState(new Date().toISOString().substring(0, 10));
 const [resTimeSlot, setResTimeSlot] = useState('14:00 - 20:00');

 // New Visitor Form State
 const [visName, setVisName] = useState('');
 const [visRut, setVisRut] = useState('');
 const [visPlate, setVisPlate] = useState('');
 const [visUnitNumber, setVisUnitNumber] = useState('');
 const [visSpot, setVisSpot] = useState('');

 useEffect(() => {
   if (!companyId) return;
   fetch(`/api/companies/${companyId}/condos`)
     .then(r => r.json())
     .then(json => {
       if (json.success && json.data) {
         setProperties(json.data.properties || json.data || []);
       }
     })
     .catch(() => {});
 }, [companyId]);

 useEffect(() => {
   if (properties.length > 0 && !selectedPropertyId) {
     setSelectedPropertyId(properties[0].id);
   }
 }, [properties, selectedPropertyId]);

 const fetchData = async () => {
    if (!companyId || !selectedPropertyId) return;
    try {
      setLoading(true);
      const base = `/api/companies/${companyId}/condos/${selectedPropertyId}`;
      const [areasRes, reservationsRes, visitorsRes] = await Promise.all([
        fetch(`${base}/common-areas`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${base}/reservations`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${base}/visitors`).then(r => r.json()).catch(() => ({ data: [] })),
      ]);

      const unitsRes = await fetch(`${base}/units`).then(r => r.json()).catch(() => ({ data: [] }));
      if (unitsRes.data) {
        setUnits(unitsRes.data.map((u: any) => ({
          id: u.id,
          number: u.number,
          ownerName: u.ownerName || u.resident_name || 'Sin Asignar',
        })));
      }
      setCommonAreas(areasRes.data || []);
      setReservations(reservationsRes.data || []);
      setVisitors(visitorsRes.data || []);
    } catch (err) {
      console.error('Error fetching espacios data:', err);
    } finally {
      setLoading(false);
    }
 };

 useEffect(() => { fetchData(); }, [selectedPropertyId]);

 useEffect(() => {
   if (units.length > 0 && !resUnitId) setResUnitId(units[0].id);
   if (units.length > 0 && !visUnitNumber) setVisUnitNumber(units[0].number);
 }, [units]);

 useEffect(() => {
   if (commonAreas.length > 0 && !selectedAreaId) setSelectedAreaId(commonAreas[0].id);
 }, [commonAreas]);

 const handleCreateReservation = async (e: React.FormEvent) => {
   e.preventDefault();
   const area = commonAreas.find(a => a.id === selectedAreaId);
   if (!area || !companyId || !selectedPropertyId) return;

   try {
     const res = await fetch(`/api/companies/${companyId}/condos/${selectedPropertyId}/reservations`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         common_area_id: selectedAreaId,
         unit_id: resUnitId,
         reservation_date: resDate,
         time_slot: resTimeSlot,
         fee_clp: area.hourly_rate_clp,
         deposit_clp: area.deposit_clp,
       }),
     });
     const json = await res.json();
     if (json.success) {
       setReservations([json.data, ...reservations]);
       setShowAddReservationModal(false);
     }
   } catch (err) {
     console.error('Error creating reservation:', err);
   }
 };

 const handleCreateVisitor = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!visName || !companyId || !selectedPropertyId) return;

   try {
     const res = await fetch(`/api/companies/${companyId}/condos/${selectedPropertyId}/visitors`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         visitor_name: visName,
         visitor_rut: visRut || null,
         vehicle_plate: visPlate || null,
         destination_unit_number: visUnitNumber,
         parking_spot: visSpot || null,
       }),
     });
     const json = await res.json();
     if (json.success) {
       setVisitors([json.data, ...visitors]);
       setShowAddVisitorModal(false);
       setVisName('');
       setVisRut('');
       setVisPlate('');
       setVisSpot('');
     }
   } catch (err) {
     console.error('Error creating visitor:', err);
   }
 };

 const handleMarkVisitorDeparture = async (visId: string) => {
   if (!companyId || !selectedPropertyId) return;
   try {
     const res = await fetch(`/api/companies/${companyId}/condos/${selectedPropertyId}/visitors`, {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ id: visId }),
     });
     const json = await res.json();
     if (json.success) {
       setVisitors(visitors.map(v => v.id === visId ? { ...v, status: 'exited', exit_time: json.data.exit_time } : v));
     }
   } catch (err) {
     console.error('Error marking departure:', err);
   }
 };

 const activeVisitorsCount = visitors.filter(v => v.status === 'active').length;

 if (loading) {
   return (
     <div className="flex items-center justify-center h-64">
       <div className="text-slate-500 text-sm font-medium">Cargando espacios...</div>
     </div>
   );
 }

 return (
 <div className="space-y-6">
 {/* Property Selector */}
 <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs flex items-center gap-4">
   <label className="text-xs font-bold text-slate-600">Propiedad:</label>
   <select
     value={selectedPropertyId}
     onChange={(e) => setSelectedPropertyId(e.target.value)}
     className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
   >
     {properties.map((p: any) => (
       <option key={p.id} value={p.id}>{p.name || p.address || `Propiedad ${p.id}`}</option>
     ))}
     {properties.length === 0 && <option value="">Cargando propiedades...</option>}
   </select>
 </div>

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
 className="bg-monday-violet hover:bg-monday-violet-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 shadow-xs flex items-center gap-2 active:scale-[0.98]"
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
 <p className="text-[11px] text-slate-500 mt-1 font-medium">Espacios reservados</p>
 </div>

 <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
 <span className="text-slate-500 text-xs font-semibold">Estacionamientos Visitas En Uso</span>
 <p className="text-2xl font-black text-cyan-600 mt-2">{activeVisitorsCount} de 10</p>
 <p className="text-[11px] text-slate-500 mt-1 font-medium">Vehículos registrados en conserjería</p>
 </div>

 <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
 <span className="text-slate-500 text-xs font-semibold">Recaudación por Arriendo Espacios</span>
 <p className="text-2xl font-black text-emerald-600 mt-2">
 {formatCLP(reservations.reduce((acc, r) => acc + (r.fee_clp || 0), 0))}
 </p>
 <p className="text-[11px] text-slate-500 mt-1 font-medium">Ingresos adicionales condominio</p>
 </div>
 </div>

 {/* Module Navigation Tabs */}
 <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
 <button
 onClick={() => setActiveTab('parking_map')}
 className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
 activeTab === 'parking_map'
 ? 'bg-cloud text-white shadow-xs'
 : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
 }`}
 >
 <Car className="w-4 h-4 text-cyan-400" />
 Layout Estacionamientos Visita
 </button>

 <button
 onClick={() => setActiveTab('reservations')}
 className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
 activeTab === 'reservations'
 ? 'bg-cloud text-white shadow-xs'
 : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
 }`}
 >
 <CalendarDays className="w-4 h-4 text-cyan-400" />
 Reservas Espacios Comunes
 </button>

 <button
 onClick={() => setActiveTab('consergeria_log')}
 className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
 activeTab === 'consergeria_log'
 ? 'bg-cloud text-white shadow-xs'
 : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
 }`}
 >
 <ShieldCheck className="w-4 h-4 text-cyan-400" />
 Bitácora Conserjería ({activeVisitorsCount} activos)
 </button>
 </div>

 {/* Tab Content 1: Visual Visitor Parking Layout */}
 {activeTab === 'parking_map' && (
 <VisitorParkingLayout />
 )}

 {/* Tab Content 2: Reservations */}
 {activeTab === 'reservations' && (
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
 <CalendarDays className="w-4 h-4 text-cyan-600" />
 Reservas de Espacios Comunes
 </h2>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
 <th className="p-3">Espacio</th>
 <th className="p-3">Unidad</th>
 <th className="p-3">Copropietario</th>
 <th className="p-3">Fecha & Horario</th>
 <th className="p-3 text-right">Tarifa</th>
 <th className="p-3 text-center">Estado</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 font-medium">
 {reservations.map((r) => (
 <tr key={r.id} className="hover:bg-slate-50/80">
 <td className="p-3 font-bold text-slate-900">
 <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-50 text-cyan-800 border border-cyan-200">
 {r.space_name}
 </span>
 </td>
 <td className="p-3 font-black text-slate-900">{r.unit_number}</td>
 <td className="p-3 text-slate-800">{r.reserver_name}</td>
 <td className="p-3 text-slate-600 font-semibold">{r.reservation_date} ({r.time_slot})</td>
 <td className="p-3 text-right font-black text-slate-900">{formatCLP(r.fee_clp)}</td>
 <td className="p-3 text-center">
 <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
 {r.status === 'confirmed' ? '✓ confirmada' : r.status}
 </span>
 </td>
 </tr>
 ))}
 {reservations.length === 0 && (
 <tr><td colSpan={6} className="p-6 text-center text-slate-400">No hay reservas registradas</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Tab Content 3: Conserjería Log */}
 {activeTab === 'consergeria_log' && (
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
 <td className="p-3 text-slate-600 font-semibold">{v.entry_time ? new Date(v.entry_time).toLocaleString('es-CL') : '-'}</td>
 <td className="p-3 font-bold text-slate-900">{v.visitor_name}</td>
 <td className="p-3 text-slate-500">{v.visitor_rut || '-'}</td>
 <td className="p-3 font-mono font-bold text-slate-900 uppercase">{v.vehicle_plate || '-'}</td>
 <td className="p-3 font-bold text-slate-800">{v.destination_unit_number || '-'}</td>
 <td className="p-3 text-slate-600 font-semibold">{v.parking_spot || '-'}</td>
 <td className="p-3 text-center">
 {v.status === 'active' ? (
 <span className="px-2 py-0.5 rounded-full text-[10px] bg-peach/50 text-[#c64d00] font-bold border border-peach">
 ● Dentro del Condominio
 </span>
 ) : (
 <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-medium">
 Retirado
 </span>
 )}
 </td>
 <td className="p-3 text-center">
 {v.status === 'active' && (
 <button
 onClick={() => handleMarkVisitorDeparture(v.id)}
 className="bg-cloud hover:bg-slate-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs transition-colors"
 >
 Marcar Salida
 </button>
 )}
 </td>
 </tr>
 ))}
 {visitors.length === 0 && (
 <tr><td colSpan={8} className="p-6 text-center text-slate-400">No hay visitas registradas</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Modal Add Reservation */}
 {showAddReservationModal && (
 <div className="fixed inset-0 bg-cloud/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
 <form onSubmit={handleCreateReservation} className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
 <div className="flex items-center justify-between border-b pb-3">
 <h3 className="text-base font-black text-slate-900">Reservar Espacio Común</h3>
 <button type="button" onClick={() => setShowAddReservationModal(false)} className="text-slate-400 font-bold">✕</button>
 </div>

 <div className="space-y-3 text-xs">
 <div>
 <label className="block font-bold text-slate-700 mb-1">Espacio Común</label>
 <select
 value={selectedAreaId}
 onChange={(e) => setSelectedAreaId(e.target.value)}
 className="w-full p-2 border border-slate-200 rounded-xl font-bold text-slate-900"
 >
 {commonAreas.map(area => (
 <option key={area.id} value={area.id}>
 {area.name} ({formatCLP(area.hourly_rate_clp)})
 </option>
 ))}
 {commonAreas.length === 0 && <option value="">No hay espacios configurados</option>}
 </select>
 </div>

 <div>
 <label className="block font-bold text-slate-700 mb-1">Unidad Responsable</label>
 <select
 value={resUnitId}
 onChange={(e) => setResUnitId(e.target.value)}
 className="w-full p-2 border border-slate-200 rounded-xl font-bold text-slate-900"
 >
 {units.map((u) => (
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
 className="px-4 py-2 bg-monday-violet text-white font-bold rounded-xl text-xs hover:bg-monday-violet-hover"
 >
 Guardar Reserva
 </button>
 </div>
 </form>
 </div>
 )}

 {/* Modal Add Visitor */}
 {showAddVisitorModal && (
 <div className="fixed inset-0 bg-cloud/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
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
 {units.map((u) => (
 <option key={u.id} value={u.number}>
 {u.number} - {u.ownerName}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block font-bold text-slate-700 mb-1">Estacionamiento</label>
 <input
 type="text"
 placeholder="Visita V-01"
 value={visSpot}
 onChange={(e) => setVisSpot(e.target.value)}
 className="w-full p-2 border border-slate-200 rounded-xl font-medium"
 />
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

'use client';

import React, { useState, useEffect } from 'react';
import { Dog, Cat, Calendar, Pill, Stethoscope, Clock, AlertCircle, Building2, Phone, Mail, Loader2, Heart, Activity } from 'lucide-react';

interface PortalData {
 patient: {
 name: string; species: string; breed: string; gender: string;
 birthDate: string; weightKg: number; microchip: string; color: string;
 allergies: string; notes: string;
 };
 client: { name: string; phone: string; email: string; };
 clinic: { name: string; };
 consultations: any[];
 prescriptions: any[];
 appointments: any[];
 hospitalizations: any[];
 reminders: any[];
}

export default function VetPortalPage({ params }: { params: { token: string } }) {
 const [data, setData] = useState<PortalData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 fetch(`/api/portal/vet/${params.token}`)
 .then(async (res) => {
 if (!res.ok) throw new Error('Token inválido o expirado');
 const json = await res.json();
 setData(json.data || json);
 })
 .catch((err) => setError(err.message))
 .finally(() => setLoading(false));
 }, [params.token]);

 if (loading) {
 return (
 <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
 <div className="text-center">
 <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
 <p className="text-sm text-slate-500 font-bold">Cargando información...</p>
 </div>
 </div>
 );
 }

 if (error || !data) {
 return (
 <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
 <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
 <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
 <h1 className="text-lg font-bold text-slate-900 mb-2">Acceso no disponible</h1>
 <p className="text-sm text-slate-500">{error || 'Este enlace no es válido o ha expirado.'}</p>
 </div>
 </div>
 );
 }

 const { patient, client, clinic, consultations, prescriptions, appointments, hospitalizations, reminders } = data;

 return (
 <div className="min-h-screen bg-[#F8FAFC]">
 <header className="bg-white border-b border-slate-200/80 sticky top-0 z-10">
 <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-monday-violet text-[#FACC15] flex items-center justify-center font-bold text-sm">
 {patient.species === 'perro' ? <Dog className="w-5 h-5" /> : <Cat className="w-5 h-5" />}
 </div>
 <div>
 <h1 className="text-base font-black text-slate-900">{patient.name}</h1>
 <p className="text-[11px] text-slate-500">{patient.breed} • {patient.species}</p>
 </div>
 </div>
 <div className="text-right">
 <div className="text-[11px] font-bold text-slate-600">{clinic.name}</div>
 <div className="text-[10px] text-slate-400">Portal del Tutor</div>
 </div>
 </div>
 </header>

 <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <div className="bg-white border border-slate-200/80 rounded-2xl p-3 text-center">
 <Heart className="w-5 h-5 text-rose-500 mx-auto mb-1" />
 <div className="text-[11px] text-slate-500">Peso</div>
 <div className="text-sm font-black text-slate-900">{patient.weightKg} kg</div>
 </div>
 <div className="bg-white border border-slate-200/80 rounded-2xl p-3 text-center">
 <Activity className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
 <div className="text-[11px] text-slate-500">Sexo</div>
 <div className="text-sm font-black text-slate-900 capitalize">{patient.gender}</div>
 </div>
 <div className="bg-white border border-slate-200/80 rounded-2xl p-3 text-center">
 <Dog className="w-5 h-5 text-amber-500 mx-auto mb-1" />
 <div className="text-[11px] text-slate-500">Color</div>
 <div className="text-sm font-black text-slate-900">{patient.color || '—'}</div>
 </div>
 <div className="bg-white border border-slate-200/80 rounded-2xl p-3 text-center">
 <Building2 className="w-5 h-5 text-blue-500 mx-auto mb-1" />
 <div className="text-[11px] text-slate-500">Microchip</div>
 <div className="text-xs font-mono font-bold text-slate-900">{patient.microchip || '—'}</div>
 </div>
 </div>

 {patient.allergies && (
 <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
 <p className="text-xs font-bold text-amber-800 uppercase mb-1">⚠ Alergias conocidas</p>
 <p className="text-sm text-amber-900">{patient.allergies}</p>
 </div>
 )}

 {appointments.length > 0 && (
 <section className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
 <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/80">
 <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> Próximas Citas</h2>
 </div>
 <div className="divide-y divide-slate-100">
 {appointments.map((a: any) => (
 <div key={a.id} className="px-5 py-3 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold text-slate-900">{a.service_name}</p>
 <p className="text-[11px] text-slate-500">Dr(a). {a.professional_name}</p>
 </div>
 <div className="text-right">
 <p className="text-xs font-bold text-slate-900">{new Date(a.appointment_date).toLocaleDateString('es-CL')}</p>
 <p className="text-[11px] text-slate-500">{a.appointment_time}</p>
 </div>
 </div>
 ))}
 </div>
 </section>
 )}

 {consultations.length > 0 && (
 <section className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
 <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/80">
 <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Stethoscope className="w-4 h-4 text-blue-500" /> Últimas Consultas</h2>
 </div>
 <div className="divide-y divide-slate-100">
 {consultations.map((c: any) => (
 <div key={c.id} className="px-5 py-3">
 <div className="flex items-center justify-between mb-1">
 <p className="text-xs font-bold text-slate-900">{c.chief_complaint}</p>
 <p className="text-[11px] text-slate-500">{new Date(c.consultation_date).toLocaleDateString('es-CL')}</p>
 </div>
 {c.diagnosis && <p className="text-[11px] text-slate-600"><strong>Diagnóstico:</strong> {c.diagnosis}</p>}
 {c.treatment_plan && <p className="text-[11px] text-slate-600"><strong>Tratamiento:</strong> {c.treatment_plan}</p>}
 </div>
 ))}
 </div>
 </section>
 )}

 {prescriptions.length > 0 && (
 <section className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
 <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/80">
 <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Pill className="w-4 h-4 text-purple-500" /> Recetas Activas</h2>
 </div>
 <div className="divide-y divide-slate-100">
 {prescriptions.map((r: any) => (
 <div key={r.id} className="px-5 py-3">
 <p className="text-[11px] text-slate-500 mb-1">{new Date(r.prescription_date).toLocaleDateString('es-CL')}</p>
 {r.items?.map((item: any, idx: number) => (
 <p key={idx} className="text-xs text-slate-800">
 <strong>{item.medication_name}</strong> — {item.dosage}, {item.frequency} por {item.duration_days} días
 </p>
 ))}
 </div>
 ))}
 </div>
 </section>
 )}

 {hospitalizations.length > 0 && (
 <section className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
 <div className="px-5 py-3 border-b border-amber-200">
 <h2 className="text-sm font-bold text-amber-900 flex items-center gap-2">🏥 Hospitalización Activa</h2>
 </div>
 <div className="p-5">
 {hospitalizations.map((h: any) => (
 <div key={h.id}>
 <p className="text-xs font-bold text-amber-900">{h.reason}</p>
 <p className="text-[11px] text-amber-800">Ingreso: {new Date(h.admission_date).toLocaleDateString('es-CL')}</p>
 {h.notes && <p className="text-[11px] text-amber-800 mt-1">{h.notes}</p>}
 </div>
 ))}
 </div>
 </section>
 )}

 {reminders.length > 0 && (
 <section className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
 <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/80">
 <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> Recordatorios Pendientes</h2>
 </div>
 <div className="divide-y divide-slate-100">
 {reminders.map((r: any) => (
 <div key={r.id} className="px-5 py-3">
 <p className="text-xs font-bold text-slate-900">{r.reminder_type} — {new Date(r.reminder_date).toLocaleDateString('es-CL')}</p>
 <p className="text-[11px] text-slate-600">{r.message}</p>
 </div>
 ))}
 </div>
 </section>
 )}

 <footer className="text-center py-6 text-[11px] text-slate-400">
 {clinic.name} • Portal del Tutor • {new Date().getFullYear()}
 </footer>
 </main>
 </div>
 );
}

'use client';

import React, { useState, useEffect } from 'react';
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
 FlaskConical,
 TestTube,
 Loader2,
} from 'lucide-react';
import PatientRecordPDF from '@/app/veterinaria/pacientes/[id]/components/patient-record-pdf';
import { getApiClient } from '@/lib/api-client';
import { useConsultations } from '@/app/veterinaria/hooks/use-consultations';
import { useVaccinations } from '@/app/veterinaria/hooks/use-vaccinations';
import { useEvolutions } from '@/app/veterinaria/hooks/use-evolutions';
import { useDewormings } from '@/app/veterinaria/hooks/use-dewormings';
import { useLabOrders } from '@/app/veterinaria/hooks/use-lab';

export default function VeterinaryPatientDetailPage() {
 const params = useParams();
 const patientId = params.id as string;

 const [patient, setPatient] = useState<any>(null);
 const [loadingPatient, setLoadingPatient] = useState(true);
 const [patientError, setPatientError] = useState<string | null>(null);

 const { data: consultationsData, loading: loadingConsultations } = useConsultations(
 patientId ? { patient_id: patientId } : undefined,
 !!patientId
 );
 const { data: vaccinationsData, loading: loadingVaccinations } = useVaccinations(
 patientId ? { patient_id: patientId } : undefined,
 !!patientId
 );
 const { data: evolutionsData, loading: loadingEvolutions } = useEvolutions(
 patientId ? { patient_id: patientId } : undefined,
 !!patientId
 );
 const { data: dewormingsData, loading: loadingDewormings } = useDewormings(
 patientId ? { patient_id: patientId } : undefined,
 !!patientId
 );
 const { data: labOrdersData, loading: loadingLabOrders } = useLabOrders(
 patientId ? { patient_id: patientId } : undefined,
 !!patientId
 );

 const [activeTab, setActiveTab] = useState<'resumen' | 'consultas' | 'evoluciones' | 'vacunas' | 'desparasitaciones' | 'laboratorio' | 'recetas' | 'peso'>('resumen');

 useEffect(() => {
 if (!patientId) return;
 setLoadingPatient(true);
 getApiClient()
 .getVetPatient(patientId)
 .then((p) => setPatient(p))
 .catch((e) => setPatientError(e.message))
 .finally(() => setLoadingPatient(false));
 }, [patientId]);

 const client = patient
 ? {
 fullName: patient.client_name,
 rut: patient.client_rut,
 phone: patient.client_phone,
 email: patient.client_email,
 address: patient.client_address,
 commune: patient.client_commune,
 }
 : null;

 if (loadingPatient) {
 return (
 <div className="space-y-6">
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="flex items-start gap-4">
 <div className="w-16 h-16 rounded-2xl bg-slate-200 animate-pulse shrink-0" />
 <div className="space-y-3">
 <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
 <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
 </div>
 </div>
 <div className="flex gap-3">
 <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse" />
 <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse" />
 </div>
 </div>
 <div className="flex gap-2">
 {[...Array(5)].map((_, i) => (
 <div key={i} className="h-10 w-24 bg-slate-200 rounded-xl animate-pulse" />
 ))}
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2 space-y-4">
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
 <div className="space-y-3">
 <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
 <div className="grid grid-cols-2 gap-3">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
 ))}
 </div>
 </div>
 </div>
 </div>
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
 <div className="space-y-3">
 <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
 {[...Array(4)].map((_, i) => (
 <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
 ))}
 </div>
 </div>
 </div>
 </div>
 );
 }

 if (patientError || !patient) {
 return (
 <div className="space-y-6">
 <div className="bg-white border border-slate-200/80 rounded-2xl p-10 shadow-sm flex flex-col items-center justify-center text-center">
 <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-2xl font-bold shadow-sm mb-4">
 <AlertTriangle className="w-9 h-9" />
 </div>
 <h1 className="text-xl font-black text-slate-900">Paciente no encontrado</h1>
 <p className="text-sm text-slate-500 mt-1 max-w-md">
 No existe un paciente registrado con este identificador. Registre un nuevo paciente para ver su ficha clínica completa.
 </p>
 <Link
 href="/veterinaria/pacientes"
 className="mt-5 bg-monday-violet hover:bg-monday-violet-hover text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm"
 >
 Volver a Pacientes
 </Link>
 </div>
 </div>
 );
 }

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
 <span className="bg-cloud text-white text-xs font-bold px-2.5 py-0.5 rounded-md capitalize">
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
 client={client}
 consultations={consultationsData}
 vaccinations={vaccinationsData}
 dewormings={dewormingsData}
 />
 <Link
 href="/veterinaria/consultas"
 className="bg-monday-violet hover:bg-monday-violet-hover text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
 >
 <Stethoscope className="w-4 h-4" />
 Iniciar Consulta
 </Link>
 <Link
 href="/veterinaria/agenda"
 className="bg-monday-violet hover:bg-cloud text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2"
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
 { id: 'consultas', label: `Consultas (${consultationsData.length})`, icon: Stethoscope },
 { id: 'evoluciones', label: `Evoluciones SOAP (${evolutionsData.length})`, icon: FileText },
 { id: 'vacunas', label: `Vacunación (${vaccinationsData.length})`, icon: Syringe },
 { id: 'desparasitacion', label: `Desparasitaciones (${dewormingsData.length})`, icon: Shield },
 { id: 'laboratorio', label: `Laboratorio (${labOrdersData.length})`, icon: FlaskConical },
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
 ? 'bg-monday-violet text-white shadow-xs'
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
 <div className="bg-peach/30 border border-peach rounded-xl p-4">
 <span className="text-xs font-extrabold text-[#c64d00] uppercase tracking-wider block mb-1">
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

 {consultationsData.length > 0 ? (
 <div className="p-6 space-y-3">
 {consultationsData.map((c: any) => (
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
 className="bg-monday-violet text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-cloud transition-all"
 >
 + Nueva Consulta
 </Link>
 </div>

 <div className="space-y-4">
 {consultationsData.map((c: any) => (
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

 {activeTab === 'evoluciones' && (
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <h3 className="text-base font-bold text-slate-900">Evolución Clínica & Notas SOAP</h3>
 <Link
 href="/veterinaria/evoluciones"
 className="bg-monday-violet text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-cloud transition-all"
 >
 + Nueva Nota SOAP
 </Link>
 </div>

 {evolutionsData.length > 0 ? (
 <div className="space-y-4">
 {evolutionsData
 .slice()
 .sort((a: any, b: any) => (a.evolutionDate + a.evolutionTime > b.evolutionDate + b.evolutionTime ? -1 : 1))
 .map((evo: any) => (
 <div key={evo.id} className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50">
 <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-slate-900">{evo.evolutionDate} · {evo.evolutionTime}</span>
 <span className="bg-monday-violet text-white text-[10px] font-black px-2 py-0.5 rounded capitalize">
 {evo.type.replace('_', ' ')}
 </span>
 </div>
 <span className="text-xs text-slate-500">Atendido por {evo.professionalName}</span>
 </div>

 {evo.diagnosis && (
 <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-xs font-bold text-emerald-700">
 Diagnóstico: {evo.diagnosis}
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
 <SoapMini label="Subjetivo" color="border-blue-200 bg-blue-50" letter="S" text={evo.soap.subjective} />
 <SoapMini label="Objetivo" color="border-emerald-200 bg-emerald-50" letter="O" text={evo.soap.objective} />
 <SoapMini label="Evaluación" color="border-peach bg-peach/30" letter="A" text={evo.soap.assessment} />
 <SoapMini label="Plan" color="border-rose-200 bg-rose-50" letter="P" text={evo.soap.plan} />
 </div>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-xs text-slate-500">Sin evoluciones clínicas registradas para este paciente.</p>
 )}
 </div>
 )}

 {/* Lab Tab */}
 {activeTab === 'laboratorio' && (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
 <FlaskConical className="w-4 h-4 text-emerald-600" />
 Órdenes de Laboratorio ({labOrdersData.length})
 </h3>
 <Link
 href="/veterinaria/laboratorio"
 className="bg-monday-violet hover:bg-monday-violet-hover text-white font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shadow-sm"
 >
 <Plus className="w-3 h-3" /> Nueva Orden
 </Link>
 </div>
 {labOrdersData.length > 0 ? (
 <div className="space-y-3">
 {labOrdersData.map((lo: any) => (
 <div key={lo.id} className="bg-white border border-slate-200/80 rounded-2xl px-5 py-4 shadow-sm">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="font-mono font-bold text-xs text-slate-900">{lo.orderNumber}</span>
 <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${
 lo.status === 'resultados_listos' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
 : lo.status === 'ordenada' ? 'bg-blue-50 text-blue-700 border-blue-200'
 : lo.status === 'en_proceso' ? 'bg-peach/30 text-[#c64d00] border-peach'
 : 'bg-slate-100 text-slate-600 border-slate-200'
 }`}>
 {lo.status === 'resultados_listos' ? 'Resultados Listos' : lo.status === 'ordenada' ? 'Ordenada' : lo.status === 'en_proceso' ? 'En Proceso' : lo.status}
 </span>
 </div>
 <div className="text-xs font-bold text-slate-700">{lo.panelName}</div>
 <div className="text-[11px] text-slate-500">Muestra: {lo.sampleType} · Profesional: {lo.professionalName}</div>
 <div className="text-[10px] text-slate-400">Fecha orden: {lo.orderedDate}</div>
 </div>
 {lo.results && lo.results.length > 0 && (
 <div className="flex flex-wrap gap-1.5">
 {lo.results.filter((r: any) => r.flag !== 'normal').map((r: any) => (
 <span key={r.id} className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${
 r.flag === 'alto' ? 'bg-peach/30 text-[#c64d00] border-peach'
 : r.flag === 'bajo' ? 'bg-blue-50 text-blue-700 border-blue-200'
 : 'bg-rose-50 text-rose-700 border-rose-200'
 }`}>
 {r.testName}: {r.value} {r.flag === 'alto' ? '↑' : r.flag === 'bajo' ? '↓' : '!!'}
 </span>
 ))}
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-10 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
 <FlaskConical className="w-10 h-10 text-iron mx-auto mb-2" />
 <p className="text-xs text-slate-500">Sin órdenes de laboratorio registradas para este paciente.</p>
 </div>
 )}
 </div>
 )}
 </div>
 );
}

function SoapMini({ label, color, letter, text }: { label: string; color: string; letter: string; text: string }) {
 return (
 <div className={`border rounded-lg p-2.5 ${color} space-y-1`}>
 <div className="flex items-center gap-1.5">
 <span className="text-white text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-700">{letter}</span>
 <span className="text-[10px] font-extrabold text-slate-700 uppercase">{label}</span>
 </div>
 <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
 {text || <span className="text-slate-400 italic">Sin registro</span>}
 </p>
 </div>
 );
}
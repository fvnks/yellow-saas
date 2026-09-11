'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
 Camera,
 CreditCard,
 X,
 Eraser,
} from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { useConsultations } from '../../hooks/use-consultations';
import { useVaccinations } from '../../hooks/use-vaccinations';
import { useEvolutions } from '../../hooks/use-evolutions';
import { useDewormings } from '../../hooks/use-dewormings';
import { useLabOrders } from '../../hooks/use-lab';
import { useSurgeries } from '../../hooks/use-surgeries';
import { useHospitalizations } from '../../hooks/use-hospitalizations';
import { usePrescriptions } from '../../hooks/use-prescriptions';
import { usePayments } from '../../hooks/use-payments';
import { useEstimates } from '../../hooks/use-estimates';

type TabId =
 | 'ficha'
 | 'consultas'
 | 'vacunas'
 | 'cirugias'
 | 'hospitalizacion'
 | 'evoluciones'
 | 'recetas'
 | 'laboratorio'
 | 'imagenologia'
 | 'pagos';

function SignaturePad({ onSave }: { onSave: (dataUrl: string) => void }) {
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const [isDrawing, setIsDrawing] = useState(false);

 const getPos = (e: React.MouseEvent | React.TouchEvent) => {
 const canvas = canvasRef.current;
 if (!canvas) return { x: 0, y: 0 };
 const rect = canvas.getBoundingClientRect();
 if ('touches' in e) {
 return {
 x: e.touches[0].clientX - rect.left,
 y: e.touches[0].clientY - rect.top,
 };
 }
 return { x: e.clientX - rect.left, y: e.clientY - rect.top };
 };

 const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
 const canvas = canvasRef.current;
 if (!canvas) return;
 const ctx = canvas.getContext('2d');
 if (!ctx) return;
 setIsDrawing(true);
 const pos = getPos(e);
 ctx.beginPath();
 ctx.moveTo(pos.x, pos.y);
 };

 const draw = (e: React.MouseEvent | React.TouchEvent) => {
 if (!isDrawing) return;
 const canvas = canvasRef.current;
 if (!canvas) return;
 const ctx = canvas.getContext('2d');
 if (!ctx) return;
 const pos = getPos(e);
 ctx.lineWidth = 2;
 ctx.lineCap = 'round';
 ctx.strokeStyle = '#0F172A';
 ctx.lineTo(pos.x, pos.y);
 ctx.stroke();
 };

 const endDraw = () => {
 setIsDrawing(false);
 const canvas = canvasRef.current;
 if (canvas) {
 onSave(canvas.toDataURL('image/png'));
 }
 };

 const clear = () => {
 const canvas = canvasRef.current;
 if (!canvas) return;
 const ctx = canvas.getContext('2d');
 if (!ctx) return;
 ctx.clearRect(0, 0, canvas.width, canvas.height);
 onSave('');
 };

 return (
 <div className="space-y-2">
 <canvas
 ref={canvasRef}
 width={320}
 height={120}
 className="w-full border border-slate-200 rounded-xl bg-white cursor-crosshair touch-none"
 onMouseDown={startDraw}
 onMouseMove={draw}
 onMouseUp={endDraw}
 onMouseLeave={endDraw}
 onTouchStart={startDraw}
 onTouchMove={draw}
 onTouchEnd={endDraw}
 />
 <button
 type="button"
 onClick={clear}
 className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
 >
 <Eraser className="w-3 h-3" /> Limpiar firma
 </button>
 </div>
 );
}

export default function VeterinaryPatientDetailPage() {
 const params = useParams();
 const patientId = params.id as string;

 const [patient, setPatient] = useState<any>(null);
 const [loadingPatient, setLoadingPatient] = useState(true);
 const [patientError, setPatientError] = useState<string | null>(null);
 const [activeTab, setActiveTab] = useState<TabId>('ficha');
 const [imagingData, setImagingData] = useState<any[]>([]);
 const [loadingImaging, setLoadingImaging] = useState(false);
 const [signatureDataUrl, setSignatureDataUrl] = useState('');

 const patientParams = patientId ? { patient_id: patientId } : undefined;
 const enabled = !!patientId;

 const { data: consultationsData, loading: loadingConsultations } = useConsultations(patientParams, enabled);
 const { data: vaccinationsData, loading: loadingVaccinations } = useVaccinations(patientParams, enabled);
 const { data: evolutionsData, loading: loadingEvolutions } = useEvolutions(patientParams, enabled);
 const { data: dewormingsData, loading: loadingDewormings } = useDewormings(patientParams, enabled);
 const { data: labOrdersData, loading: loadingLabOrders } = useLabOrders(patientParams, enabled);
 const { data: surgeriesData, loading: loadingSurgeries } = useSurgeries(patientParams, enabled);
 const { data: hospitalizationsData, loading: loadingHospitalizations } = useHospitalizations(patientParams, enabled);
 const { data: prescriptionsData, loading: loadingPrescriptions } = usePrescriptions(patientParams, enabled);
 const { data: paymentsData, loading: loadingPayments } = usePayments(patientParams);

 useEffect(() => {
 if (!patientId) return;
 setLoadingPatient(true);
 getApiClient()
 .getVetPatient(patientId)
 .then((p) => setPatient(p))
 .catch((e) => setPatientError(e.message))
 .finally(() => setLoadingPatient(false));
 }, [patientId]);

 useEffect(() => {
 if (activeTab !== 'imagenologia' || !patientId) return;
 setLoadingImaging(true);
 getApiClient()
 .getVetImaging({ patient_id: patientId })
 .then((r: any) => setImagingData(r.data || []))
 .catch(() => setImagingData([]))
 .finally(() => setLoadingImaging(false));
 }, [activeTab, patientId]);

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

 const tabs: { id: TabId; label: string; icon: any; count?: number }[] = [
 { id: 'ficha', label: 'Ficha General', icon: FileText },
 { id: 'consultas', label: 'Consultas', icon: Stethoscope, count: consultationsData.length },
 { id: 'vacunas', label: 'Vacunas', icon: Syringe, count: vaccinationsData.length },
 { id: 'cirugias', label: 'Cirugías', icon: AlertTriangle, count: surgeriesData.length },
 { id: 'hospitalizacion', label: 'Hospitalización', icon: BedDouble, count: hospitalizationsData.length },
 { id: 'evoluciones', label: 'Evoluciones', icon: Activity, count: evolutionsData.length },
 { id: 'recetas', label: 'Recetas', icon: Pill, count: prescriptionsData.length },
 { id: 'laboratorio', label: 'Laboratorio', icon: FlaskConical, count: labOrdersData.length },
 { id: 'imagenologia', label: 'Imagenología', icon: Camera, count: imagingData.length },
 { id: 'pagos', label: 'Pagos', icon: CreditCard, count: paymentsData.length },
 ];

 if (loadingPatient) {
 return (
 <div className="space-y-6">
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
 <div className="flex items-start gap-4">
 <div className="w-16 h-16 rounded-2xl bg-slate-200 animate-pulse shrink-0" />
 <div className="space-y-3 flex-1">
 <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
 <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
 </div>
 </div>
 </div>
 </div>
 );
 }

 if (patientError || !patient) {
 return (
 <div className="bg-white border border-slate-200/80 rounded-2xl p-10 shadow-sm flex flex-col items-center justify-center text-center">
 <AlertTriangle className="w-12 h-12 text-[#c64d00]/70 mb-4" />
 <h1 className="text-xl font-black text-slate-900">Paciente no encontrado</h1>
 <p className="text-sm text-slate-500 mt-1 max-w-md">
 No existe un paciente registrado con este identificador.
 </p>
 <Link
 href="/veterinaria/pacientes"
 className="mt-5 bg-monday-violet hover:bg-monday-violet-hover text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm"
 >
 Volver a Pacientes
 </Link>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Patient Summary Card */}
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
 {client && (
 <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
 <span className="flex items-center gap-1"><User className="w-3 h-3" />{client.fullName}</span>
 {client.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{client.phone}</span>}
 </div>
 )}
 </div>
 </div>
 <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
 <Link
 href="/veterinaria/consultas"
 className="bg-monday-violet hover:bg-monday-violet-hover text-ink font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
 >
 <Stethoscope className="w-4 h-4" />
 Nueva Consulta
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
 </div>

 {/* Tabs Navigation */}
 <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1">
 {tabs.map((tab) => {
 const Icon = tab.icon;
 const isActive = activeTab === tab.id;
 return (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
 isActive
 ? 'bg-monday-violet text-white shadow-xs'
 : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
 }`}
 >
 <Icon className={`w-4 h-4 ${isActive ? 'text-[#FACC15]' : 'text-slate-400'}`} />
 {tab.label}
 {tab.count !== undefined && (
 <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
 {tab.count}
 </span>
 )}
 </button>
 );
 })}
 </div>

 {/* Tab: Ficha General */}
 {activeTab === 'ficha' && (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2 space-y-6">
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
 <Activity className="w-4 h-4 text-emerald-600" />
 Estado de Salud
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="bg-peach/30 border border-peach rounded-xl p-4">
 <span className="text-xs font-extrabold text-[#c64d00] uppercase tracking-wider block mb-1">Alergias</span>
 <p className="text-sm font-bold text-slate-900">{patient.allergies || 'Ninguna registrada'}</p>
 </div>
 <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
 <span className="text-xs font-extrabold text-rose-800 uppercase tracking-wider block mb-1">Condiciones Crónicas</span>
 <p className="text-sm font-bold text-slate-900">{patient.chronicConditions || 'Sin patologías crónicas'}</p>
 </div>
 <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
 <span className="text-xs font-extrabold text-blue-800 uppercase tracking-wider block mb-1">Tratamiento Permanente</span>
 <p className="text-sm font-bold text-slate-900">{patient.permanentMedications || 'Sin medicación continua'}</p>
 </div>
 <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
 <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block mb-1">Dieta</span>
 <p className="text-sm font-bold text-slate-900">{patient.diet || 'Alimento balanceado estándar'}</p>
 </div>
 </div>
 </div>

 {/* Firma Digital */}
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
 <FileText className="w-4 h-4 text-[#FACC15]" />
 Firma Digital del Tutor
 </h3>
 <p className="text-xs text-slate-500">Firme en el recuadro para autorizar procedimientos.</p>
 <SignaturePad onSave={setSignatureDataUrl} />
 {signatureDataUrl && (
 <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
 <CheckCircle2 className="w-3 h-3" /> Firma capturada
 </p>
 )}
 </div>
 </div>

 <div className="space-y-6">
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
 <User className="w-4 h-4 text-slate-700" />
 Tutor Responsable
 </h3>
 {client ? (
 <div className="space-y-3 text-xs">
 <div>
 <span className="text-slate-400 font-medium block">Nombre</span>
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
 <span>{client.address}{client.commune ? `, ${client.commune}` : ''}</span>
 </div>
 </div>
 ) : (
 <p className="text-xs text-slate-400">Sin datos de tutor.</p>
 )}
 </div>
 </div>
 </div>
 )}

 {/* Tab: Consultas */}
 {activeTab === 'consultas' && (
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <h3 className="text-base font-bold text-slate-900">Historial de Consultas</h3>
 <Link href="/veterinaria/consultas" className="bg-monday-violet text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-cloud transition-all">
 + Nueva Consulta
 </Link>
 </div>
 {loadingConsultations ? (
 <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
 ) : consultationsData.length > 0 ? (
 <div className="space-y-4">
 {consultationsData.map((c: any) => (
 <div key={c.id} className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50">
 <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
 <div>
 <span className="text-xs font-bold text-slate-900">{c.consultationDate}</span>
 <span className="text-xs text-slate-500 ml-2">Dr(a). {c.professionalName}</span>
 </div>
 <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">Finalizada</span>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200">
 <div>Peso: <strong>{c.weightKg} kg</strong></div>
 <div>Temp: <strong>{c.temperatureC} °C</strong></div>
 <div>FC: <strong>{c.heartRateBpm} bpm</strong></div>
 <div>FR: <strong>{c.respiratoryRateBpm} rpm</strong></div>
 </div>
 <div>
 <h5 className="text-xs font-bold text-slate-700 uppercase">Motivo</h5>
 <p className="text-xs text-slate-800 mt-0.5">{c.reasonForVisit}</p>
 </div>
 {c.primaryDiagnosis && (
 <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-xs font-bold text-emerald-700">
 Dx: {c.primaryDiagnosis}
 </div>
 )}
 </div>
 ))}
 </div>
 ) : (
 <p className="text-xs text-slate-500 text-center py-10">Sin consultas registradas.</p>
 )}
 </div>
 )}

 {/* Tab: Vacunas */}
 {activeTab === 'vacunas' && (
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <h3 className="text-base font-bold text-slate-900">Vacunación</h3>
 <Link href="/veterinaria/vacunas" className="bg-monday-violet text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-cloud transition-all">
 + Nueva Vacuna
 </Link>
 </div>
 {loadingVaccinations ? (
 <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
 ) : vaccinationsData.length > 0 ? (
 <div className="space-y-3">
 {vaccinationsData.map((v: any) => (
 <div key={v.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <span className="text-sm font-bold text-slate-900">{v.vaccineName}</span>
 <span className="text-xs text-slate-500 ml-2">{v.applicationDate}</span>
 {v.batchNumber && <span className="text-xs text-slate-400 ml-2">Lote: {v.batchNumber}</span>}
 {v.professionalName && <span className="text-xs text-slate-500 ml-2">Dr(a). {v.professionalName}</span>}
 </div>
 {v.nextDueDate && (
 <span className="text-xs font-bold text-[#c64d00] bg-peach/30 border border-peach px-2 py-0.5 rounded w-fit">
 Próxima: {v.nextDueDate}
 </span>
 )}
 </div>
 ))}
 </div>
 ) : (
 <p className="text-xs text-slate-500 text-center py-10">Sin vacunas registradas.</p>
 )}
 </div>
 )}

 {/* Tab: Cirugías */}
 {activeTab === 'cirugias' && (
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <h3 className="text-base font-bold text-slate-900">Cirugías</h3>
 <Link href="/veterinaria/cirugias" className="bg-monday-violet text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-cloud transition-all">
 + Nueva Cirugía
 </Link>
 </div>
 {loadingSurgeries ? (
 <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
 ) : surgeriesData.length > 0 ? (
 <div className="space-y-3">
 {surgeriesData.map((s: any) => (
 <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
 <div className="flex flex-wrap items-center justify-between gap-2">
 <span className="text-sm font-bold text-slate-900">{s.surgeryName}</span>
 <span className={`text-xs font-bold px-2 py-0.5 rounded ${
 s.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
 s.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
 'bg-slate-100 text-slate-600'
 }`}>
 {s.status}
 </span>
 </div>
 <div className="text-xs text-slate-500 flex flex-wrap gap-3">
 {s.scheduledDate && <span>Fecha: {s.scheduledDate}</span>}
 {s.surgeonName && <span>Cirujano: {s.surgeonName}</span>}
 {s.roomName && <span>Sala: {s.roomName}</span>}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-xs text-slate-500 text-center py-10">Sin cirugías registradas.</p>
 )}
 </div>
 )}

 {/* Tab: Hospitalización */}
 {activeTab === 'hospitalizacion' && (
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <h3 className="text-base font-bold text-slate-900">Hospitalización</h3>
 <Link href="/veterinaria/hospitalizaciones" className="bg-monday-violet text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-cloud transition-all">
 + Nueva Internación
 </Link>
 </div>
 {loadingHospitalizations ? (
 <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
 ) : hospitalizationsData.length > 0 ? (
 <div className="space-y-3">
 {hospitalizationsData.map((h: any) => (
 <div key={h.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
 <div className="flex flex-wrap items-center justify-between gap-2">
 <span className="text-sm font-bold text-slate-900">
 {h.cageNumber ? `Jaula ${h.cageNumber}` : 'Internación'}
 </span>
 <span className={`text-xs font-bold px-2 py-0.5 rounded ${
 h.status === 'active' ? 'bg-peach/50 text-[#c64d00]' :
 h.status === 'discharged' ? 'bg-emerald-100 text-emerald-700' :
 'bg-slate-100 text-slate-600'
 }`}>
 {h.status}
 </span>
 </div>
 <div className="text-xs text-slate-500 flex flex-wrap gap-3">
 <span>Ingreso: {h.admissionDate}</span>
 {h.attendingVetName && <span>Vet: {h.attendingVetName}</span>}
 {h.initialDiagnosis && <span>Dx: {h.initialDiagnosis}</span>}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-xs text-slate-500 text-center py-10">Sin hospitalizaciones registradas.</p>
 )}
 </div>
 )}

 {/* Tab: Evoluciones */}
 {activeTab === 'evoluciones' && (
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <h3 className="text-base font-bold text-slate-900">Evolución Clínica & Notas SOAP</h3>
 <Link href="/veterinaria/evoluciones" className="bg-monday-violet text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-cloud transition-all">
 + Nueva Nota SOAP
 </Link>
 </div>
 {loadingEvolutions ? (
 <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
 ) : evolutionsData.length > 0 ? (
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
 {evo.type?.replace('_', ' ') || evo.evolution_type?.replace('_', ' ')}
 </span>
 </div>
 <span className="text-xs text-slate-500">Dr(a). {evo.professionalName}</span>
 </div>
 {evo.diagnosis && (
 <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-xs font-bold text-emerald-700">
 Dx: {evo.diagnosis}
 </div>
 )}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
 <SoapMini label="Subjetivo" color="border-blue-200 bg-blue-50" letter="S" text={evo.soap?.subjective || evo.subjective} />
 <SoapMini label="Objetivo" color="border-emerald-200 bg-emerald-50" letter="O" text={evo.soap?.objective || evo.objective} />
 <SoapMini label="Evaluación" color="border-peach bg-peach/30" letter="A" text={evo.soap?.assessment || evo.assessment} />
 <SoapMini label="Plan" color="border-rose-200 bg-rose-50" letter="P" text={evo.soap?.plan || evo.plan} />
 </div>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-xs text-slate-500 text-center py-10">Sin evoluciones registradas.</p>
 )}
 </div>
 )}

 {/* Tab: Recetas */}
 {activeTab === 'recetas' && (
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <h3 className="text-base font-bold text-slate-900">Recetas Médicas</h3>
 <Link href="/veterinaria/recetas" className="bg-monday-violet text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-cloud transition-all">
 + Nueva Receta
 </Link>
 </div>
 {loadingPrescriptions ? (
 <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
 ) : prescriptionsData.length > 0 ? (
 <div className="space-y-3">
 {prescriptionsData.map((p: any) => (
 <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
 <div className="flex flex-wrap items-center justify-between gap-2">
 <span className="text-sm font-bold text-slate-900">Receta {p.prescriptionDate}</span>
 <span className={`text-xs font-bold px-2 py-0.5 rounded ${
 p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
 }`}>{p.status}</span>
 </div>
 <div className="text-xs text-slate-500">Dr(a). {p.professionalName}</div>
 {p.items && p.items.length > 0 && (
 <div className="space-y-1 mt-2">
 {p.items.map((item: any, idx: number) => (
 <div key={idx} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs">
 <span className="font-bold text-slate-900">{item.medicationName}</span>
 {item.dose && <span className="text-slate-500 ml-2">• {item.dose}</span>}
 {item.frequency && <span className="text-slate-500 ml-2">• {item.frequency}</span>}
 {item.duration && <span className="text-slate-500 ml-2">• {item.duration}</span>}
 </div>
 ))}
 </div>
 )}
 </div>
 ))}
 </div>
 ) : (
 <p className="text-xs text-slate-500 text-center py-10">Sin recetas registradas.</p>
 )}
 </div>
 )}

 {/* Tab: Laboratorio */}
 {activeTab === 'laboratorio' && (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
 <FlaskConical className="w-4 h-4 text-emerald-600" />
 Órdenes de Laboratorio ({labOrdersData.length})
 </h3>
 <Link href="/veterinaria/laboratorio" className="bg-monday-violet hover:bg-monday-violet-hover text-ink font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shadow-sm">
 <Plus className="w-3 h-3" /> Nueva Orden
 </Link>
 </div>
 {loadingLabOrders ? (
 <div className="flex items-center justify-center py-10 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
 <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
 </div>
 ) : labOrdersData.length > 0 ? (
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
 <div className="text-[11px] text-slate-500">Muestra: {lo.sampleType} · Dr(a). {lo.professionalName}</div>
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
 <p className="text-xs text-slate-500">Sin órdenes de laboratorio.</p>
 </div>
 )}
 </div>
 )}

 {/* Tab: Imagenología */}
 {activeTab === 'imagenologia' && (
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <h3 className="text-base font-bold text-slate-900">Imagenología</h3>
 <Link href="/veterinaria/imagenologia" className="bg-monday-violet text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-cloud transition-all">
 + Nuevo Estudio
 </Link>
 </div>
 {loadingImaging ? (
 <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
 ) : imagingData.length > 0 ? (
 <div className="space-y-3">
 {imagingData.map((img: any) => (
 <div key={img.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
 <div className="flex flex-wrap items-center justify-between gap-2">
 <span className="text-sm font-bold text-slate-900">{img.studyType || img.modality}</span>
 <span className="text-xs text-slate-500">{img.studyDate}</span>
 </div>
 {img.findings && <p className="text-xs text-slate-600">{img.findings}</p>}
 </div>
 ))}
 </div>
 ) : (
 <p className="text-xs text-slate-500 text-center py-10">Sin estudios de imagenología.</p>
 )}
 </div>
 )}

 {/* Tab: Pagos */}
 {activeTab === 'pagos' && (
 <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <h3 className="text-base font-bold text-slate-900">Historial de Pagos</h3>
 <Link href="/veterinaria/pagos" className="bg-monday-violet text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-cloud transition-all">
 + Nuevo Pago
 </Link>
 </div>
 {loadingPayments ? (
 <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
 ) : paymentsData.length > 0 ? (
 <div className="space-y-3">
 {paymentsData.map((pay: any) => (
 <div key={pay.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <span className="text-sm font-bold text-slate-900">{pay.concept || 'Pago'}</span>
 <span className="text-xs text-slate-500 ml-2">{pay.paidAt}</span>
 <span className="text-xs text-slate-500 ml-2 capitalize">{pay.method?.replace('_', ' ')}</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-sm font-black text-slate-900">
 ${Number(pay.amount).toLocaleString('es-CL')} CLP
 </span>
 <span className={`text-xs font-bold px-2 py-0.5 rounded ${
 pay.status === 'completado' ? 'bg-emerald-100 text-emerald-700' :
 pay.status === 'pendiente' ? 'bg-peach/50 text-[#c64d00]' :
 'bg-rose-100 text-rose-700'
 }`}>{pay.status}</span>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-xs text-slate-500 text-center py-10">Sin pagos registrados.</p>
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

'use client';

import React, { useState } from 'react';
import { Syringe, Calendar, Clock, User, CheckCircle2, ShieldCheck, Loader2, Play, XCircle, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import InformedConsentModal from './components/informed-consent-modal';
import { useSurgeries } from '../hooks/use-surgeries';
import { usePatients } from '../hooks/use-patients';
import { useProfessionals } from '../hooks/use-professionals';
import { useRooms } from '../hooks/use-rooms';
import { getApiClient } from '@/lib/api-client';

const statusBadge: Record<string, string> = {
 scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
 in_progress: 'bg-peach/50 text-[#c64d00] border-peach',
 completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
 cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};

const statusLabels: Record<string, string> = {
 scheduled: 'Programada',
 in_progress: 'En Curso',
 completed: 'Completada',
 cancelled: 'Cancelada',
};

export default function VeterinarySurgeriesPage() {
 const [selectedSurgery, setSelectedSurgery] = useState<any | null>(null);
 const { data: surgeries, loading, error, refresh } = useSurgeries();
 const { data: patients } = usePatients();
 const { data: professionals } = useProfessionals();
 const { data: rooms } = useRooms();

 const [actionLoading, setActionLoading] = useState<string | null>(null);
 const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
 const [completeModal, setCompleteModal] = useState<any | null>(null);
 const [surgeryReport, setSurgeryReport] = useState('');
 const [postOpInstructions, setPostOpInstructions] = useState('');

 const handleStart = async (id: string) => {
 setActionLoading(id);
 try {
 const api = getApiClient();
 await api.updateVetSurgery(id, { status: 'in_progress' });
 toast.success('Cirugía iniciada correctamente');
 refresh();
 } catch (err) {
 toast.error('Error al iniciar cirugía');
 } finally {
 setActionLoading(null);
 }
 };

 const handleCancel = async (id: string) => {
 setActionLoading(id);
 try {
 const api = getApiClient();
 await api.updateVetSurgery(id, { status: 'cancelled' });
 toast.success('Cirugía cancelada');
 refresh();
 } catch (err) {
 toast.error('Error al cancelar cirugía');
 } finally {
 setActionLoading(null);
 setConfirmCancelId(null);
 }
 };

 const handleComplete = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!completeModal) return;
 setActionLoading(completeModal.id);
 try {
 const api = getApiClient();
 await api.updateVetSurgery(completeModal.id, {
 status: 'completed',
 surgery_report: surgeryReport || null,
 post_op_instructions: postOpInstructions || null,
 });
 toast.success('Cirugía completada correctamente');
 refresh();
 setCompleteModal(null);
 setSurgeryReport('');
 setPostOpInstructions('');
 } catch (err) {
 toast.error('Error al completar cirugía');
 } finally {
 setActionLoading(null);
 }
 };

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-black text-slate-900 tracking-tight">
 Cirugías & Programación de Quirófano
 </h1>
 <p className="text-slate-500 text-sm mt-0.5">
 Registro pre-quirúrgico, consentimiento informado (Ley 21.020) y protocolo anestésico.
 </p>
 </div>
 </div>

 {loading ? (
 <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center gap-3">
 <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
 <p className="text-sm text-slate-500 font-medium">Cargando cirugías...</p>
 </div>
 ) : error ? (
 <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
 <p className="text-sm text-rose-700 font-bold">{error}</p>
 <button onClick={refresh} className="mt-2 text-xs text-rose-600 underline font-semibold">Reintentar</button>
 </div>
 ) : (
 <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
 {surgeries.map((s) => (
 <div key={s.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <h3 className="text-base font-bold text-slate-900">{s.patientName}</h3>
 <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold capitalize">{s.species}</span>
 <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${statusBadge[s.status] || statusBadge.scheduled}`}>
 {statusLabels[s.status] || s.status}
 </span>
 </div>
 <p className="text-sm font-bold text-emerald-700">{s.surgeryName}</p>
 <p className="text-xs text-slate-600">
 <strong>Cirujano/a:</strong> {s.surgeonName} • <strong>Anestesista:</strong> {s.anesthetistName}
 </p>
 </div>

 <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
 {s.status === 'scheduled' && (
 <button
 onClick={() => handleStart(s.id)}
 disabled={actionLoading === s.id}
 className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
 >
 {actionLoading === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
 Iniciar Cirugía
 </button>
 )}

 {s.status === 'in_progress' && (
 <button
 onClick={() => { setCompleteModal(s); setSurgeryReport(''); setPostOpInstructions(''); }}
 disabled={actionLoading === s.id}
 className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
 >
 <FileCheck className="w-4 h-4" />
 Completar
 </button>
 )}

 {s.status !== 'completed' && s.status !== 'cancelled' && !confirmCancelId && (
 <button
 onClick={() => setConfirmCancelId(s.id)}
 className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5"
 >
 <XCircle className="w-4 h-4" />
 Cancelar
 </button>
 )}

 {confirmCancelId === s.id && (
 <div className="flex items-center gap-2">
 <span className="text-xs text-slate-600 font-semibold">¿Cancelar?</span>
 <button
 onClick={() => handleCancel(s.id)}
 disabled={actionLoading === s.id}
 className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1"
 >
 {actionLoading === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Sí
 </button>
 <button
 onClick={() => setConfirmCancelId(null)}
 className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
 >
 No
 </button>
 </div>
 )}

 <button
 onClick={() => setSelectedSurgery(s)}
 className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5"
 >
 <ShieldCheck className="w-4 h-4 text-emerald-600" />
 Consentimiento
 </button>

 <div className="text-right text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
 <span className="text-slate-500 block">Fecha Programada</span>
 <strong className="text-slate-900 text-sm">{s.scheduledDate}</strong>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 {selectedSurgery && (
 <InformedConsentModal
 isOpen={!!selectedSurgery}
 onClose={() => setSelectedSurgery(null)}
 surgeryId={selectedSurgery.id}
 patientName={selectedSurgery.patientName}
 species={selectedSurgery.species}
 breed={selectedSurgery.breed}
 clientName={selectedSurgery.clientName}
 clientRut={selectedSurgery.clientRut}
 surgeryName={selectedSurgery.surgeryName}
 surgeonName={selectedSurgery.surgeonName}
 />
 )}

 {completeModal && (
 <div className="fixed inset-0 z-50 bg-cloud/60 backdrop-blur-xs flex items-center justify-center p-4">
 <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <h3 className="text-lg font-bold text-slate-900">Completar Cirugía</h3>
 <button onClick={() => setCompleteModal(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
 ✕
 </button>
 </div>
 <p className="text-sm text-slate-600">
 <strong>{completeModal.patientName}</strong> — {completeModal.surgeryName}
 </p>
 <form onSubmit={handleComplete} className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Informe Quirúrgico</label>
 <textarea
 value={surgeryReport}
 onChange={(e) => setSurgeryReport(e.target.value)}
 placeholder="Descripción del procedimiento, hallazgos, complicaciones..."
 rows={4}
 className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Instrucciones Post-Operatorias</label>
 <textarea
 value={postOpInstructions}
 onChange={(e) => setPostOpInstructions(e.target.value)}
 placeholder="Medicación, controles, actividad, alimentación..."
 rows={3}
 className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>
 <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
 <button
 type="button"
 onClick={() => setCompleteModal(null)}
 className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
 >
 Cancelar
 </button>
 <button
 type="submit"
 disabled={actionLoading === completeModal.id}
 className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
 >
 {actionLoading === completeModal.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
 Completar Cirugía
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}

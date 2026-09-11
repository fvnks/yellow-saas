'use client';

import React, { useState } from 'react';
import {
 FlaskConical,
 Plus,
 Search,
 TestTube,
 CheckCircle2,
 Clock,
 AlertTriangle,
 AlertCircle,
 Syringe,
 Stethoscope,
 FileText,
 X,
} from 'lucide-react';
import { useLabPanels, useLabOrders } from '../hooks/use-lab';
import { usePatients } from '../hooks/use-patients';
import { useProfessionals } from '../hooks/use-professionals';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { LabOrder, LabPanel } from '../lib/veterinary-store';

const statusBadges: Record<string, string> = {
 ordenada: 'bg-blue-100 text-blue-800 border-blue-200',
 muestra_tomada: 'bg-indigo-100 text-indigo-800 border-indigo-200',
 en_proceso: 'bg-peach/50 text-[#c64d00] border-peach',
 resultados_listos: 'bg-emerald-100 text-emerald-800 border-emerald-200',
 entregado: 'bg-slate-100 text-slate-700 border-slate-200',
 cancelada: 'bg-rose-100 text-rose-800 border-rose-200',
};

const statusLabels: Record<string, string> = {
 ordenada: 'Ordenada',
 muestra_tomada: 'Muestra Tomada',
 en_proceso: 'En Proceso',
 resultados_listos: 'Resultados Listos',
 entregado: 'Entregado',
 cancelada: 'Cancelada',
};

const flagBadges: Record<string, string> = {
 bajo: 'bg-blue-50 text-blue-700 border-blue-200',
 normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
 alto: 'bg-peach/30 text-[#c64d00] border-peach',
 critico: 'bg-rose-50 text-rose-700 border-rose-200',
};

const sampleTypeLabels: Record<string, string> = {
 sangre: 'Sangre',
 orina: 'Orina',
 heces: 'Heces',
 raspado_piel: 'Raspado de piel',
 frotis_sanguineo: 'Frotis sanguíneo',
 aspiracion: 'Aspiración',
 otro: 'Otro',
};

export default function VeterinaryLabPage() {
 const { data: orders, loading: loadingOrders, error: errorOrders, refresh: refreshOrders, mutate: mutateOrders } = useLabOrders();
 const { data: labPanels, loading: loadingPanels } = useLabPanels();
 const { data: patients } = usePatients();
 const { data: professionals } = useProfessionals();
 const [search, setSearch] = useState('');
 const [statusFilter, setStatusFilter] = useState('todos');
 const [selectedId, setSelectedId] = useState<string | null>(null);
 const [showModal, setShowModal] = useState(false);
 const [showResults, setShowResults] = useState(false);

 const [savingResults, setSavingResults] = useState(false);
 const [resultFormEntries, setResultFormEntries] = useState<{
 testId: string;
 testName: string;
 unit: string;
 referenceRange: string;
 value: string;
 flag: string;
 }[]>([]);

 const [formData, setFormData] = useState({
 patientId: '',
 professionalId: '',
 panelId: '',
 sampleType: 'sangre' as LabOrder['sampleType'],
 priority: 'rutina' as LabOrder['priority'],
 note: '',
 });

 if (loadingOrders || loadingPanels) {
 return (
 <div className="space-y-6">
 <div className="h-8 w-64 bg-slate-200 rounded-xl animate-pulse" />
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
 </div>
 <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
 </div>
 );
 }

 if (errorOrders) {
 return (
 <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
 <p className="text-rose-700 font-bold">Error al cargar órdenes: {errorOrders}</p>
 <button onClick={refreshOrders} className="mt-2 text-sm text-rose-600 underline">Reintentar</button>
 </div>
 );
 }

 const filtered = orders.filter((o) => {
 const ms =
 o.patientName.toLowerCase().includes(search.toLowerCase()) ||
 o.clientName.toLowerCase().includes(search.toLowerCase()) ||
 o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
 o.panelName.toLowerCase().includes(search.toLowerCase());
 const mst = statusFilter === 'todos' || o.status === statusFilter;
 return ms && mst;
 });

 const selectedOrder = orders.find((o) => o.id === selectedId);
 const selectedPanel = labPanels.find((p) => p.id === formData.panelId);

 const handleRegisterOrder = async (e: React.FormEvent) => {
 e.preventDefault();
 const patient = patients.find((p) => p.id === formData.patientId);
 const pro = professionals.find((p) => p.id === formData.professionalId);
 const panel = labPanels.find((p) => p.id === formData.panelId);
 if (!patient || !pro || !panel) return;

 try {
 const api = getApiClient();
 await api.createVetLabOrder({
 patientId: patient.id,
 professionalId: pro.id,
 panelId: panel.id,
 sampleType: formData.sampleType,
 priority: formData.priority,
 notes: formData.note,
 });
 await refreshOrders();
 setShowModal(false);
 setFormData({ ...formData, note: '' });
 toast.success('Orden de laboratorio creada correctamente');
 } catch (err: any) {
 toast.error(err.message || 'Error al crear la orden');
 }
 };

 const handleAdvance = async (id: string, status: LabOrder['status']) => {
 try {
 const api = getApiClient();
 await api.updateVetLabOrder(id, { status });
 await refreshOrders();
 toast.success(`Estado actualizado a: ${statusLabels[status]}`);
 } catch (err: any) {
 toast.error(err.message || 'Error al actualizar la orden');
 }
 };

 const openResultsForm = (order: any) => {
 const panel = labPanels.find((p) => p.id === order.panelId);
 if (!panel) {
 toast.error('Panel no encontrado');
 return;
 }
 const entries = panel.tests.map((t: any) => ({
 testId: t.id,
 testName: t.name,
 unit: t.unit,
 referenceRange: t.referenceRange,
 value: '',
 flag: 'normal',
 }));
 setResultFormEntries(entries);
 setSelectedId(order.id);
 setShowResults(true);
 };

 const updateResultEntry = (index: number, field: string, value: string) => {
 setResultFormEntries((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
 };

 const handleSubmitResults = async () => {
 if (!selectedId) return;
 const hasEmpty = resultFormEntries.some((e) => !e.value.trim());
 if (hasEmpty) {
 toast.error('Completa todos los valores de resultado antes de guardar');
 return;
 }
 setSavingResults(true);
 try {
 const api = getApiClient();
 for (const entry of resultFormEntries) {
 await api.createVetLabResult({
 lab_order_id: selectedId,
 test_id: entry.testId,
 test_name: entry.testName,
 value: entry.value,
 unit: entry.unit,
 reference_range: entry.referenceRange,
 flag: entry.flag,
 });
 }
 await api.updateVetLabOrder(selectedId, { status: 'resultados_listos' });
 await refreshOrders();
 setShowResults(false);
 setSelectedId(null);
 toast.success('Resultados registrados y orden marcada como lista');
 } catch (err: any) {
 toast.error(err.message || 'Error al guardar resultados');
 } finally {
 setSavingResults(false);
 }
 };

 const readyCount = orders.filter((o) => o.status === 'resultados_listos').length;
 const inProcess = orders.filter((o) => o.status === 'ordenada' || o.status === 'muestra_tomada' || o.status === 'en_proceso').length;

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
 Laboratorio Clínico Veterinario
 </h1>
 <p className="text-slate-500 text-sm mt-0.5">
 Paneles de hematología, bioquímica y urianálisis con rangos de referencia por especie y banderas de alerta.
 </p>
 </div>
 <button
 onClick={() => setShowModal(true)}
 className="bg-monday-violet hover:bg-monday-violet-hover text-ink font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98] shrink-0"
 >
 <Plus className="w-4 h-4" />
 Nueva Orden de Examen
 </button>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center"><TestTube className="w-5 h-5" /></div>
 <div>
 <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Órdenes Activas</div>
 <div className="text-xl font-black text-slate-900">{orders.length}</div>
 </div>
 </div>
 <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-peach/30 border border-peach text-[#c64d00] flex items-center justify-center"><Clock className="w-5 h-5" /></div>
 <div>
 <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">En Proceso</div>
 <div className="text-xl font-black text-slate-900">{inProcess}</div>
 </div>
 </div>
 <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
 <div>
 <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Listos para Entrega</div>
 <div className="text-xl font-black text-slate-900">{readyCount}</div>
 </div>
 </div>
 <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div>
 <div>
 <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Paneles Disponibles</div>
 <div className="text-xl font-black text-slate-900">{labPanels.length}</div>
 </div>
 </div>
 </div>

 <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
 <div className="relative flex-1 w-full">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Buscar por Paciente, Tutor, Panel o N° Orden..."
 className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
 />
 </div>
 <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
 {[
 { id: 'todos', label: 'Todos' },
 { id: 'ordenada', label: 'Ordenadas' },
 { id: 'en_proceso', label: 'En Proceso' },
 { id: 'resultados_listos', label: 'Resultados' },
 ].map((s) => (
 <button
 key={s.id}
 onClick={() => setStatusFilter(s.id)}
 className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
 statusFilter === s.id ? 'bg-monday-violet text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
 }`}
 >
 {s.label}
 </button>
 ))}
 </div>
 </div>

 <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
 <th className="px-6 py-3.5">N° Orden</th>
 <th className="px-6 py-3.5">Paciente / Tutor</th>
 <th className="px-6 py-3.5">Panel</th>
 <th className="px-6 py-3.5">Muestra</th>
 <th className="px-6 py-3.5">Prioridad</th>
 <th className="px-6 py-3.5">Estado</th>
 <th className="px-6 py-3.5 text-right">Acciones</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-sm">
 {filtered.map((o) => (
 <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
 <td className="px-6 py-4">
 <span className="font-mono font-bold text-xs text-slate-900">{o.orderNumber}</span>
 <span className="text-[11px] text-slate-400 block">{o.orderedDate}</span>
 </td>
 <td className="px-6 py-4">
 <div className="font-bold text-slate-900 text-xs">{o.patientName}</div>
 <div className="text-[11px] text-slate-500">{o.clientName}</div>
 </td>
 <td className="px-6 py-4">
 <div className="text-xs font-semibold text-slate-700">{o.panelName}</div>
 <div className="text-[11px] text-slate-400">{o.professionalName}</div>
 </td>
 <td className="px-6 py-4 text-xs text-slate-600">{sampleTypeLabels[o.sampleType]}</td>
 <td className="px-6 py-4">
 <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${o.priority === 'urgencia' ? 'bg-rose-50 text-rose-700 border-rose-200' : o.priority === 'estatica' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
 {o.priority === 'urgencia' ? 'Urgencia' : o.priority === 'estatica' ? 'Estática' : 'Rutina'}
 </span>
 </td>
 <td className="px-6 py-4">
 <span className={`text-[10px] font-black px-2 py-1 rounded-lg border inline-flex items-center gap-1 ${statusBadges[o.status]}`}>
 {o.status === 'resultados_listos' && <CheckCircle2 className="w-3 h-3" />}
 {statusLabels[o.status]}
 </span>
 </td>
 <td className="px-6 py-4 text-right">
 <div className="flex items-center justify-end gap-2">
 {o.status === 'en_proceso' && (
 <button
 onClick={() => openResultsForm(o)}
 className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl hover:bg-emerald-100 flex items-center gap-1"
 >
 <FlaskConical className="w-3 h-3" /> Ingresar Resultados
 </button>
 )}
 {o.status === 'resultados_listos' && (
 <button
 onClick={() => {
 setSelectedId(o.id);
 setShowResults(true);
 setResultFormEntries([]);
 }}
 className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl hover:bg-emerald-100 flex items-center gap-1"
 >
 <FlaskConical className="w-3 h-3" /> Resultados
 </button>
 )}
 {o.status === 'ordenada' && (
 <button
 onClick={() => handleAdvance(o.id, 'muestra_tomada')}
 className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl hover:bg-indigo-100 flex items-center gap-1"
 >
 <Syringe className="w-3 h-3" /> Muestra
 </button>
 )}
 {o.status === 'muestra_tomada' && (
 <button onClick={() => handleAdvance(o.id, 'en_proceso')} className="text-[11px] font-bold bg-peach/30 text-[#c64d00] border border-peach px-3 py-1.5 rounded-xl hover:bg-peach/50">
 Analizar
 </button>
 )}
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 {/* Modal Nueva Orden */}
 {showModal && (
 <div className="fixed inset-0 z-50 bg-cloud/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
 <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl p-6 space-y-4 my-6">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
 <TestTube className="w-5 h-5 text-emerald-600" />
 Nueva Orden de Exámenes
 </h3>
 <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
 </div>

 <form onSubmit={handleRegisterOrder} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Paciente *</label>
 <select
 value={formData.patientId}
 onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
 className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
 >
 {patients.map((p) => (
 <option key={p.id} value={p.id}>{p.name} - {p.breed} ({p.species})</option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Profesional *</label>
 <select
 value={formData.professionalId}
 onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
 className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
 >
 {professionals.map((p) => (
 <option key={p.id} value={p.id}>{p.fullName}</option>
 ))}
 </select>
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Panel de Exámenes *</label>
 <select
 value={formData.panelId}
 onChange={(e) => setFormData({ ...formData, panelId: e.target.value })}
 className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
 >
 {labPanels.map((p) => (
 <option key={p.id} value={p.id}>{p.name} ({p.tests.length} pruebas)</option>
 ))}
 </select>
 {selectedPanel && (
 <div className="mt-2 flex flex-wrap gap-1.5">
 {selectedPanel.tests.slice(0, 6).map((t: any) => (
 <span key={t.id} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">{t.name}</span>
 ))}
 {selectedPanel.tests.length > 6 && (
 <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg">+{selectedPanel.tests.length - 6} más</span>
 )}
 </div>
 )}
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo de Muestra *</label>
 <select
 value={formData.sampleType}
 onChange={(e) => setFormData({ ...formData, sampleType: e.target.value as LabOrder['sampleType'] })}
 className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
 >
 <option value="sangre">Sangre</option>
 <option value="orina">Orina</option>
 <option value="heces">Heces</option>
 <option value="raspado_piel">Raspado de piel</option>
 <option value="frotis_sanguineo">Frotis sanguíneo</option>
 <option value="aspiracion">Aspiración</option>
 <option value="otro">Otro</option>
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prioridad</label>
 <select
 value={formData.priority}
 onChange={(e) => setFormData({ ...formData, priority: e.target.value as LabOrder['priority'] })}
 className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
 >
 <option value="rutina">Rutina</option>
 <option value="urgencia">Urgencia</option>
 <option value="estatica">Estática / Reproductivo</option>
 </select>
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notas / Indicaciones</label>
 <textarea
 value={formData.note}
 onChange={(e) => setFormData({ ...formData, note: e.target.value })}
 rows={2}
 placeholder="Ej: ayuno previo, medicación que puede interferir..."
 className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
 />
 </div>

 <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
 <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">
 Cancelar
 </button>
 <button type="submit" className="bg-monday-violet hover:bg-monday-violet-hover text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm flex items-center gap-2">
 <TestTube className="w-4 h-4" />
 Registrar Orden
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Modal Resultados / Ingreso de Resultados */}
 {showResults && selectedOrder && (
 <div className="fixed inset-0 z-50 bg-cloud/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
 <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-3xl p-6 space-y-4 my-6">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <div>
 <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
 <FlaskConical className="w-5 h-5 text-emerald-600" />
 {resultFormEntries.length > 0 ? 'Ingresar Resultados' : 'Resultados Laboratorio'}
 </h3>
 <p className="text-xs text-slate-500">{selectedOrder.orderNumber} · {selectedOrder.panelName} · {selectedOrder.patientName}</p>
 </div>
 <button onClick={() => { setShowResults(false); setResultFormEntries([]); }} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
 </div>

 {/* Results entry form (when in en_proceso) */}
 {resultFormEntries.length > 0 ? (
 <div className="space-y-4">
 <div className="overflow-hidden border border-slate-200 rounded-2xl">
 <table className="w-full text-left text-sm">
 <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">
 <tr>
 <th className="px-4 py-3">Examen</th>
 <th className="px-4 py-3">Valor</th>
 <th className="px-4 py-3">Unidad</th>
 <th className="px-4 py-3">Rango Ref.</th>
 <th className="px-4 py-3">Bandera</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {resultFormEntries.map((entry, idx) => (
 <tr key={entry.testId} className="hover:bg-slate-50/60">
 <td className="px-4 py-3 font-semibold text-slate-800 text-xs">{entry.testName}</td>
 <td className="px-4 py-3">
 <input
 type="text"
 value={entry.value}
 onChange={(e) => updateResultEntry(idx, 'value', e.target.value)}
 placeholder="Valor"
 className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
 />
 </td>
 <td className="px-4 py-3 text-slate-500 text-xs">{entry.unit}</td>
 <td className="px-4 py-3 text-slate-500 text-xs">{entry.referenceRange}</td>
 <td className="px-4 py-3">
 <select
 value={entry.flag}
 onChange={(e) => updateResultEntry(idx, 'flag', e.target.value)}
 className="text-[10px] font-bold px-2 py-1 rounded-lg border bg-white focus:ring-2 focus:ring-emerald-500"
 >
 <option value="bajo">Bajo</option>
 <option value="normal">Normal</option>
 <option value="alto">Alto</option>
 <option value="critico">Crítico</option>
 </select>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
 <button
 onClick={() => { setShowResults(false); setResultFormEntries([]); }}
 className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100"
 >
 Cancelar
 </button>
 <button
 onClick={handleSubmitResults}
 disabled={savingResults}
 className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {savingResults ? (
 <>
 <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
 Guardando...
 </>
 ) : (
 <>
 <CheckCircle2 className="w-4 h-4" />
 Guardar Resultados
 </>
 )}
 </button>
 </div>
 </div>
 ) : selectedOrder.results && selectedOrder.results.length > 0 ? (
 <div className="overflow-hidden border border-slate-200 rounded-2xl">
 <table className="w-full text-left text-sm">
 <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">
 <tr>
 <th className="px-4 py-3">Examen</th>
 <th className="px-4 py-3">Resultado</th>
 <th className="px-4 py-3">Unidad</th>
 <th className="px-4 py-3">Rango Ref.</th>
 <th className="px-4 py-3">Bandera</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {selectedOrder.results.map((r: any) => (
 <tr key={r.id} className="hover:bg-slate-50/60">
 <td className="px-4 py-3 font-semibold text-slate-800">{r.testName}</td>
 <td className="px-4 py-3 font-mono font-bold text-slate-900">{r.value}</td>
 <td className="px-4 py-3 text-slate-500">{r.unit}</td>
 <td className="px-4 py-3 text-slate-500">{r.referenceRange}</td>
 <td className="px-4 py-3">
 <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border inline-flex items-center gap-1 ${flagBadges[r.flag]}`}>
 {r.flag === 'critico' && <AlertCircle className="w-3 h-3" />}
 {r.flag === 'normal' ? 'Normal' : r.flag === 'alto' ? 'Alto' : r.flag === 'bajo' ? 'Bajo' : 'Crítico'}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 ) : (
 <div className="text-center py-10">
 <Stethoscope className="w-12 h-12 text-iron mx-auto mb-3" />
 <p className="text-sm text-slate-500 mb-4">La muestra {sampleTypeLabels[selectedOrder.sampleType].toLowerCase()} está {selectedOrder.status === 'en_proceso' ? 'en análisis' : 'pendiente de tomar'}.</p>
 {selectedOrder.status === 'en_proceso' && (
 <button
 onClick={() => openResultsForm(selectedOrder)}
 className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
 >
 Ingresar Resultados
 </button>
 )}
 </div>
 )}

 {selectedOrder.notes && (
 <p className="text-[11px] text-slate-500 bg-peach/30 border border-peach rounded-xl px-3 py-2">
 <strong>Nota del profesional:</strong> {selectedOrder.notes}
 </p>
 )}

 <div className="flex items-center justify-between pt-2 border-t border-slate-100">
 <span className="text-[11px] text-slate-400">Profesional: <strong>{selectedOrder.professionalName}</strong></span>
 <button onClick={() => { setShowResults(false); setResultFormEntries([]); }} className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200">
 Cerrar
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

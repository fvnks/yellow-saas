'use client';

import React, { useState } from 'react';
import { DollarSign, Plus, Search, CreditCard, Banknote, ArrowRight, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { usePayments } from '@/app/veterinaria/hooks/use-payments';
import { usePatients } from '@/app/veterinaria/hooks/use-patients';
import { useClients } from '@/app/veterinaria/hooks/use-clients';
import { useEstimates } from '@/app/veterinaria/hooks/use-estimates';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const PAYMENT_METHODS = [
 { value: 'efectivo', label: 'Efectivo', icon: Banknote },
 { value: 'debito', label: 'Débito', icon: CreditCard },
 { value: 'credito_webpay', label: 'Crédito Webpay', icon: CreditCard },
 { value: 'transferencia', label: 'Transferencia', icon: ArrowRight },
];

const STATUS_BADGES: Record<string, string> = {
 completado: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
 pendiente: 'bg-amber-50 text-amber-700 border border-amber-200',
 reverso: 'bg-rose-50 text-rose-700 border border-rose-200',
};

export default function VeterinaryPaymentsPage() {
 const { data: payments, loading, refresh } = usePayments();
 const { data: patients } = usePatients();
 const { data: clients } = useClients();
 const { data: estimates } = useEstimates();
 const [search, setSearch] = useState('');
 const [statusFilter, setStatusFilter] = useState('');
 const [showModal, setShowModal] = useState(false);
 const [saving, setSaving] = useState(false);

 const [formData, setFormData] = useState({
 patientId: '',
 clientId: '',
 estimateId: '',
 amount: 0,
 method: 'efectivo',
 concept: '',
 referenceNumber: '',
 status: 'completado',
 });

 const filtered = payments.filter((p: any) => {
 const matchesSearch = !search ||
 p.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
 p.client_name?.toLowerCase().includes(search.toLowerCase()) ||
 p.concept?.toLowerCase().includes(search.toLowerCase());
 const matchesStatus = !statusFilter || p.status === statusFilter;
 return matchesSearch && matchesStatus;
 });

 const totalRevenue = filtered.filter((p: any) => p.status === 'completado').reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);

 const handleCreate = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!formData.patientId || !formData.clientId || formData.amount <= 0) return;
 setSaving(true);
 try {
 const api = getApiClient();
 await api.createVetPayment({
 patient_id: formData.patientId,
 client_id: formData.clientId,
 estimate_id: formData.estimateId || undefined,
 amount: formData.amount,
 method: formData.method,
 concept: formData.concept || 'Pago consulta veterinaria',
 reference_number: formData.referenceNumber || undefined,
 status: formData.status,
 paid_at: new Date().toISOString(),
 });
 await refresh();
 setShowModal(false);
 setFormData({ patientId: '', clientId: '', estimateId: '', amount: 0, method: 'efectivo', concept: '', referenceNumber: '', status: 'completado' });
 toast.success('Pago registrado');
 } catch (err: any) {
 toast.error(err.message || 'Error al registrar pago');
 } finally {
 setSaving(false);
 }
 };

 const formatCLP = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
 <DollarSign className="w-7 h-7 text-emerald-600" />
 Pagos & Cobranzas
 </h1>
 <p className="text-slate-500 text-sm mt-0.5">Registro de cobros, métodos de pago y estado de cuentas.</p>
 </div>
 <button onClick={() => setShowModal(true)} className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]">
 <Plus className="w-4 h-4" /> Registrar Pago
 </button>
 </div>

 <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
 <div className="relative flex-1 w-full">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
 <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por paciente, cliente o concepto..." className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
 </div>
 <div className="flex gap-1">
 {['', 'completado', 'pendiente', 'reverso'].map((s) => (
 <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${statusFilter === s ? 'bg-monday-violet text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
 {s || 'Todos'}
 </button>
 ))}
 </div>
 <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl whitespace-nowrap">
 Total: {formatCLP(totalRevenue)}
 </div>
 </div>

 <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 {loading ? (
 <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
 ) : (
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
 <th className="px-6 py-3.5">Fecha</th>
 <th className="px-6 py-3.5">Paciente / Cliente</th>
 <th className="px-6 py-3.5">Monto</th>
 <th className="px-6 py-3.5">Método</th>
 <th className="px-6 py-3.5">Concepto</th>
 <th className="px-6 py-3.5">Estado</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-sm">
 {filtered.map((p: any) => (
 <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
 <td className="px-6 py-4 text-xs text-slate-600">{p.paid_at ? new Date(p.paid_at).toLocaleDateString('es-CL') : '—'}</td>
 <td className="px-6 py-4">
 <div className="font-bold text-slate-900 text-xs">{p.patient_name}</div>
 <div className="text-[11px] text-slate-500">{p.client_name}</div>
 </td>
 <td className="px-6 py-4 text-xs font-bold text-slate-900">{formatCLP(parseFloat(p.amount) || 0)}</td>
 <td className="px-6 py-4 text-xs text-slate-700 capitalize">{p.method?.replace('_', ' ')}</td>
 <td className="px-6 py-4 text-xs text-slate-600 max-w-[200px] truncate">{p.concept}</td>
 <td className="px-6 py-4">
 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${STATUS_BADGES[p.status] || ''}`}>{p.status}</span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
 </div>

 {showModal && (
 <div className="fixed inset-0 z-50 bg-cloud backdrop-blur-xs flex items-center justify-center p-4">
 <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <h3 className="text-lg font-bold text-slate-900">Registrar Pago</h3>
 <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
 </div>
 <form onSubmit={handleCreate} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Paciente *</label>
 <select value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
 <option value="">Seleccionar...</option>
 {patients.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cliente *</label>
 <select value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
 <option value="">Seleccionar...</option>
 {clients.map((c: any) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Monto (CLP) *</label>
 <input type="number" min="1" value={formData.amount || ''} onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Método de Pago *</label>
 <select value={formData.method} onChange={(e) => setFormData({ ...formData, method: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
 {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
 </select>
 </div>
 <div className="sm:col-span-2">
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Concepto</label>
 <input type="text" value={formData.concept} onChange={(e) => setFormData({ ...formData, concept: e.target.value })} placeholder="Ej. Consulta general, Cirugía..." className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">N° Referencia</label>
 <input type="text" value={formData.referenceNumber} onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Presupuesto Asociado</label>
 <select value={formData.estimateId} onChange={(e) => setFormData({ ...formData, estimateId: e.target.value })} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
 <option value="">Sin presupuesto</option>
 {estimates.map((e: any) => <option key={e.id} value={e.id}>{e.estimate_number} — {e.patient_name}</option>)}
 </select>
 </div>
 </div>
 <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
 <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800">Cancelar</button>
 <button type="submit" disabled={saving} className="bg-monday-violet hover:bg-cloud text-white font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-sm disabled:opacity-50 flex items-center gap-2">
 {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
 Registrar Pago
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}

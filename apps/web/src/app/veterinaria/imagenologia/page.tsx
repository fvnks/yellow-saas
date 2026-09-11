'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Scan, Plus, Search, Filter, Eye, ChevronLeft, X } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface ImagingStudy {
 id: string;
 study_number: string;
 study_type: string;
 patient_name: string;
 species: string;
 breed: string;
 client_name: string;
 professional_name: string;
 study_date: string;
 region: string;
 findings: string;
 conclusion: string;
 image_count: number;
 status: string;
 modality: string;
}

const STUDY_TYPES: Record<string, string> = {
 radiografia: 'Radiografía',
 ecografia: 'Ecografía',
 tomografia: 'TAC / Tomografía',
 resonancia: 'Resonancia Magnética',
 endoscopia: 'Endoscopía',
 electrocardiograma: 'ECG',
 otro: 'Otro',
};

const STATUS_COLORS: Record<string, string> = {
 en_proceso: 'bg-amber-50 text-amber-700 border-amber-200',
 informado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
 disponible: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function ImagingPage() {
 const [studies, setStudies] = useState<ImagingStudy[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [showForm, setShowForm] = useState(false);
 const [selectedStudy, setSelectedStudy] = useState<ImagingStudy | null>(null);
 const [form, setForm] = useState({
 patient_id: '', client_id: '', professional_id: '', study_type: 'radiografia',
 study_date: new Date().toISOString().split('T')[0], region: '', findings: '',
 conclusion: '', image_count: 0, modality: '', notes: '',
 });
 const [patients, setPatients] = useState<any[]>([]);
 const [clients, setClients] = useState<any[]>([]);
 const [professionals, setProfessionals] = useState<any[]>([]);

 const fetchStudies = useCallback(async () => {
 setLoading(true);
 try {
 const api = getApiClient();
 const params: Record<string, string> = {};
 if (search) params.search = search;
 const result = await api.getVetImaging(params);
 setStudies(result.data || []);
 } catch (err) {
 console.error('Error fetching imaging studies:', err);
 } finally {
 setLoading(false);
 }
 }, [search]);

 useEffect(() => { fetchStudies(); }, [fetchStudies]);

 useEffect(() => {
 if (showForm) {
 const api = getApiClient();
 Promise.all([
 api.getVetPatients(),
 api.getVetClients(),
 api.getVetProfessionals(),
 ]).then(([p, c, pr]) => {
 setPatients(p.data || []);
 setClients(c.data || []);
 setProfessionals(pr.data || []);
 });
 }
 }, [showForm]);

 const handleCreate = async () => {
 if (!form.patient_id || !form.client_id) return;
 try {
 const api = getApiClient();
 await api.createVetImaging(form);
 setShowForm(false);
 setForm({ patient_id: '', client_id: '', professional_id: '', study_type: 'radiografia', study_date: new Date().toISOString().split('T')[0], region: '', findings: '', conclusion: '', image_count: 0, modality: '', notes: '' });
 fetchStudies();
 } catch (err) {
 console.error('Error creating study:', err);
 }
 };

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="bg-gradient-to-r from-[#0F172A] via-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-mist">
 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2 mb-2">
 <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-wider">
 Imagenología Veterinaria
 </span>
 </div>
 <h1 className="text-2xl font-black text-white tracking-tight">Estudios de Imagen</h1>
 <p className="text-slate-300 text-sm mt-1">Radiografías, ecografías, TAC, resonancias y más.</p>
 </div>
 <button
 onClick={() => setShowForm(true)}
 className="bg-monday-violet hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
 >
 <Plus className="w-4 h-4" />
 Nuevo Estudio
 </button>
 </div>
 </div>

 {/* Search */}
 <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
 <div className="flex items-center gap-3">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input
 type="text"
 placeholder="Buscar por paciente, número o región..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
 />
 </div>
 </div>
 </div>

 {/* Table */}
 <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
 {loading ? (
 <div className="p-12 text-center">
 <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
 <p className="text-slate-500 text-sm mt-3">Cargando estudios...</p>
 </div>
 ) : studies.length === 0 ? (
 <div className="p-12 text-center">
 <Scan className="w-12 h-12 text-slate-300 mx-auto mb-3" />
 <p className="text-slate-500 text-sm">No hay estudios de imagen registrados</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-slate-200/80 bg-slate-50/50">
 <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">N° Estudio</th>
 <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
 <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Paciente</th>
 <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Región</th>
 <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
 <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
 <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Imágenes</th>
 <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {studies.map((s) => (
 <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
 <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-900">{s.study_number}</td>
 <td className="px-5 py-3.5">
 <span className="text-xs font-medium text-slate-700">{STUDY_TYPES[s.study_type] || s.study_type}</span>
 </td>
 <td className="px-5 py-3.5">
 <div>
 <p className="text-sm font-semibold text-slate-900">{s.patient_name}</p>
 <p className="text-xs text-slate-500">{s.species} · {s.client_name}</p>
 </div>
 </td>
 <td className="px-5 py-3.5 text-xs text-slate-600">{s.region || '—'}</td>
 <td className="px-5 py-3.5 text-xs text-slate-600">{s.study_date}</td>
 <td className="px-5 py-3.5">
 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${STATUS_COLORS[s.status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
 {s.status === 'en_proceso' ? 'En Proceso' : s.status === 'informado' ? 'Informado' : 'Disponible'}
 </span>
 </td>
 <td className="px-5 py-3.5 text-xs text-slate-600 text-center">{s.image_count}</td>
 <td className="px-5 py-3.5 text-right">
 <button
 onClick={() => setSelectedStudy(s)}
 className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
 >
 <Eye className="w-4 h-4" />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* Create Modal */}
 {showForm && (
 <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
 <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
 <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
 <h2 className="text-lg font-bold text-slate-900">Nuevo Estudio de Imagen</h2>
 <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
 </div>
 <div className="p-6 space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-xs font-bold text-slate-700 mb-1 block">Paciente *</label>
 <select value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
 className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
 <option value="">Seleccionar...</option>
 {patients.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
 </select>
 </div>
 <div>
 <label className="text-xs font-bold text-slate-700 mb-1 block">Cliente *</label>
 <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}
 className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
 <option value="">Seleccionar...</option>
 {clients.map((c: any) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
 </select>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-xs font-bold text-slate-700 mb-1 block">Tipo de Estudio *</label>
 <select value={form.study_type} onChange={(e) => setForm({ ...form, study_type: e.target.value })}
 className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
 {Object.entries(STUDY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
 </select>
 </div>
 <div>
 <label className="text-xs font-bold text-slate-700 mb-1 block">Fecha</label>
 <input type="date" value={form.study_date} onChange={(e) => setForm({ ...form, study_date: e.target.value })}
 className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-xs font-bold text-slate-700 mb-1 block">Región Anatómica</label>
 <input type="text" placeholder="ej: Tórax, Abdomen, Cráneo..." value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
 className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
 </div>
 <div>
 <label className="text-xs font-bold text-slate-700 mb-1 block">Profesional</label>
 <select value={form.professional_id} onChange={(e) => setForm({ ...form, professional_id: e.target.value })}
 className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
 <option value="">Seleccionar...</option>
 {professionals.map((p: any) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
 </select>
 </div>
 </div>
 <div>
 <label className="text-xs font-bold text-slate-700 mb-1 block">Hallazgos</label>
 <textarea rows={3} value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })}
 className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" placeholder="Descripción de hallazgos..." />
 </div>
 <div>
 <label className="text-xs font-bold text-slate-700 mb-1 block">Conclusión</label>
 <textarea rows={2} value={form.conclusion} onChange={(e) => setForm({ ...form, conclusion: e.target.value })}
 className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" placeholder="Diagnóstico / conclusión..." />
 </div>
 <div className="flex justify-end gap-3 pt-2">
 <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
 <button onClick={handleCreate} disabled={!form.patient_id || !form.client_id}
 className="bg-monday-violet hover:bg-cloud text-white font-medium px-5 py-2 rounded-xl text-sm transition-all disabled:opacity-50">
 Crear Estudio
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Detail Modal */}
 {selectedStudy && (
 <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
 <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
 <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
 <div>
 <h2 className="text-lg font-bold text-slate-900">{selectedStudy.study_number}</h2>
 <p className="text-xs text-slate-500">{STUDY_TYPES[selectedStudy.study_type]}</p>
 </div>
 <button onClick={() => setSelectedStudy(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
 </div>
 <div className="p-6 space-y-4">
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div><span className="text-slate-500">Paciente:</span> <span className="font-semibold">{selectedStudy.patient_name} ({selectedStudy.species})</span></div>
 <div><span className="text-slate-500">Cliente:</span> <span className="font-semibold">{selectedStudy.client_name}</span></div>
 <div><span className="text-slate-500">Fecha:</span> <span className="font-semibold">{selectedStudy.study_date}</span></div>
 <div><span className="text-slate-500">Región:</span> <span className="font-semibold">{selectedStudy.region || '—'}</span></div>
 <div><span className="text-slate-500">Imágenes:</span> <span className="font-semibold">{selectedStudy.image_count}</span></div>
 <div><span className="text-slate-500">Estado:</span> <span className="font-semibold">{selectedStudy.status}</span></div>
 </div>
 {selectedStudy.findings && (
 <div>
 <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Hallazgos</h4>
 <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3">{selectedStudy.findings}</p>
 </div>
 )}
 {selectedStudy.conclusion && (
 <div>
 <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Conclusión</h4>
 <p className="text-sm text-slate-700 bg-emerald-50 rounded-xl p-3 border border-emerald-100">{selectedStudy.conclusion}</p>
 </div>
 )}
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

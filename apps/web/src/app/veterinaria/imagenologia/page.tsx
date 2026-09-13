'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Scan, Plus, Search, Eye, Trash2, Edit2, X, Check } from 'lucide-react';
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
  en_proceso: 'bg-peach/30 text-[#c64d00] border-peach',
  informado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  disponible: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function ImagingPage() {
  const [studies, setStudies] = useState<ImagingStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<ImagingStudy | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ findings: '', conclusion: '', status: '', notes: '' });

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

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este estudio de imagen?')) return;
    try {
      const api = getApiClient();
      await api.deleteVetImaging(id);
      fetchStudies();
      if (selectedStudy?.id === id) setSelectedStudy(null);
    } catch (err) {
      console.error('Error deleting study:', err);
    }
  };

  const handleUpdate = async () => {
    if (!selectedStudy) return;
    try {
      const api = getApiClient();
      await api.updateVetImaging({
        id: selectedStudy.id,
        findings: editForm.findings,
        conclusion: editForm.conclusion,
        status: editForm.status,
        notes: editForm.notes,
      });
      setIsEditing(false);
      setSelectedStudy(null);
      fetchStudies();
    } catch (err) {
      console.error('Error updating study:', err);
    }
  };

  const openDetail = (s: ImagingStudy) => {
    setSelectedStudy(s);
    setEditForm({
      findings: s.findings || '',
      conclusion: s.conclusion || '',
      status: s.status || 'en_proceso',
      notes: '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-snow border border-mist rounded-3xl p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-mint/30 text-forest text-[10px] font-semibold px-2.5 py-0.5 rounded-md border border-mint/50 uppercase tracking-wider">
                Imagenología Veterinaria
              </span>
            </div>
            <h1 className="text-2xl font-light text-ink tracking-tight">Estudios de Imagen</h1>
            <p className="text-slate-text text-sm mt-1">Radiografías, ecografías, TAC, resonancias y más.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-monday-violet hover:bg-monday-violet-hover text-white px-6 py-3 rounded-[160px] text-sm font-medium shadow-sm transition-all duration-150 active:scale-[0.98] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Estudio
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-snow border border-mist rounded-3xl p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-iron" />
            <input
              type="text"
              placeholder="Buscar por paciente, número o región..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-cloud border border-mist rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-monday-violet/20"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-snow border border-mist rounded-3xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-monday-violet border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-text text-sm mt-3">Cargando estudios...</p>
          </div>
        ) : studies.length === 0 ? (
          <div className="p-12 text-center">
            <Scan className="w-12 h-12 text-iron mx-auto mb-3" />
            <p className="text-slate-text text-sm">No hay estudios de imagen registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mist bg-cloud">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-text uppercase tracking-wider">N° Estudio</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-text uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-text uppercase tracking-wider">Paciente</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-text uppercase tracking-wider">Región</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-text uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-text uppercase tracking-wider">Estado</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-text uppercase tracking-wider">Imágenes</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-text uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist">
                {studies.map((s) => (
                  <tr key={s.id} className="hover:bg-cloud transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-ink">{s.study_number}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-normal text-ink">{STUDY_TYPES[s.study_type] || s.study_type}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-ink">{s.patient_name}</p>
                        <p className="text-xs text-slate-text">{s.species} · {s.client_name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-text">{s.region || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-text">{s.study_date}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase border ${STATUS_COLORS[s.status] || 'bg-cloud text-ink border-mist'}`}>
                        {s.status === 'en_proceso' ? 'En Proceso' : s.status === 'informado' ? 'Informado' : 'Disponible'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-text text-center">{s.image_count}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetail(s)}
                          className="text-monday-violet hover:bg-cloud p-1.5 rounded-md transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-[#c64d00] hover:bg-peach/30 p-1.5 rounded-md transition-colors"
                          title="Eliminar estudio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
          <div className="bg-snow rounded-3xl shadow-card w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-mist">
            <div className="px-6 py-4 border-b border-mist flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Nuevo Estudio de Imagen</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-md hover:bg-cloud text-iron"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-ink mb-1 block">Paciente *</label>
                  <select value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                    className="w-full px-3 py-2 border border-mist rounded-md text-sm text-ink bg-snow focus:ring-2 focus:ring-monday-violet/20">
                    <option value="">Seleccionar...</option>
                    {patients.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink mb-1 block">Cliente / Tutor *</label>
                  <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                    className="w-full px-3 py-2 border border-mist rounded-md text-sm text-ink bg-snow focus:ring-2 focus:ring-monday-violet/20">
                    <option value="">Seleccionar...</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-ink mb-1 block">Tipo de Estudio *</label>
                  <select value={form.study_type} onChange={(e) => setForm({ ...form, study_type: e.target.value })}
                    className="w-full px-3 py-2 border border-mist rounded-md text-sm text-ink bg-snow focus:ring-2 focus:ring-monday-violet/20">
                    {Object.entries(STUDY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink mb-1 block">Fecha</label>
                  <input type="date" value={form.study_date} onChange={(e) => setForm({ ...form, study_date: e.target.value })}
                    className="w-full px-3 py-2 border border-mist rounded-md text-sm text-ink bg-snow focus:ring-2 focus:ring-monday-violet/20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-ink mb-1 block">Región Anatómica</label>
                  <input type="text" placeholder="ej: Tórax, Abdomen, Cráneo..." value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
                    className="w-full px-3 py-2 border border-mist rounded-md text-sm text-ink bg-snow focus:ring-2 focus:ring-monday-violet/20" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink mb-1 block">Profesional</label>
                  <select value={form.professional_id} onChange={(e) => setForm({ ...form, professional_id: e.target.value })}
                    className="w-full px-3 py-2 border border-mist rounded-md text-sm text-ink bg-snow focus:ring-2 focus:ring-monday-violet/20">
                    <option value="">Seleccionar...</option>
                    {professionals.map((p: any) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-ink mb-1 block">Hallazgos</label>
                <textarea rows={3} value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })}
                  className="w-full px-3 py-2 border border-mist rounded-md text-sm text-ink bg-snow focus:ring-2 focus:ring-monday-violet/20" placeholder="Descripción de hallazgos..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink mb-1 block">Conclusión</label>
                <textarea rows={2} value={form.conclusion} onChange={(e) => setForm({ ...form, conclusion: e.target.value })}
                  className="w-full px-3 py-2 border border-mist rounded-md text-sm text-ink bg-snow focus:ring-2 focus:ring-monday-violet/20" placeholder="Diagnóstico / conclusión..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="bg-snow border border-mist hover:bg-cloud text-ink px-6 py-2.5 rounded-[160px] text-sm font-medium transition-all">Cancelar</button>
                <button onClick={handleCreate} disabled={!form.patient_id || !form.client_id}
                  className="bg-monday-violet hover:bg-monday-violet-hover text-white px-6 py-2.5 rounded-[160px] text-sm font-medium shadow-sm transition-all disabled:opacity-50">
                  Crear Estudio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail / Edit Modal */}
      {selectedStudy && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-snow rounded-3xl shadow-card w-full max-w-lg border border-mist">
            <div className="px-6 py-4 border-b border-mist flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">{selectedStudy.study_number}</h2>
                <p className="text-xs text-slate-text">{STUDY_TYPES[selectedStudy.study_type]}</p>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-md hover:bg-cloud text-monday-violet" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setSelectedStudy(null)} className="p-1.5 rounded-md hover:bg-cloud text-iron"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-text">Paciente:</span> <span className="font-semibold text-ink">{selectedStudy.patient_name} ({selectedStudy.species})</span></div>
                <div><span className="text-slate-text">Cliente:</span> <span className="font-semibold text-ink">{selectedStudy.client_name}</span></div>
                <div><span className="text-slate-text">Fecha:</span> <span className="font-semibold text-ink">{selectedStudy.study_date}</span></div>
                <div><span className="text-slate-text">Región:</span> <span className="font-semibold text-ink">{selectedStudy.region || '—'}</span></div>
                <div><span className="text-slate-text">Imágenes:</span> <span className="font-semibold text-ink">{selectedStudy.image_count}</span></div>
                <div>
                  <span className="text-slate-text">Estado:</span>{' '}
                  {isEditing ? (
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="mt-1 w-full px-2 py-1 border border-mist rounded-md text-xs text-ink bg-snow"
                    >
                      <option value="en_proceso">En Proceso</option>
                      <option value="informado">Informado</option>
                      <option value="disponible">Disponible</option>
                    </select>
                  ) : (
                    <span className="font-semibold text-ink capitalize">{selectedStudy.status}</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-1">Hallazgos</h4>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={editForm.findings}
                    onChange={(e) => setEditForm({ ...editForm, findings: e.target.value })}
                    className="w-full px-3 py-2 border border-mist rounded-md text-sm text-ink bg-snow focus:ring-2 focus:ring-monday-violet/20"
                  />
                ) : (
                  <p className="text-sm text-ink bg-cloud rounded-md p-3 border border-mist">{selectedStudy.findings || 'Sin hallazgos registrados'}</p>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-1">Conclusión</h4>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={editForm.conclusion}
                    onChange={(e) => setEditForm({ ...editForm, conclusion: e.target.value })}
                    className="w-full px-3 py-2 border border-mist rounded-md text-sm text-ink bg-snow focus:ring-2 focus:ring-monday-violet/20"
                  />
                ) : (
                  <p className="text-sm text-forest bg-mint/30 rounded-md p-3 border border-mint/50">{selectedStudy.conclusion || 'Sin conclusión registrada'}</p>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setIsEditing(false)} className="bg-snow border border-mist hover:bg-cloud text-ink px-4 py-2 rounded-[160px] text-xs font-medium">Cancelar</button>
                  <button onClick={handleUpdate} className="bg-monday-violet hover:bg-monday-violet-hover text-white px-4 py-2 rounded-[160px] text-xs font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Guardar Cambios
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
import {
  INITIAL_PATIENTS,
  INITIAL_CLIENTS,
  INITIAL_PROFESSIONALS,
  INITIAL_LAB_ORDERS,
  INITIAL_LAB_PANELS,
  LabOrder,
  LabPanel,
} from '../lib/veterinary-store';

const statusBadges: Record<string, string> = {
  ordenada: 'bg-blue-100 text-blue-800 border-blue-200',
  muestra_tomada: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  en_proceso: 'bg-amber-100 text-amber-800 border-amber-200',
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
  alto: 'bg-amber-50 text-amber-700 border-amber-200',
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
  const [orders, setOrders] = useState<LabOrder[]>(INITIAL_LAB_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [formData, setFormData] = useState({
    patientId: INITIAL_PATIENTS[0]?.id || '',
    professionalId: INITIAL_PROFESSIONALS[0]?.id || '',
    panelId: INITIAL_LAB_PANELS[0]?.id || '',
    sampleType: 'sangre' as LabOrder['sampleType'],
    priority: 'rutina' as LabOrder['priority'],
    note: '',
  });

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
  const selectedPanel = INITIAL_LAB_PANELS.find((p) => p.id === formData.panelId);

  const handleRegisterOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = INITIAL_PATIENTS.find((p) => p.id === formData.patientId);
    const client = INITIAL_CLIENTS.find((c) => c.id === patient?.clientId);
    const pro = INITIAL_PROFESSIONALS.find((p) => p.id === formData.professionalId);
    const panel = INITIAL_LAB_PANELS.find((p) => p.id === formData.panelId);
    if (!patient || !client || !pro || !panel) return;

    const today = new Date().toISOString().split('T')[0];
    const nextNum = `${orders.length + 1}`.padStart(3, '0');

    const newOrder: LabOrder = {
      id: `lab-${Date.now()}`,
      orderNumber: `LAB-2025-${nextNum}`,
      patientId: patient.id,
      patientName: patient.name,
      species: patient.species,
      clientId: client.id,
      clientName: client.fullName,
      clientRut: client.rut,
      professionalId: pro.id,
      professionalName: pro.fullName,
      panelId: panel.id,
      panelName: panel.name,
      orderedDate: today,
      sampleType: formData.sampleType,
      status: 'ordenada',
      priority: formData.priority,
      notes: formData.note,
    };

    setOrders([newOrder, ...orders]);
    setShowModal(false);
    setFormData({ ...formData, note: '' });
  };

  const handleAdvance = (id: string, status: LabOrder['status']) =>
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));

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
          className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98] shrink-0"
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
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
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
            <div className="text-xl font-black text-slate-900">{INITIAL_LAB_PANELS.length}</div>
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
                statusFilter === s.id ? 'bg-[#0F172A] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                      <button
                        onClick={() => {
                          setSelectedId(o.id);
                          setShowResults(true);
                        }}
                        disabled={o.status !== 'resultados_listos'}
                        title={o.status === 'resultados_listos' ? 'Ver resultados' : 'Resultados aún no listos'}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 border ${
                          o.status === 'resultados_listos'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                        }`}
                      >
                        <FlaskConical className="w-3 h-3" /> Resultados
                      </button>
                      {o.status === 'ordenada' && (
                        <button
                          onClick={() => handleAdvance(o.id, 'muestra_tomada')}
                          className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl hover:bg-indigo-100 flex items-center gap-1"
                        >
                          <Syringe className="w-3 h-3" /> Muestra
                        </button>
                      )}
                      {o.status === 'muestra_tomada' && (
                        <button onClick={() => handleAdvance(o.id, 'en_proceso')} className="text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl hover:bg-amber-100">
                          Analizar
                        </button>
                      )}
                      {o.status === 'en_proceso' && (
                        <button onClick={() => { setSelectedId(o.id); setShowResults(true); }} className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl hover:bg-emerald-100">
                          Registrar Resultados
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
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
                    {INITIAL_PATIENTS.map((p) => (
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
                    {INITIAL_PROFESSIONALS.map((p) => (
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
                  {INITIAL_LAB_PANELS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.tests.length} pruebas)</option>
                  ))}
                </select>
                {selectedPanel && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedPanel.tests.slice(0, 6).map((t) => (
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
                <button type="submit" className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  Registrar Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Resultados */}
      {showResults && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-3xl p-6 space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-emerald-600" />
                  Resultados Laboratorio
                </h3>
                <p className="text-xs text-slate-500">{selectedOrder.orderNumber} · {selectedOrder.panelName} · {selectedOrder.patientName}</p>
              </div>
              <button onClick={() => setShowResults(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            {selectedOrder.results && selectedOrder.results.length > 0 ? (
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
                    {selectedOrder.results.map((r) => (
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
                <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-4">La muestra {sampleTypeLabels[selectedOrder.sampleType].toLowerCase()} está {selectedOrder.status === 'en_proceso' ? 'en análisis' : 'pendiente de tomar'}.</p>
                {selectedOrder.status === 'en_proceso' && (
                  <button
                    onClick={() => {
                      handleAdvance(selectedOrder.id, 'resultados_listos');
                      setShowResults(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
                  >
                    Marcar Resultados Listos / Entregar
                  </button>
                )}
              </div>
            )}

            {selectedOrder.notes && (
              <p className="text-[11px] text-slate-500 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                <strong>Nota del profesional:</strong> {selectedOrder.notes}
              </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">Profesional: <strong>{selectedOrder.professionalName}</strong></span>
              <button onClick={() => setShowResults(false)} className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

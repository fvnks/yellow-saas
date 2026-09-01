'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import {
  INITIAL_PATIENTS,
  INITIAL_CLIENTS,
  INITIAL_PROFESSIONALS,
  INITIAL_ESTIMATES,
  INITIAL_PAYMENTS,
  VeterinaryEstimate,
  EstimateItem,
} from '../lib/veterinary-store';

const formatCLP = (val: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Math.round(val));

const statusBadges: Record<string, string> = {
  borrador: 'bg-slate-100 text-slate-700 border-slate-200',
  pendiente_aprobacion: 'bg-amber-100 text-amber-800 border-amber-200',
  aprobado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rechazado: 'bg-rose-100 text-rose-800 border-rose-200',
  expirado: 'bg-slate-200 text-slate-500 border-slate-300',
  convertido: 'bg-blue-100 text-blue-800 border-blue-200',
};

const statusLabels: Record<string, string> = {
  borrador: 'Borrador',
  pendiente_aprobacion: 'Pendiente Aprobación',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  expirado: 'Expirado',
  convertido: 'Convertido a Venta',
};

const paymentMethodLabels: Record<string, string> = {
  efectivo: 'Efectivo',
  debito: 'Débito',
  credito_webpay: 'Crédito WebPay',
  transbank_credito: 'Transbank Crédito',
  transferencia: 'Transferencia',
  cheque: 'Cheque',
  mercadopago: 'MercadoPago',
};

export default function VeterinaryEstimatesPage() {
  const [estimates, setEstimates] = useState<VeterinaryEstimate[]>(INITIAL_ESTIMATES);
  const [payments] = useState(INITIAL_PAYMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    patientId: INITIAL_PATIENTS[0]?.id || '',
    professionalId: INITIAL_PROFESSIONALS[0]?.id || '',
    validUntil: '',
    note: '',
  });
  const [newItems, setNewItems] = useState<EstimateItem[]>([
    { id: 'ni-1', description: '', quantity: 1, unitPriceCLP: 0 },
  ]);

  const filtered = estimates.filter((e) => {
    const matchesSearch =
      e.clientName.toLowerCase().includes(search.toLowerCase()) ||
      e.patientName.toLowerCase().includes(search.toLowerCase()) ||
      e.estimateNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const subtotal = (e: VeterinaryEstimate) => e.items.reduce((a, i) => a + i.quantity * i.unitPriceCLP, 0);
  const totalWithIVA = (e: VeterinaryEstimate) => Math.round(subtotal(e) * 1.19);

  const handleAddItem = () =>
    setNewItems([...newItems, { id: `ni-${Date.now()}`, description: '', quantity: 1, unitPriceCLP: 0 }]);

  const updateItem = (id: string, patch: Partial<EstimateItem>) =>
    setNewItems(newItems.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const removeItem = (id: string) => setNewItems(newItems.filter((i) => i.id !== id));

  const handleCreateEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = INITIAL_PATIENTS.find((p) => p.id === formData.patientId);
    const client = INITIAL_CLIENTS.find((c) => c.id === patient?.clientId);
    const pro = INITIAL_PROFESSIONALS.find((p) => p.id === formData.professionalId);
    const validItems = newItems.filter((i) => i.description && i.unitPriceCLP > 0);
    if (!patient || !client || !pro || validItems.length === 0) return;

    const today = new Date();
    const validUntil =
      formData.validUntil || new Date(today.getTime() + 30 * 86400000).toISOString().split('T')[0];
    const nextNum = `${estimates.length + 1}`.padStart(3, '0');

    const newEstimate: VeterinaryEstimate = {
      id: `est-${Date.now()}`,
      estimateNumber: `COT-2025-${nextNum}`,
      patientId: patient.id,
      patientName: patient.name,
      species: patient.species,
      clientId: client.id,
      clientName: client.fullName,
      clientRut: client.rut,
      professionalId: pro.id,
      professionalName: pro.fullName,
      issueDate: today.toISOString().split('T')[0],
      validUntil,
      items: validItems,
      currency: 'CLP',
      note: formData.note,
      status: 'pendiente_aprobacion',
    };

    setEstimates([newEstimate, ...estimates]);
    setShowModal(false);
    setNewItems([{ id: 'ni-1', description: '', quantity: 1, unitPriceCLP: 0 }]);
    setFormData({
      patientId: INITIAL_PATIENTS[0]?.id || '',
      professionalId: INITIAL_PROFESSIONALS[0]?.id || '',
      validUntil: '',
      note: '',
    });
  };

  const handleApprove = (id: string) =>
    setEstimates(estimates.map((e) => (e.id === id ? { ...e, status: 'aprobado' } : e)));

  const handleReject = (id: string) =>
    setEstimates(estimates.map((e) => (e.id === id ? { ...e, status: 'rechazado' } : e)));

  const pendingCount = estimates.filter((e) => e.status === 'pendiente_aprobacion').length;
  const approvedCount = estimates.filter((e) => e.status === 'aprobado').length;
  const approvedTotal = estimates
    .filter((e) => e.status === 'aprobado')
    .reduce((a, e) => a + totalWithIVA(e), 0);
  const depositsTotal = payments.reduce((a, p) => a + p.amountCLP, 0);

  const newItemsSubtotal = newItems.reduce((a, i) => a + i.quantity * i.unitPriceCLP, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Presupuestos & Estimaciones Clínicas
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Cotizaciones formales con aprobación digital del tutor, anticipos parciales y conversión a venta DTE SII.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nueva Estimación
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Pendientes Aprobación</div>
            <div className="text-xl font-black text-slate-900">{pendingCount}</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center"><BadgeCheck className="w-5 h-5" /></div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Aprobados</div>
            <div className="text-xl font-black text-slate-900">{approvedCount}</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Cotizado IVA</div>
            <div className="text-xl font-black text-slate-900">{formatCLP(approvedTotal)}</div>
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Anticipos Recibidos</div>
            <div className="text-xl font-black text-slate-900">{formatCLP(depositsTotal)}</div>
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
            placeholder="Buscar por Tutor, Paciente o N° Cotización..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'pendiente_aprobacion', label: 'Pendientes' },
            { id: 'aprobado', label: 'Aprobados' },
            { id: 'convertido', label: 'Convertidos' },
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
                <th className="px-6 py-3.5">N° Cotización</th>
                <th className="px-6 py-3.5">Tutor / Paciente</th>
                <th className="px-6 py-3.5">Detalle / Ítems</th>
                <th className="px-6 py-3.5">Total IVA</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((e) => (
                <React.Fragment key={e.id}>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-xs text-slate-900">{e.estimateNumber}</span>
                      <span className="text-[11px] text-slate-400 block">{e.issueDate}</span>
                      <span className="text-[10px] text-slate-400">vence {e.validUntil}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-xs">{e.clientName}</div>
                      <div className="text-[11px] text-slate-500">{e.patientName} ({e.species})</div>
                      <div className="text-[10px] text-slate-400 font-mono">{e.clientRut}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-slate-700">{e.items[0]?.description}</div>
                      <div className="text-[11px] text-slate-400">{e.items.length} ítem(s)</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-slate-900 text-xs">{formatCLP(totalWithIVA(e))}</div>
                      <div className="text-[10px] text-slate-400">neto {formatCLP(subtotal(e))}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${statusBadges[e.status]}`}>
                        {statusLabels[e.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setExpandedId(expandedId === e.id ? null : e.id)} className="text-slate-400 hover:text-slate-700 p-1" title="Ver detalle y pagos">
                          {expandedId === e.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {e.status === 'pendiente_aprobacion' && (
                          <>
                            <button
                              onClick={() => handleApprove(e.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Aprobar
                            </button>
                            <button
                              onClick={() => handleReject(e.id)}
                              className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        {e.status === 'aprobado' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            <BadgeCheck className="w-3.5 h-3.5" /> Listo para Cobro
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === e.id && (
                    <tr className="bg-slate-50/60">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Detalle de Ítems</div>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-extrabold">
                                  <tr>
                                    <th className="px-3 py-2">Descripción</th>
                                    <th className="px-3 py-2">Cant</th>
                                    <th className="px-3 py-2 text-right">P. Unit</th>
                                    <th className="px-3 py-2 text-right">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {e.items.map((it) => (
                                    <tr key={it.id}>
                                      <td className="px-3 py-2 font-medium text-slate-700">{it.description}</td>
                                      <td className="px-3 py-2">{it.quantity}</td>
                                      <td className="px-3 py-2 text-right font-mono">{formatCLP(it.unitPriceCLP)}</td>
                                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">{formatCLP(it.quantity * it.unitPriceCLP)}</td>
                                    </tr>
                                  ))}
                                  <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                                    <td colSpan={3} className="px-3 py-2 text-right uppercase">Neto</td>
                                    <td className="px-3 py-2 text-right font-mono">{formatCLP(subtotal(e))}</td>
                                  </tr>
                                  <tr className="font-bold text-slate-900">
                                    <td colSpan={3} className="px-3 py-2 text-right uppercase">IVA 19%</td>
                                    <td className="px-3 py-2 text-right font-mono">{formatCLP(totalWithIVA(e) - subtotal(e))}</td>
                                  </tr>
                                  <tr className="bg-emerald-50 border-t border-emerald-200 font-black text-emerald-800">
                                    <td colSpan={3} className="px-3 py-2 text-right uppercase">Total</td>
                                    <td className="px-3 py-2 text-right font-mono">{formatCLP(totalWithIVA(e))}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            {e.note && (
                              <p className="mt-2 text-[11px] text-slate-500 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                                <strong>Nota:</strong> {e.note}
                              </p>
                            )}
                            <div className="mt-2 text-[11px] text-slate-400">
                              Profesional: <strong>{e.professionalName}</strong>
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                              Pagos & Anticipos
                            </div>
                            {payments.filter((p) => p.estimateId === e.id).length === 0 ? (
                              <div className="text-xs text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl px-4 py-6 text-center">
                                Sin pagos registrados para esta estimación.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {payments.filter((p) => p.estimateId === e.id).map((p) => (
                                  <div key={p.id} className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
                                    <div>
                                      <div className="text-xs font-bold text-slate-800">{p.concept}</div>
                                      <div className="text-[10px] text-slate-500">{p.paidAt} · {paymentMethodLabels[p.method]} · {p.referenceNumber || ''}</div>
                                    </div>
                                    <div className="font-mono font-bold text-emerald-700 text-xs">{formatCLP(p.amountCLP)}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="mt-3 text-right text-xs text-slate-500">
                              Por cobrar: <span className="font-mono font-black text-slate-900">{formatCLP(totalWithIVA(e) - payments.filter((p) => p.estimateId === e.id).reduce((a, p) => a + p.amountCLP, 0))}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Estimación */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl p-6 space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Crear Presupuesto / Cotización
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateEstimate} className="space-y-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Validez hasta</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Moneda</label>
                  <div className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-500">CLP (Peso Chileno)</div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Ítems del Presupuesto *</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Agregar Ítem
                  </button>
                </div>
                <div className="space-y-2">
                  {newItems.map((it) => (
                    <div key={it.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={it.description}
                        onChange={(ev) => updateItem(it.id, { description: ev.target.value })}
                        placeholder="Descripción del servicio / producto"
                        className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      />
                      <input
                        type="number"
                        value={it.quantity}
                        min={1}
                        onChange={(ev) => updateItem(it.id, { quantity: Number(ev.target.value) || 1 })}
                        className="w-16 px-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-center"
                      />
                      <input
                        type="number"
                        value={it.unitPriceCLP}
                        min={0}
                        onChange={(ev) => updateItem(it.id, { unitPriceCLP: Number(ev.target.value) || 0 })}
                        placeholder="Precio CLP"
                        className="w-32 px-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      />
                      <button type="button" onClick={() => removeItem(it.id)} className="text-rose-500 hover:text-rose-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end items-center gap-4 text-sm">
                  <span className="text-xs text-slate-500">Neto: <strong className="font-mono">{formatCLP(newItemsSubtotal)}</strong></span>
                  <span className="text-xs text-slate-500">IVA 19%: <strong className="font-mono">{formatCLP(Math.round(newItemsSubtotal * 0.19))}</strong></span>
                  <span className="text-xs font-black text-slate-900">Total: <strong className="font-mono">{formatCLP(Math.round(newItemsSubtotal * 1.19))}</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nota para el Tutor ({'Ley 21.020'} - Consentimiento)</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={2}
                  placeholder="Condiciones, vigencia, forma de pago, etc."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Guardar Presupuesto (Pendiente Aprobación)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

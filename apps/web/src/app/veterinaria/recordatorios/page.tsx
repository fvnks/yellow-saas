'use client';

import React, { useState } from 'react';
import { Bell, Syringe, Shield, Send, CheckCircle2, Plus, Loader2 } from 'lucide-react';
import { useReminders } from '../hooks/use-reminders';
import { getApiClient } from '@/lib/api-client';

export default function VeterinaryRemindersPage() {
  const { data: reminders, loading, refresh } = useReminders();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'vacuna',
    patientName: '',
    clientName: '',
    clientPhone: '',
    description: '',
    dueDate: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.patientName) return;

    try {
      const api = getApiClient();
      await api.createVetReminder(formData);
      refresh();
      setShowModal(false);
      setFormData({ title: '', type: 'vacuna', patientName: '', clientName: '', clientPhone: '', description: '', dueDate: '' });
    } catch (err) {
      console.error('Error creating reminder:', err);
    }
  };

  const handleMarkComplete = async (id: string) => {
    try {
      const api = getApiClient();
      await api.updateVetReminder(id, { status: 'completed' });
      refresh();
    } catch (err) {
      console.error('Error completing reminder:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const api = getApiClient();
      await api.deleteVetReminder(id);
      refresh();
    } catch (err) {
      console.error('Error deleting reminder:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-80 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-slate-100 rounded-lg animate-pulse mt-2" />
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-5 border-b border-slate-100 flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-64 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-8 w-24 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Recordatorios & Notificaciones Preventivas
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Alertas de revacunación, controles periódicos y vencimiento de antiparasitarios.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo Recordatorio
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {reminders.map((rem: any) => (
            <div key={rem.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{rem.title}</h3>
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded border border-amber-200 uppercase">
                    {rem.type}
                  </span>
                  {rem.status === 'completed' && (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded border border-emerald-200 uppercase">
                      Completado
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Paciente:</strong> {rem.patientName} • <strong>Tutor:</strong> {rem.clientName} ({rem.clientPhone})
                </p>
                <p className="text-xs text-slate-500">{rem.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                  Vence: {rem.dueDate}
                </span>
                {rem.status !== 'completed' && (
                  <button
                    onClick={() => handleMarkComplete(rem.id)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl transition-all border border-emerald-200 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completar
                  </button>
                )}
                <button className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  Enviar WhatsApp/SMS
                </button>
                <button
                  onClick={() => handleDelete(rem.id)}
                  className="text-slate-400 hover:text-rose-500 text-xs font-bold px-2 py-2 rounded-xl transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Nuevo Recordatorio</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej. Refuerzo vacuna antirrábica"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="vacuna">Vacuna</option>
                    <option value="desparasitacion">Desparasitación</option>
                    <option value="control">Control</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fecha de Vencimiento *</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Paciente *</label>
                  <input
                    type="text"
                    required
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="Nombre del paciente"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tutor</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Nombre del tutor"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles del recordatorio..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-sm"
                >
                  Guardar Recordatorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { Bell, Syringe, Shield, Send, CheckCircle2 } from 'lucide-react';
import { INITIAL_REMINDERS } from '../lib/veterinary-store';

export default function VeterinaryRemindersPage() {
  const reminders = INITIAL_REMINDERS;

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
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {reminders.map((rem) => (
            <div key={rem.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{rem.title}</h3>
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded border border-amber-200 uppercase">
                    {rem.type}
                  </span>
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
                <button className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  Enviar WhatsApp/SMS
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

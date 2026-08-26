'use client';

import { useState } from 'react';
import {
  MessageSquare, Mail, Send, CheckCircle2, Phone, Sparkles,
  Copy, ExternalLink, Users, FileText
} from 'lucide-react';
import { INITIAL_UNITS, CondoUnit, formatCLP } from '@/lib/condominio-client';

export default function ComunicacionesPage() {
  const [selectedUnit, setSelectedUnit] = useState<CondoUnit>(INITIAL_UNITS[1] || INITIAL_UNITS[0]); // Dpto 102 (pend)
  const [messageType, setMessageType] = useState<'aviso' | 'mora' | 'asamblea'>('aviso');
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Template generators
  const getWhatsAppMessage = () => {
    const ownerName = selectedUnit?.ownerName || 'Copropietario';
    const unitNum = selectedUnit?.number || 'Unidad';
    const balance = selectedUnit?.unpaidBalanceCLP || 0;

    if (messageType === 'mora') {
      return `Estimado/a ${ownerName}, le saludamos de la Administración del Condominio. Le recordamos que mantiene un saldo adeudado de ${formatCLP(balance)} en la unidad ${unitNum}. Agradecemos regularizar su pago para evitar intereses por mora. Saludos cordiales.`;
    }
    if (messageType === 'asamblea') {
      return `Estimado/a copropietario/a ${ownerName} (${unitNum}), le convocamos cordialmente a la Asamblea General Ordinaria de Copropietarios a realizarse este sábado a las 11:00 hrs en el Salón de Eventos del Condominio. ¡Su asistencia es indispensable!`;
    }
    return `Estimado/a ${ownerName}, se ha emitido el aviso de cobro de Gastos Comunes correspondiente a este mes para ${unitNum}. El total a pagar es de ${formatCLP(balance || 112500)}. Puede descargar su comprobante en el portal de residentes.`;
  };

  const currentMessage = getWhatsAppMessage();

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleSendEmailDemo = () => {
    setEmailSentSuccess(true);
    setTimeout(() => setEmailSentSuccess(false), 3000);
  };

  const cleanPhone = selectedUnit.ownerPhone.replace(/[^0-9]/g, '');
  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(currentMessage)}`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Comunicaciones & Notificaciones
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-cyan-50 text-cyan-700 border border-cyan-200">
            WhatsApp & Email
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Envío de avisos de cobro de gastos comunes, cobros por mora y citaciones a asamblea de copropietarios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipient Selector */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-600" />
            Seleccionar Copropietario
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Unidad Destino</label>
            <select
              value={selectedUnit.id}
              onChange={(e) => {
                const u = INITIAL_UNITS.find((x) => x.id === e.target.value);
                if (u) setSelectedUnit(u);
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
            >
              {INITIAL_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.number} - {u.ownerName} ({u.status})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
            <p className="text-slate-500 font-medium">Datos de Contacto:</p>
            <p className="font-bold text-slate-900">{selectedUnit.ownerName}</p>
            <p className="text-slate-600">Email: {selectedUnit.ownerEmail}</p>
            <p className="text-slate-600">WhatsApp: {selectedUnit.ownerPhone}</p>
            <p className="text-slate-600">Deuda Actual: <strong className="text-rose-600">{formatCLP(selectedUnit.unpaidBalanceCLP)}</strong></p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Notificación</label>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setMessageType('aviso')}
                className={`w-full p-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                  messageType === 'aviso'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                1. Aviso de Cobro Gastos Comunes
              </button>

              <button
                type="button"
                onClick={() => setMessageType('mora')}
                className={`w-full p-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                  messageType === 'mora'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                2. Recordatorio Saldo Deudor / Mora
              </button>

              <button
                type="button"
                onClick={() => setMessageType('asamblea')}
                className={`w-full p-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                  messageType === 'asamblea'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                3. Citación Asamblea Copropietarios
              </button>
            </div>
          </div>
        </div>

        {/* Message Preview & WhatsApp Generator */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Vista Previa del Mensaje
              </h2>

              <button
                onClick={handleCopyMessage}
                className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedSuccess ? '¡Copiado!' : 'Copiar Texto'}
              </button>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200/80 p-4 rounded-2xl font-sans text-xs text-slate-800 leading-relaxed">
              <div className="flex items-center gap-2 mb-2 font-bold text-emerald-800 text-[11px]">
                <Phone className="w-3.5 h-3.5" />
                Mensaje formateado para WhatsApp / Correo
              </div>
              <p className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs font-medium">
                {currentMessage}
              </p>
            </div>

            {emailSentSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ¡Correo enviado exitosamente a {selectedUnit.ownerEmail}! (Modo Demo)
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
            >
              <MessageSquare className="w-4 h-4" />
              Abrir WhatsApp Directo
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>

            <button
              onClick={handleSendEmailDemo}
              className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
            >
              <Mail className="w-4 h-4 text-cyan-400" />
              Enviar Notificación por Correo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
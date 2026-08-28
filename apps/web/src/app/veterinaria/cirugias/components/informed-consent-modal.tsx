'use client';

import React, { useState } from 'react';
import { ShieldCheck, FileText, Printer, CheckCircle2, AlertTriangle, Download } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  species: string;
  breed: string;
  clientName: string;
  clientRut: string;
  surgeryName: string;
  surgeonName: string;
}

export default function InformedConsentModal({
  isOpen,
  onClose,
  patientName,
  species,
  breed,
  clientName,
  clientRut,
  surgeryName,
  surgeonName,
}: Props) {
  const [signed, setSigned] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Consentimiento Informado Quirúrgico & Anestésico (Ley 21.020)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
            ✕
          </button>
        </div>

        {/* Legal Text Body */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-3 leading-relaxed">
          <p className="font-bold text-slate-900">
            DECLARACIÓN JURADA Y AUTORIZACIÓN EXPRESA DEL TUTOR RESPONSABLE
          </p>

          <p>
            Yo, <strong className="text-slate-900">{clientName}</strong>, Cédula de Identidad RUT <strong className="text-slate-900">{clientRut}</strong>, en mi calidad de tutor/a o representante legal de la mascota de nombre <strong className="text-slate-900">{patientName}</strong> ({species}, {breed}), declaro por el presente documento:
          </p>

          <ol className="list-decimal pl-4 space-y-1.5 font-medium">
            <li>
              Haber sido plenamente informado/a por el/la Médico/a Veterinario/a <strong className="text-slate-900">{surgeonName}</strong> sobre la naturaleza, objetivos y riesgos del procedimiento quirúrgico denominado <strong className="text-emerald-700 font-bold">{surgeryName}</strong>.
            </li>
            <li>
              Comprender que todo procedimiento anestésico y quirúrgico conlleva riesgos inherentes imponderables (tales como choque anafiláctico, paro cardiorrespiratorio o reacciones idiosincrásicas a fármacos), aun cuando se apliquen los más estrictos protocolos de monitoreo multiparámetro.
            </li>
            <li>
              Autorizar expresamente la administración de anestesia general, sedación, fluidoterapia e intervenciones de urgencia que el equipo médico considere necesarias para salvaguardar la vida de la paciente.
            </li>
            <li>
              Aceptar cumplir rigurosamente las indicaciones médicas de cuidado post-operatorio (uso de collar isabelino, administración de analgésicos y reposo).
            </li>
          </ol>
        </div>

        {/* Digital Signature Confirmation */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h5 className="font-bold text-amber-900 uppercase">Firma Digital Registrada</h5>
            <p className="text-amber-800 font-medium">
              Al hacer clic en aceptar, se estampará la firma y huella digital con sello de tiempo del tutor y profesional.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={() => window.print()}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir Consentimiento PDF
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                setSigned(true);
                setTimeout(onClose, 800);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {signed ? 'Autorizado Expresamente' : 'Confirmar & Autorizar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, FileCheck, Key, CheckCircle2, Lock, Download, Plus, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function FEASettingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFEAData();
  }, []);

  async function fetchFEAData() {
    try {
      setLoading(true);
      const res = await fetch('/api/signature/fea');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error('Error fetching FEA data', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Motor de Firma Electrónica Avanzada (FEA Ley 19.799)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Ley 19.799 Válida
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Gestión de certificados digitales (e-Certchile, Acepta, TocPay) para firma legal de contratos, finiquitos y actas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.success('Importador de Certificado .PFX iniciado')}
            className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Cargar Certificado Digital (.PFX)
          </button>
        </div>
      </div>

      {/* Certificates Active */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-slate-600" /> Certificados FEA Certificados y Vigentes
          </h3>
          <span className="text-xs font-bold text-slate-500">{data?.certificates?.length || 0} certificados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Proveedor Certificador</th>
                <th className="px-6 py-3">Titular / RUT</th>
                <th className="px-6 py-3">Vigencia Hasta</th>
                <th className="px-6 py-3">Estado FEA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.certificates?.map((cert: any) => (
                <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{cert.provider}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{cert.subject_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{cert.subject_rut}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">{cert.valid_until}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                      <CheckCircle2 className="w-3 h-3" /> Activo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signed Documents History */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-slate-600" /> Registro Auditado de Documentos Firmados
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Documento</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Fecha y Hora Firma</th>
                <th className="px-6 py-3">Hash SHA-256 Validado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.signedDocuments?.map((doc: any) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{doc.title}</td>
                  <td className="px-6 py-4 capitalize font-semibold text-slate-600">{doc.type?.replace('_', ' ')}</td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-800">{doc.signed_at}</td>
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-500 truncate max-w-xs">{doc.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

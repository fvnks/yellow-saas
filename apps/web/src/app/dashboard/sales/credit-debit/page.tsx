'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle2, ShieldCheck, DollarSign, RotateCcw, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

export default function CreditDebitNotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [dteType, setDteType] = useState('61');
  const [referencedFolio, setReferencedFolio] = useState('');
  const [refCode, setRefCode] = useState('1');
  const [refReason, setRefReason] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerRut, setCustomerRut] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/sales/dte/credit-debit');
      const json = await res.json();
      if (json.success && json.data) {
        setNotes(json.data);
      }
    } catch (e) {
      console.error('Error fetching credit/debit notes', e);
    } finally {
      setLoading(false);
    }
  }

  const handleIssueNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sales/dte/credit-debit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dte_type: dteType,
          referenced_folio: referencedFolio,
          ref_code: refCode,
          ref_reason: refReason,
          customer_name: customerName,
          customer_rut: customerRut,
          total_amount_clp: amount
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setShowModal(false);
        setReferencedFolio('');
        setRefReason('');
        setCustomerName('');
        setCustomerRut('');
        setAmount('');
        fetchData();
      } else {
        toast.error(json.error || 'Error al emitir DTE');
      }
    } catch (e) {
      toast.error('Error al conectar con servidor DTE');
    }
  };

  const clp = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Notas de Crédito (DTE 61) & Notas de Débito (DTE 56) SII
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              Timbraje DTE SII
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Anulación, corrección de texto o montos sobre Facturas y Boletas Electrónicas (Art. 57 LIVA Chile).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Emitir Nota DTE SII
          </button>
        </div>
      </div>

      {/* DTE List Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-slate-600" /> Historial de Notas de Crédito & Débito SII
          </h3>
          <span className="text-xs font-bold text-slate-500">{notes.length} documentos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Tipo & Folio DTE</th>
                <th className="px-6 py-3">Factura Referenciada</th>
                <th className="px-6 py-3">Código & Motivo SII</th>
                <th className="px-6 py-3">Cliente / RUT</th>
                <th className="px-6 py-3">Monto CLP</th>
                <th className="px-6 py-3">Estado SII</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notes.map((note) => (
                <tr key={note.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">
                    <div>{note.type_label}</div>
                    <div className="text-[11px] text-slate-500">Folio N° {note.folio}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-800">
                    Factura N° {note.referenced_folio}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">Código [{note.ref_code}]</div>
                    <div className="text-[11px] text-slate-500">{note.ref_reason}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{note.customer_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{note.customer_rut}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{clp(note.total_amount_clp)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                      <ShieldCheck className="w-3 h-3" /> Aceptado SII
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Emitir Nota de Crédito / Débito DTE</h3>
            <form onSubmit={handleIssueNote} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Documento DTE</label>
                <select
                  value={dteType}
                  onChange={(e) => setDteType(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="61">DTE 61 - Nota de Crédito Electrónica</option>
                  <option value="56">DTE 56 - Nota de Débito Electrónica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Folio Factura Referenciada</label>
                <input
                  type="number"
                  required
                  placeholder="Ej: 1092"
                  value={referencedFolio}
                  onChange={(e) => setReferencedFolio(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Código de Referencia SII</label>
                <select
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="1">1 - Anula Documento de Referencia</option>
                  <option value="2">2 - Corrige Texto del Documento</option>
                  <option value="3">3 - Corrige Monto</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motivo de la Modificación</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Devolución parcial de productos"
                  value={refReason}
                  onChange={(e) => setRefReason(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cliente / Razon Social</label>
                  <input
                    type="text"
                    required
                    placeholder="Cliente SpA"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RUT Cliente</label>
                  <input
                    type="text"
                    required
                    placeholder="76.123.456-7"
                    value={customerRut}
                    onChange={(e) => setCustomerRut(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monto Total CLP</label>
                <input
                  type="number"
                  required
                  placeholder="100000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-semibold rounded-xl text-xs shadow-xs"
                >
                  Timbrar y Emitir DTE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

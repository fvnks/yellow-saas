'use client';

import { useState, useEffect } from 'react';
import { Handshake, Plus, ShieldCheck, Clock, CheckCircle2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function FactoringPage() {
  const [cessions, setCessions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [invoiceFolio, setInvoiceFolio] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerRut, setCustomerRut] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [factoringHouse, setFactoringHouse] = useState('Tanner Factoring S.A.');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/finance/factoring');
      const json = await res.json();
      if (json.success) {
        setCessions(json.data);
        setSummary(json.summary);
      }
    } catch (e) {
      console.error('Error fetching factoring', e);
    } finally {
      setLoading(false);
    }
  }

  const handleCede = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/factoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_folio: invoiceFolio,
          customer_name: customerName,
          customer_rut: customerRut,
          invoice_amount: invoiceAmount,
          factoring_house: factoringHouse
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setShowModal(false);
        setInvoiceFolio(''); setCustomerName(''); setCustomerRut(''); setInvoiceAmount('');
        fetchData();
      } else {
        toast.error(json.error || 'Error al ceder factura');
      }
    } catch {
      toast.error('Error al conectar con servidor AEC');
    }
  };

  const clp = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  const statusBadge = (s: string) => {
    if (s === 'cobrada') return { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Cobrada' };
    if (s === 'cedida') return { cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: ShieldCheck, label: 'Cedida AEC' };
    return { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'En Evaluación' };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Cesión de Facturas (Factoring AEC)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              Archivo Electrónico de Cesión
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Cesión de DTE 33 a factoring (Tanner, BancoEstado) con envío AEC al SII y anticipo de liquidez.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ceder Factura AEC
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Cedido</p>
            <p className="text-lg font-black text-slate-900 mt-1">{clp(summary.total_ceded)}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Anticipo Recibido</p>
            <p className="text-lg font-black text-emerald-700 mt-1">{clp(summary.total_advanced)}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Comisión Factoring</p>
            <p className="text-lg font-black text-rose-600 mt-1">{clp(summary.total_commission)}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Neto Recibido</p>
            <p className="text-lg font-black text-blue-700 mt-1">{clp(summary.total_net_received)}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Handshake className="w-4 h-4 text-slate-600" /> Cesiones AEC Activas
          </h3>
          <span className="text-xs font-bold text-slate-500">{cessions.length} cesiones</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Factura DTE</th>
                <th className="px-6 py-3">Deudor / RUT</th>
                <th className="px-6 py-3">Casa Factoring</th>
                <th className="px-6 py-3">Monto / Anticipo</th>
                <th className="px-6 py-3">Comisión</th>
                <th className="px-6 py-3">Neto</th>
                <th className="px-6 py-3">Estado AEC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cessions.map((c) => {
                const badge = statusBadge(c.status);
                const Icon = badge.icon;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">
                      <div>N° {c.invoice_folio}</div>
                      <div className="text-[11px] text-slate-500 font-sans">{c.cession_date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{c.customer_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{c.customer_rut}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{c.factoring_house}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{c.factoring_rut}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-slate-900">{clp(c.invoice_amount)}</div>
                      <div className="text-[11px] text-emerald-600 font-mono">{Math.round(c.advance_rate * 100)}% → {clp(c.advance_amount)}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-rose-600">{clp(c.commission_amount)}</td>
                    <td className="px-6 py-4 font-mono font-extrabold text-blue-700">{clp(c.net_received)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1 w-max ${badge.cls}`}>
                        <Icon className="w-3 h-3" /> {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Ceder Factura (AEC SII)</h3>
            <form onSubmit={handleCede} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Folio Factura DTE 33</label>
                <input type="number" required value={invoiceFolio} onChange={(e) => setInvoiceFolio(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deudor</label>
                  <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RUT Deudor</label>
                  <input required placeholder="76.123.456-7" value={customerRut} onChange={(e) => setCustomerRut(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monto Factura CLP</label>
                <input type="number" required value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Casa de Factoring</label>
                <select value={factoringHouse} onChange={(e) => setFactoringHouse(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900">
                  <option>Tanner Factoring S.A.</option>
                  <option>Banco Estado Factoring</option>
                  <option>BCI Factoring</option>
                  <option>Santander Factoring</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-semibold rounded-xl text-xs shadow-xs">Enviar AEC al SII</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

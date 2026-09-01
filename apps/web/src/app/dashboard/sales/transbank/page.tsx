'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Plus, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TransbankPage() {
  const [txns, setTxns] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [customerName, setCustomerName] = useState('');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/payments/transbank');
      const json = await res.json();
      if (json.success) {
        setTxns(json.data);
        setSummary(json.summary);
      }
    } catch (e) {
      console.error('Error fetching Transbank', e);
    } finally {
      setLoading(false);
    }
  }

  const handleInit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payments/transbank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, customer_name: customerName })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setShowModal(false);
        setAmount(''); setCustomerName('');
      } else {
        toast.error(json.error || 'Error al iniciar Webpay');
      }
    } catch {
      toast.error('Error al conectar con Transbank');
    }
  };

  const clp = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Transbank Webpay Plus
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-50 text-red-700 border border-red-200">
              Pasarela Chile
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Cobros con débito Redcompra, crédito y cuotas. Conciliación automática con DTE emitido.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Iniciar Pago Webpay
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Autorizadas</p>
            <p className="text-lg font-black text-emerald-700 mt-1">{summary.authorized_count}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monto Autorizado</p>
            <p className="text-lg font-black text-slate-900 mt-1">{clp(summary.authorized_amount)}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rechazadas</p>
            <p className="text-lg font-black text-rose-600 mt-1">{summary.rejected_count}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monto Rechazado</p>
            <p className="text-lg font-black text-rose-600 mt-1">{clp(summary.rejected_amount)}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-600" /> Transacciones Webpay
          </h3>
          <span className="text-xs font-bold text-slate-500">{txns.length} transacciones</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Orden / Auth</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Medio</th>
                <th className="px-6 py-3">Tarjeta</th>
                <th className="px-6 py-3">Monto CLP</th>
                <th className="px-6 py-3">DTE</th>
                <th className="px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {txns.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono">
                    <div className="font-bold text-blue-600">{t.buy_order}</div>
                    <div className="text-[11px] text-slate-500">Auth {t.authorization_code || '—'}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{t.customer_name}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{t.payment_type_label}{t.installments > 1 ? ` (${t.installments}c)` : ''}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">**** {t.card_last4}</td>
                  <td className="px-6 py-4 font-mono font-extrabold text-slate-900">{clp(t.amount)}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">{t.dte_folio ? `N° ${t.dte_folio}` : '—'}</td>
                  <td className="px-6 py-4">
                    {t.status === 'autorizada' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3 h-3" /> Autorizada
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-max">
                        <AlertTriangle className="w-3 h-3" /> Rechazada
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Iniciar Pago Webpay Plus</h3>
            <form onSubmit={handleInit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cliente</label>
                <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monto CLP</label>
                <input type="number" required min={1} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-semibold rounded-xl text-xs shadow-xs">Generar Token Webpay</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

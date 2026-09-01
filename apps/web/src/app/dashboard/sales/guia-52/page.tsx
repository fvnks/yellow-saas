'use client';

import { useState, useEffect } from 'react';
import { Truck, Plus, ShieldCheck, Clock, MapPin, FileText } from 'lucide-react';
import { toast } from 'sonner';

const TRANSFER_TYPES = [
  { value: '1', label: '1 - Operación constituye venta' },
  { value: '2', label: '2 - Ventas por efectuar' },
  { value: '3', label: '3 - Consignaciones' },
  { value: '4', label: '4 - Entrega gratuita' },
  { value: '5', label: '5 - Traslados internos' },
  { value: '6', label: '6 - Otros traslados no venta' },
];

export default function Guia52Page() {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerRut, setCustomerRut] = useState('');
  const [destination, setDestination] = useState('');
  const [transferType, setTransferType] = useState('1');
  const [netAmount, setNetAmount] = useState('');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/sales/dte/guia-52');
      const json = await res.json();
      if (json.success) setGuides(json.data);
    } catch (e) {
      console.error('Error fetching DTE 52', e);
    } finally {
      setLoading(false);
    }
  }

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sales/dte/guia-52', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_rut: customerRut,
          destination,
          transfer_type: transferType,
          transfer_label: TRANSFER_TYPES.find((t) => t.value === transferType)?.label,
          net_amount: netAmount
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setShowModal(false);
        setCustomerName(''); setCustomerRut(''); setDestination(''); setNetAmount('');
        fetchData();
      } else {
        toast.error(json.error || 'Error al emitir DTE 52');
      }
    } catch {
      toast.error('Error al conectar con servidor DTE');
    }
  };

  const clp = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  const dispatchBadge = (s: string) => {
    if (s === 'entregado') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'en_transito') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Guía de Despacho Electrónica (DTE 52)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              Timbraje SII
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Traslado de mercaderías con indicación de tipo de traslado SII (venta, consignación, interno).
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Emitir DTE 52
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-slate-600" /> Guías Electrónicas Timbradas
          </h3>
          <span className="text-xs font-bold text-slate-500">{guides.length} documentos</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Folio DTE 52</th>
                <th className="px-6 py-3">Receptor / Destino</th>
                <th className="px-6 py-3">Tipo Traslado SII</th>
                <th className="px-6 py-3">Factura Ref.</th>
                <th className="px-6 py-3">Monto CLP</th>
                <th className="px-6 py-3">Estado SII</th>
                <th className="px-6 py-3">Despacho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {guides.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">
                    <div>N° {g.folio}</div>
                    <div className="text-[11px] text-slate-500 font-sans">{g.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{g.customer_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{g.customer_rut}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {g.destination}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">{g.transfer_label}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">{g.referenced_invoice ? `N° ${g.referenced_invoice}` : '—'}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{g.total_amount ? clp(g.total_amount) : 'Traslado'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                      <ShieldCheck className="w-3 h-3" /> Aceptado SII
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border capitalize ${dispatchBadge(g.dispatch_status)}`}>
                      {g.dispatch_status.replace('_', ' ')}
                    </span>
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
            <h3 className="text-lg font-black text-slate-900">Emitir Guía DTE 52</h3>
            <form onSubmit={handleIssue} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Traslado SII</label>
                <select value={transferType} onChange={(e) => setTransferType(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900">
                  {TRANSFER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Receptor / Razón Social</label>
                <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">RUT Receptor</label>
                <input required placeholder="76.123.456-7" value={customerRut} onChange={(e) => setCustomerRut(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dirección de Destino</label>
                <input required value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monto Neto CLP (0 si traslado interno)</label>
                <input type="number" value={netAmount} onChange={(e) => setNetAmount(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-semibold rounded-xl text-xs shadow-xs">Timbrar DTE 52</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

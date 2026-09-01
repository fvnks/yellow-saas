'use client';

import { useState, useEffect } from 'react';
import { Wrench, Plus, Clock, CheckCircle2, AlertTriangle, User } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerRut, setCustomerRut] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [technician, setTechnician] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [billableAmount, setBillableAmount] = useState('');
  const [priority, setPriority] = useState('media');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/services/work-orders');
      const json = await res.json();
      if (json.success) setOrders(json.data);
    } catch (e) {
      console.error('Error fetching work orders', e);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/services/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_rut: customerRut,
          service_type: serviceType,
          technician,
          scheduled_date: scheduledDate,
          billable_amount: billableAmount,
          priority
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setShowModal(false);
        setCustomerName(''); setCustomerRut(''); setServiceType(''); setTechnician(''); setScheduledDate(''); setBillableAmount('');
        fetchData();
      } else {
        toast.error(json.error || 'Error al crear OT');
      }
    } catch {
      toast.error('Error al conectar con servidor');
    }
  };

  const clp = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  const statusBadge = (s: string) => {
    if (s === 'facturada') return { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Facturada' };
    if (s === 'en_curso') return { cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock, label: 'En Curso' };
    return { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'Programada' };
  };

  const priorityBadge = (p: string) => {
    if (p === 'urgente') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (p === 'alta') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Órdenes de Trabajo & Servicios
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
              Field Service
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Programación de técnicos, control de horas/materiales y facturación DTE al cierre de la OT.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Orden de Trabajo
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-slate-600" /> Órdenes de Servicio
          </h3>
          <span className="text-xs font-bold text-slate-500">{orders.length} órdenes</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">N° OT</th>
                <th className="px-6 py-3">Cliente / Servicio</th>
                <th className="px-6 py-3">Técnico</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Horas</th>
                <th className="px-6 py-3">Costo / Facturable</th>
                <th className="px-6 py-3">Prioridad</th>
                <th className="px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => {
                const badge = statusBadge(o.status);
                const Icon = badge.icon;
                return (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{o.order_number}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{o.customer_name}</div>
                      <div className="text-[11px] text-slate-500">{o.service_type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-bold text-slate-800">
                        <User className="w-3 h-3" /> {o.technician}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">{o.scheduled_date}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{o.hours_actual || 0} / {o.hours_estimated}h</td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-slate-500">{clp(o.total_cost)}</div>
                      <div className="font-mono font-extrabold text-emerald-700">{clp(o.billable_amount)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border capitalize ${priorityBadge(o.priority)}`}>
                        {o.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1 w-max ${badge.cls}`}>
                        <Icon className="w-3 h-3" /> {badge.label}
                      </span>
                      {o.dte_folio && <div className="text-[10px] text-slate-500 font-mono mt-0.5">DTE N° {o.dte_folio}</div>}
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
            <h3 className="text-lg font-black text-slate-900">Nueva Orden de Trabajo</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cliente</label>
                  <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RUT</label>
                  <input required placeholder="76.123.456-7" value={customerRut} onChange={(e) => setCustomerRut(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Servicio</label>
                <input required value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Técnico</label>
                  <input required value={technician} onChange={(e) => setTechnician(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fecha Programada</label>
                  <input type="date" required value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monto Facturable CLP</label>
                  <input type="number" value={billableAmount} onChange={(e) => setBillableAmount(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prioridad</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900">
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-semibold rounded-xl text-xs shadow-xs">Crear OT</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

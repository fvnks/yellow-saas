'use client';

import { useState } from 'react';
import { Receipt, FileText, CheckCircle2, Download, Printer, RefreshCw, Search, ShieldCheck, DollarSign, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { INITIAL_BOLETAS_DTE, INITIAL_ORDERS } from '../lib/restaurant-store';
import { useRestaurantRole } from '../lib/role-context';
import RoleProtected from '../components/role-protected';

interface DteBoleta {
  id: string;
  folio: number;
  tableName: string;
  waiterName: string;
  dateTime: string;
  netoCLP: number;
  ivaCLP: number;
  tipCLP: number;
  totalCLP: number;
  paymentMethod: 'Transbank DB' | 'Efectivo' | 'MercadoPago QR' | 'Transbank CR';
  siiStatus: 'Aceptado SII' | 'Pendiente' | 'Rechazado';
  tedCode: string;
}

export default function RestaurantSalesPage() {
  const [boletas, setBoletas] = useState<DteBoleta[]>(INITIAL_BOLETAS_DTE);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBoleta, setSelectedBoleta] = useState<DteBoleta | null>(null);
  const { canAccess } = useRestaurantRole();
  if (!canAccess('sales')) return <RoleProtected section="sales"><div /></RoleProtected>;

  const formatCLP = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  const filtered = boletas.filter(
    b =>
      b.folio.toString().includes(searchTerm) ||
      b.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.waiterName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = (b: DteBoleta) => {
    toast.success(`Enviando Boleta Electrónica SII N° ${b.folio} a Impresora Térmica POS...`);
  };

  const handleDownloadXml = (b: DteBoleta) => {
    toast.success(`Descargando XML firmado SII DTE Folio ${b.folio}...`);
  };

  const emitirBoleta = () => {
    const pendingOrders = INITIAL_ORDERS;
    const created: DteBoleta[] = pendingOrders.map((order, idx) => {
      const neto = order.totalCLP;
      const iva = Math.round(neto * 0.19);
      const tip = Math.round(neto * 0.1);
      return {
        id: `bol-${Date.now()}-${idx}`,
        folio: 1300 + boletas.length + idx,
        tableName: order.tableName,
        waiterName: order.waiterName || 'Garzón',
        dateTime: new Date().toLocaleString('es-CL', { hour12: false }),
        netoCLP: neto,
        ivaCLP: iva,
        tipCLP: tip,
        totalCLP: neto + iva + tip,
        paymentMethod: 'Efectivo',
        siiStatus: 'Pendiente',
        tedCode: `TED-${Math.floor(10000 + Math.random() * 89999)}-${Math.floor(10 + Math.random() * 89)}`,
      };
    });
    setBoletas((prev) => [...created, ...prev]);
    toast.success(`Se emitieron ${created.length} boleta(s) DTE desde las órdenes activas del POS.`);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            Boletas Electrónicas SII & Registro de Ventas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Emisión de DTE afecto a IVA (19%), Timbre Electrónico SII (TED) e historial de cobranza.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={emitirBoleta}
            className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-semibold px-3 py-2 rounded-xl text-xs transition-all duration-150 shadow-sm flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" /> Emitir Boletas desde Órdenes POS
          </button>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Conexión Directa SII Activa
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <p className="font-semibold text-slate-500">Total Boletas Emitidas Hoy</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{boletas.length} DTEs</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <p className="font-semibold text-slate-500">Monto Bruto Facturado (CLP)</p>
          <p className="text-xl font-bold text-blue-600 mt-1">
            {formatCLP(boletas.reduce((acc, b) => acc + b.totalCLP, 0))}
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <p className="font-semibold text-slate-500">Propinas Recaudadas (10%)</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {formatCLP(boletas.reduce((acc, b) => acc + b.tipCLP, 0))}
          </p>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por folio, mesa o garzón..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <p className="text-xs text-slate-500 font-medium">Mostrando {filtered.length} boletas</p>
        </div>

        {/* Boletas Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Folio DTE SII</th>
                <th className="py-3 px-4">Mesa / Garzón</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Medio Pago</th>
                <th className="py-3 px-4 text-right">Neto</th>
                <th className="py-3 px-4 text-right">IVA (19%)</th>
                <th className="py-3 px-4 text-right">Propina</th>
                <th className="py-3 px-4 text-right">Total CLP</th>
                <th className="py-3 px-4 text-center">Estado SII</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-xs text-slate-700">No se han registrado boletas electrónicas</p>
                    <p className="text-[11px] text-slate-400">Las boletas emitidas desde el POS Garzón aparecerán automáticamente aquí.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    N° {b.folio}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{b.tableName}</p>
                    <p className="text-[11px] text-slate-500">{b.waiterName}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                    {b.dateTime}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold text-[11px]">
                      {b.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-600">{formatCLP(b.netoCLP)}</td>
                  <td className="py-3.5 px-4 text-right text-slate-600">{formatCLP(b.ivaCLP)}</td>
                  <td className="py-3.5 px-4 text-right text-emerald-600 font-bold">{formatCLP(b.tipCLP)}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 text-sm">
                    {formatCLP(b.totalCLP)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-xl text-[11px] font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Aceptado
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handlePrint(b)}
                        title="Imprimir Boleta Térmica"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownloadXml(b)}
                        title="Descargar XML SII"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

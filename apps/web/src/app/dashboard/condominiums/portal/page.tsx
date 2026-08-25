"use client";
import { useEffect, useState } from "react";
import { 
  Building2, 
  CreditCard, 
  FileText, 
  History, 
  AlertCircle,
  ArrowRight,
  Download,
  ChevronDown
} from "lucide-react";
import { getApiClient } from "@/lib/api-client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ResidentPortal() {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [payments, setPayments] = useState<any[]>([]);
  const [statements, setStatements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load properties
  useEffect(() => {
    const api = getApiClient();
    api.getCondoProperties()
      .then((res) => {
        const props = res.data || [];
        setProperties(props);
        if (props.length > 0) setSelectedPropertyId(props[0].id);
      })
      .catch((err) => console.error("Portal error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Load units when property changes
  useEffect(() => {
    if (!selectedPropertyId) return;
    const api = getApiClient();
    api.getCondoUnits(selectedPropertyId)
      .then((res) => {
        const uList = res.data || [];
        setUnits(uList);
        if (uList.length > 0) setSelectedUnitId(uList[0].id);
        else setSelectedUnitId("");
      })
      .catch((err) => console.error("Units error:", err));
  }, [selectedPropertyId]);

  // Load payments and statements when unit changes
  useEffect(() => {
    if (!selectedPropertyId || !selectedUnitId) {
      setPayments([]);
      setStatements([]);
      return;
    }
    const api = getApiClient();
    Promise.all([
      api.getCondoPayments(selectedPropertyId, selectedUnitId),
      api.request(`/condos/${selectedPropertyId}/statements?limit=50`),
    ])
      .then(([payRes, stmtRes]) => {
        setPayments(payRes || []);
        const unitStmts = (stmtRes.data || []).filter((s: any) => s.unit_id === selectedUnitId);
        setStatements(unitStmts);
      })
      .catch((err) => console.error("Details error:", err));
  }, [selectedPropertyId, selectedUnitId]);

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
  const selectedUnit = units.find((u) => u.id === selectedUnitId);
  const latestStatement = statements[0];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1814F3]"></div></div>;

  if (properties.length === 0) return (
    <div className="bg-white border border-[#E6EFF5] rounded-2xl p-12 text-center">
      <AlertCircle className="w-12 h-12 text-[#FE5C73] mx-auto mb-4" />
      <h2 className="text-xl font-bold text-[#232323]">No se encontró información</h2>
      <p className="text-[#718EBF] mt-2">No tienes propiedades asociadas a tu cuenta actualmente.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#232323]">Portal del Residente</h1>
          <p className="text-sm text-[#718EBF] mt-1">Bienvenido a su portal de copropietario</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-[#1814F3] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 appearance-none cursor-pointer"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1814F3] pointer-events-none" />
          </div>

          {units.length > 0 && (
            <div className="relative">
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-[#1814F3] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 appearance-none cursor-pointer"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>Unidad {u.unit_number}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1814F3] pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-5 col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-[#232323]">Resumen de Cuenta</h3>
            <span className="text-xs text-[#718EBF]">
              {selectedUnit?.resident_name ? `Residente: ${selectedUnit.resident_name}` : ""}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-[10px] text-[#718EBF] uppercase font-bold tracking-wider mb-1">Estado</p>
              {latestStatement?.status === "paid" ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Al día
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Pendiente
                </span>
              )}
            </div>
            <div className="h-10 w-px bg-[#E6EFF5] hidden sm:block"></div>
            <div>
              <p className="text-[10px] text-[#718EBF] uppercase font-bold tracking-wider mb-1">Último Período</p>
              <p className="text-sm font-bold text-[#232323]">
                {latestStatement?.period_date ? format(new Date(latestStatement.period_date), 'MMM yyyy', { locale: es }) : "Sin registros"}
              </p>
            </div>
            <div className="h-10 w-px bg-[#E6EFF5] hidden sm:block"></div>
            <div>
              <p className="text-[10px] text-[#718EBF] uppercase font-bold tracking-wider mb-1">Monto Total</p>
              <p className="text-xl font-bold text-[#232323]">
                $ {latestStatement ? Number(latestStatement.total_amount || 0).toLocaleString('es-CL') : "0"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <button className="w-full bg-[#1814F3] hover:bg-[#1612D3] text-white py-3 rounded-xl text-sm font-medium transition-[background-color,transform] active:scale-[0.98] flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              Pagar Gastos Comunes
            </button>
          </div>
        </div>

        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">Documentos</p>
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#1814F3]" />
            </div>
          </div>
          <div className="space-y-3">
            {statements.slice(0, 3).map((stmt: any) => (
              <div key={stmt.id} className="flex items-center justify-between p-2 hover:bg-[#F5F7FA] rounded-xl transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#718EBF]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#232323]">
                      Colilla {stmt.period_date ? format(new Date(stmt.period_date), 'MMM-yyyy', { locale: es }) : ""}
                    </p>
                    <p className="text-[10px] text-[#718EBF]">${Number(stmt.total_amount || 0).toLocaleString('es-CL')}</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-[#718EBF] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
            {statements.length === 0 && (
              <p className="text-xs text-[#718EBF] text-center py-4">No hay colillas disponibles</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-[#E6EFF5] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#232323]">Historial de Pagos</h3>
          <History className="w-4 h-4 text-[#718EBF]" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E6EFF5]">
                <th className="px-6 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Comprobante</th>
                <th className="px-6 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Método</th>
                <th className="px-6 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EFF5]">
              {payments.map((payment: any) => (
                <tr key={payment.id} className="hover:bg-[#F5F7FA] transition-colors">
                  <td className="px-6 py-4 text-xs text-[#232323]">{format(new Date(payment.payment_date), 'dd MMM, yyyy', { locale: es })}</td>
                  <td className="px-6 py-4 text-xs font-medium text-[#1814F3]">#{payment.id.split('-')[0].toUpperCase()}</td>
                  <td className="px-6 py-4 text-xs font-bold text-[#232323]">$ {Number(payment.amount).toLocaleString('es-CL')}</td>
                  <td className="px-6 py-4 text-xs text-[#718EBF] capitalize">{payment.payment_method}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Confirmado
                    </span>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-[#718EBF]">No hay registros de pagos</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

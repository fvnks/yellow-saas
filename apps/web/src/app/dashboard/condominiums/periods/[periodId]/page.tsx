"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2, Calculator, Save, X } from "lucide-react";
import { getApiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";

const CATEGORIES = [
  { value: "common", label: "Comun" },
  { value: "water", labelconst statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-600 border-slate-200",
    active: "bg-blue-50 text-blue-700 border-blue-200",
    closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

: "Agua" },
  { value: "electricity", label: "Electricidad" },
  { value: "gas", label: "Gas" },
  { value: "maintenance", label: "Mantencion" },
  { value: "security", label: "Seguridad" },
  { value: "other", label: "Otro" },
];

export default function PeriodDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const periodId = params.periodId as string;
  const router = useRouter();
  const [period, setPeriod] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [itemForm, setItemForm] = useState({
    name: "",
    category: "common",
    description: "",
    amount: "",
  });

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.request(`/condos/${propertyId}/periods/${periodId}`),
      api.request(`/condos/${propertyId}`),
      api.request(`/condos/${propertyId}/periods/${periodId}/items`),
    ])
      .then(([periodRes, propRes, itemsRes]) => {
        setPeriod(periodRes.data);
        setProperty(propRes.data);
        setItems(itemsRes.data || []);
      })
      .catch(() => toast.error("Error al cargar periodo"))
      .finally(() => setLoading(false));
  }, [propertyId, periodId]);

  const totalExpenses = items.reduce(
    (sum: number, item: any) => sum + parseFloat(item.amount || "0"),
    0,
  );

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.amount)
      return toast.error("Nombre y monto son obligatorios");
    try {
      const api = getApiClient();
      const res = await api.request(
        `/condos/${propertyId}/periods/${periodId}/items`,
        {
          method: "POST",
          body: JSON.stringify({
            ...itemForm,
            amount: parseFloat(itemForm.amount),
          }),
        },
      );
      setItems((prev) => [...prev, res.data]);
      setItemForm({
        name: "",
        category: "common",
        description: "",
        amount: "",
      });
      setShowAddItem(false);
      toast.success("Gasto agregado");
    } catch {
      toast.error("Error al agregar gasto");
    }
  };

  const handleUpdateItem = async (itemId: string) => {
    try {
      const api = getApiClient();
      const res = await api.request(
        `/condos/${propertyId}/periods/${periodId}/items`,
        {
          method: "PUT",
          body: JSON.stringify({
            itemId,
            ...itemForm,
            amount: parseFloat(itemForm.amount),
          }),
        },
      );
      setItems((prev) => prev.map((i) => (i.id === itemId ? res.data : i)));
      setEditingItem(null);
      setItemForm({
        name: "",
        category: "common",
        description: "",
        amount: "",
      });
      toast.success("Gasto actualizado");
    } catch {
      toast.error("Error al actualizar");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Eliminar este gasto?")) return;
    try {
      const api = getApiClient();
      await api.request(
        `/condos/${propertyId}/periods/${periodId}/items?itemId=${itemId}`,
        { method: "DELETE" },
      );
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      toast.success("Gasto eliminado");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const startEdit = (item: any) => {
    setEditingItem(item.id);
    setItemForm({
      name: item.name,
      category: item.category || "common",
      description: item.description || "",
      amount: String(item.amount),
    });
  };

  const handleCalculate = async () => {
    if (!confirm("Calcular y generar colillas para todas las unidades?"))
      return;
    setCalculating(true);
    try {
      const api = getApiClient();
      await api.request(`/condos/${propertyId}/periods/${periodId}/calculate`, {
        method: "POST",
      });
      toast.success("Colillas generadas correctamente");
    } catch {
      toast.error("Error al calcular");
    } finally {
      setCalculating(false);
    }
  };

  if (loading)
    return <div className="p-6 text-sm text-[#718EBF]">Cargando...</div>;
  if (!period)
    return (
      <div className="p-6 text-sm text-[#FE5C73]">Periodo no encontrado</div>
    );

  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[#F5F7FA] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#718EBF]" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#232323]">
              Periodo{" "}
              {new Date(period.period_date).toLocaleDateString("es-CL", {
                year: "numeric",
                month: "long",
                timeZone: "UTC",
              })}
            </h1>
            <p className="text-sm text-[#718EBF] mt-1">
              {property?.name || ""}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${statusColors[period.status] || statusColors.draft}`}
          >
            {period.status === "draft"
              ? "Borrador"
              : period.status === "active"
                ? "Activo"
                : "Cerrado"}
          </span>
        </div>
        <button
          onClick={handleCalculate}
          disabled={calculating}
          className="bg-[#16DBCC] hover:bg-[#14C4B6] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-[background-color,transform,opacity] duration-150 active:scale-[0.98] disabled:opacity-50"
        >
          <Calculator className="w-4 h-4" />
          {calculating ? "Calculando..." : "Calcular Colillas"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-5">
          <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider mb-1">
            Gastos Registrados
          </p>
          <p className="text-2xl font-bold text-[#232323]">{items.length}</p>
        </div>
        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-5">
          <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider mb-1">
            Total Gastos
          </p>
          <p className="text-2xl font-bold text-[#232323]">
            $ {totalExpenses.toLocaleString("es-CL")}
          </p>
        </div>
        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-5">
          <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider mb-1">
            Fecha Vencimiento
          </p>
          <p className="text-sm font-medium text-[#232323]">
            {period.due_date
              ? new Date(period.due_date).toLocaleDateString("es-CL", {
                  timeZone: "UTC",
                })
              : "No definida"}
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-[#E6EFF5] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#232323]">
            Gastos del Periodo
          </h3>
          <button
            onClick={() => {
              setShowAddItem(true);
              setEditingItem(null);
              setItemForm({
                name: "",
                category: "common",
                description: "",
                amount: "",
              });
            }}
            className="bg-[#1814F3] hover:bg-[#1612D3] text-white px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-[background-color,transform] duration-150 active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar Gasto
          </button>
        </div>

        {showAddItem && (
          <form
            onSubmit={handleAddItem}
            className="px-6 py-4 border-b border-[#E6EFF5] bg-[#F5F7FA]/50"
          >
            <div className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-3 space-y-1">
                <label className="block text-[10px] font-medium text-[#718EBF] uppercase">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, name: e.target.value })
                  }
                  className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150"
                  aria-label="Ej: Mantencion ascensor"
                  placeholder="Ej: Mantencion ascensor"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="block text-[10px] font-medium text-[#718EBF] uppercase">
                  Categoria
                </label>
                <select
                  value={itemForm.category}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, category: e.target.value })
                  }
                  className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-3 space-y-1">
                <label className="block text-[10px] font-medium text-[#718EBF] uppercase">
                  Descripcion
                </label>
                <input
                  type="text"
                  value={itemForm.description}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, description: e.target.value })
                  }
                  className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150"
                  aria-label="Detalle..."
                  placeholder="Detalle..."
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="block text-[10px] font-medium text-[#718EBF] uppercase">
                  Monto *
                </label>
                <input
                  type="number"
                  value={itemForm.amount}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, amount: e.target.value })
                  }
                  className="w-full bg-white border border-[#E6EFF5] rounded-xl px-3 py-2 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors duration-150"
                  aria-label="0"
                  placeholder="0"
                />
              </div>
              <div className="col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="bg-[#1814F3] hover:bg-[#1612D3] text-white px-3 py-2 rounded-xl text-xs font-medium transition-[background-color,transform] duration-150 active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="bg-white border border-[#E6EFF5] hover:bg-[#F5F7FA] text-[#232323] px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-150"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6EFF5]">
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">
                  Nombre
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">
                  Categoria
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">
                  Descripcion
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">
                  Monto
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-medium text-[#718EBF] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-[#718EBF]"
                  >
                    No hay gastos registrados
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#E6EFF5] hover:bg-[#F5F7FA] transition-colors duration-100"
                  >
                    {editingItem === item.id ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={itemForm.name}
                            onChange={(e) =>
                              setItemForm({ ...itemForm, name: e.target.value })
                            }
                            className="w-full bg-white border border-[#E6EFF5] rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#1814F3]/20"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={itemForm.category}
                            onChange={(e) =>
                              setItemForm({
                                ...itemForm,
                                category: e.target.value,
                              })
                            }
                            className="w-full bg-white border border-[#E6EFF5] rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#1814F3]/20"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={itemForm.description}
                            onChange={(e) =>
                              setItemForm({
                                ...itemForm,
                                description: e.target.value,
                              })
                            }
                            className="w-full bg-white border border-[#E6EFF5] rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#1814F3]/20"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={itemForm.amount}
                            onChange={(e) =>
                              setItemForm({
                                ...itemForm,
                                amount: e.target.value,
                              })
                            }
                            className="w-full bg-white border border-[#E6EFF5] rounded-lg px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#1814F3]/20"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => handleUpdateItem(item.id)}
                              className="p-1 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Save className="w-3.5 h-3.5 text-[#16DBCC]" />
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-3.5 h-3.5 text-[#FE5C73]" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-xs font-medium text-[#232323]">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#718EBF] capitalize">
                          {CATEGORIES.find((c) => c.value === item.category)
                            ?.label || item.category}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#718EBF]">
                          {item.description || "-"}
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-[#232323] text-right">
                          $ {parseFloat(item.amount).toLocaleString("es-CL")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => startEdit(item)}
                              className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-[#1814F3] text-xs"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[#FE5C73]" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
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

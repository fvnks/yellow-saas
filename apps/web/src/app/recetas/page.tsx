'use client';

import { useState, useEffect } from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  Play,
  Package,
  Check,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { formatQuantity } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

function formatCurrency(val: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val || 0);
}

export default function RecetasPage() {
  const [formulas, setFormulas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: any = { limit: 100 };
      if (activeFilter === 'active') params.active = true;
      if (activeFilter === 'inactive') params.active = false;
      if (search) params.search = search;
      const res = await api.getFormulas(params).catch(() => null);
      if (res?.data) {
        setFormulas(res.data);
      } else {
        // Fallback mock
        setFormulas([
          { id: 'f-1', name: 'Empanada de Pino Tradicional', code: 'REC-001', active: true, output_qty: 50, output_unit: 'UN', cost: 18500, created_at: '2026-08-01' },
          { id: 'f-2', name: 'Salsa Pomodoro Industrial 10L', code: 'REC-002', active: true, output_qty: 10, output_unit: 'L', cost: 14200, created_at: '2026-08-05' },
          { id: 'f-3', name: 'Pan de Molle Integral 800g', code: 'REC-003', active: false, output_qty: 24, output_unit: 'UN', cost: 22000, created_at: '2026-07-20' }
        ]);
      }
    } catch (err) {
      console.error('Failed to load formulas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta receta?')) return;
    try {
      const api = getApiClient();
      await api.deleteFormula(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete formula:', err);
    }
  };

  const filteredFormulas = formulas.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.code || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#232323] tracking-tight">Recetas & Escandallos</h1>
          <p className="text-xs text-[#718EBF] mt-1">Fórmulas de producción, costeo de insumos y mermas</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/recetas/new"
            className="bg-[#1814F3] hover:bg-[#1612D3] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-150 active:scale-[0.98] shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nueva Receta
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">Recetas Activas</p>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#232323]">{formulas.filter(f => f.active).length}</p>
          <p className="text-[11px] text-[#718EBF] mt-1 font-medium">fórmulas estándar</p>
        </div>

        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">Lotes Producidos (Mes)</p>
            <div className="w-10 h-10 bg-blue-50 text-[#1814F3] rounded-full flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#232323]">128 Lotes</p>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">Conforme a receta</p>
        </div>

        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">Costo Promedio Lote</p>
            <div className="w-10 h-10 bg-teal-50 text-[#16DBCC] rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#232323]">{formatCurrency(18200)}</p>
          <p className="text-[11px] text-[#718EBF] mt-1 font-medium">Insumos actualizados</p>
        </div>

        <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-semibold text-[#718EBF] uppercase tracking-wider">Rendimiento Insumos</p>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#232323]">98.2%</p>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">Baja merma operacional</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#718EBF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar receta por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E6EFF5] rounded-xl pl-9 pr-3 py-2 text-xs text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === filter
                  ? 'bg-[#1814F3] text-white shadow-xs'
                  : 'bg-white border border-[#E6EFF5] text-[#718EBF] hover:bg-[#F5F7FA]'
              }`}
            >
              {filter === 'all' ? 'Todas' : filter === 'active' ? 'Activas' : 'Inactivas'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6EFF5] bg-[#F5F7FA]">
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Código</th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Receta / Producto</th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Rendimiento</th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Estado</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Costo Lote Est.</th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-[#718EBF]">Cargando recetas...</td>
                </tr>
              ) : filteredFormulas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-[#718EBF]">No se encontraron recetas.</td>
                </tr>
              ) : (
                filteredFormulas.map((f) => (
                  <tr key={f.id} className="border-b border-[#E6EFF5] hover:bg-[#F5F7FA] transition-colors">
                    <td className="px-6 py-3.5 text-xs font-bold text-[#232323]">{f.code || 'REC-000'}</td>
                    <td className="px-6 py-3.5 text-xs font-semibold text-[#232323]">{f.name}</td>
                    <td className="px-6 py-3.5 text-xs text-[#718EBF]">{formatQuantity(f.output_qty || 1)} {f.output_unit || 'UN'}</td>
                    <td className="px-6 py-3.5 text-xs">
                      {f.active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Inactiva
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-xs font-bold text-[#232323] text-right">{formatCurrency(f.cost || 0)}</td>
                    <td className="px-6 py-3.5 text-xs text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/recetas/produce?formula_id=${f.id}`} className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
                          <Play className="w-3 h-3" /> Producir
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1 rounded-lg text-[#718EBF] hover:text-[#232323] hover:bg-slate-100">
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-white border border-[#E6EFF5] rounded-xl p-1 shadow-md">
                            <DropdownMenuItem asChild>
                              <Link href={`/recetas/${f.id}`} className="flex items-center gap-2 text-xs">
                                <Eye className="w-3.5 h-3.5" /> Ver Detalle
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/recetas/${f.id}/edit`} className="flex items-center gap-2 text-xs">
                                <Edit className="w-3.5 h-3.5" /> Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#E6EFF5]" />
                            <DropdownMenuItem onClick={() => handleDelete(f.id)} className="flex items-center gap-2 text-xs text-rose-600">
                              <Trash2 className="w-3.5 h-3.5" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

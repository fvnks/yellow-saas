'use client';

import { useState, useEffect } from 'react';
import { FlaskConical, Plus, Search, MoreVertical, Trash2, Edit, Eye, Play, Package } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { formatQuantity } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
      const res = await api.getFormulas(params);
      setFormulas(res.data || []);
    } catch (err) {
      console.error('Failed to load formulas:', err);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [activeFilter]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const res = await api.getFormulas({ search, limit: 100 });
      setFormulas(res.data || []);
    } catch {}
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
      if (!confirm('¿Eliminar esta receta?')) return;
    try {
      const api = getApiClient();
      await api.deleteFormula(id);
      loadData();
    } catch {}
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header with Recetas Amber Personality */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#232323]">Recetas y Fórmulas</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Producción & BOM
            </span>
          </div>
          <p className="text-sm text-[#718EBF] mt-1">Estructura de materiales (BOM), rendimientos de producción y costos de formulación</p>
        </div>
        <Link href="/recetas/new"
          className="bg-[#FFBB38] hover:bg-[#E5A732] text-[#232323] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-150 active:scale-[0.98] shadow-sm">
          <Plus className="w-4 h-4" /> Nueva Receta
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718EBF]" />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E6EFF5] rounded-xl text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#FFBB38]/30 focus:border-[#FFBB38] transition-colors"
              placeholder="Buscar por nombre de receta o ingrediente..." />
          </div>
          <div className="flex gap-1.5 w-full sm:w-auto">
            {[
              { id: 'all' as const, label: 'Todas' },
              { id: 'active' as const, label: 'Activas' },
              { id: 'inactive' as const, label: 'Inactivas' },
            ].map(f => (
              <button key={f.id} onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  activeFilter === f.id ? 'bg-[#FFBB38] text-[#232323] shadow-sm' : 'text-[#718EBF] hover:bg-[#F5F7FA] hover:text-[#232323]'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6EFF5] bg-[#F5F7FA]/50">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Receta / Fórmula</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Producto de Salida</th>
                <th className="text-center px-4 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Ingredientes</th>
                <th className="text-center px-4 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Rendimiento</th>
                <th className="text-center px-4 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Producido</th>
                <th className="text-center px-4 py-3 text-[10px] font-semibold text-[#718EBF] uppercase tracking-wider">Estado</th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-xs text-[#718EBF]">Cargando recetas...</td></tr>
              ) : formulas.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center">
                  <FlaskConical className="w-12 h-12 text-[#8BA3CB] mx-auto mb-3" />
                  <p className="text-sm font-medium text-[#232323]">No hay recetas registradas</p>
                  <p className="text-xs text-[#718EBF] mt-1 mb-4">Crea una nueva estructura de materiales para iniciar la producción</p>
                  <Link href="/recetas/new" className="bg-[#1814F3] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#1612D3] transition-colors inline-block">Crear primera receta</Link>
                </td></tr>
              ) : formulas.map(f => (
                <tr key={f.id} className="border-b border-[#E6EFF5] hover:bg-[#F5F7FA] transition-colors duration-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                        <FlaskConical className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#232323]">{f.name}</p>
                        {f.description && <p className="text-[10px] text-[#718EBF] truncate max-w-xs">{f.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-[#232323]">{f.output_product?.name || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <Package className="w-2.5 h-2.5" /> {f.ingredient_count || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-medium text-[#232323]">
                    {formatQuantity(f.yield_quantity, f.yield_unit)}
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-bold text-[#232323]">
                    {f.total_produced || 0} u.
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
                      f.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {f.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 text-[#718EBF] hover:text-[#232323] hover:bg-slate-100 rounded-xl transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuItem asChild>
                          <Link href={`/recetas/${f.id}`}><Eye className="w-4 h-4 mr-2 text-[#718EBF]" /> Ver Receta</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/recetas/${f.id}/edit`}><Edit className="w-4 h-4 mr-2 text-[#718EBF]" /> Editar</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(f.id)} className="text-rose-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { FlaskConical, Plus, Search, MoreVertical, Trash2, Edit, Eye, Play, Package } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Recetas</h1>
          <p className="text-sm text-slate-500 mt-1">Recetas de producción</p>
        </div>
        <Link href="/recetas/new"
          className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nueva Receta
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Buscar receta..." />
          </div>
          <div className="flex gap-1">
            {[
              { id: 'all' as const, label: 'Todas' },
              { id: 'active' as const, label: 'Activas' },
              { id: 'inactive' as const, label: 'Inactivas' },
            ].map(f => (
              <button key={f.id} onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeFilter === f.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Receta</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto Salida</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Ingredientes</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Rendimiento</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producido</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">Cargando...</td></tr>
              ) : formulas.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center">
                  <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No hay recetas creadas</p>
                  <Link href="/recetas/new" className="text-sm text-indigo-600 hover:underline mt-1 inline-block">Crear primera receta</Link>
                </td></tr>
              ) : formulas.map(f => (
                <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                        <FlaskConical className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-900">{f.name}</p>
                        {f.description && <p className="text-[10px] text-slate-500 truncate max-w-xs">{f.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{f.output_product?.name || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-600">
                      <Package className="w-2.5 h-2.5" /> {f.ingredient_count || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-medium text-slate-900">
                    {f.yield_quantity} {f.yield_unit}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-slate-600">
                    {f.total_produced || 0}
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
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem asChild>
                          <Link href={`/recetas/${f.id}`}><Eye className="w-4 h-4 mr-2 text-slate-500" /> Ver</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/recetas/${f.id}/edit`}><Edit className="w-4 h-4 mr-2 text-slate-500" /> Editar</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(f.id)} className="text-red-600">
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

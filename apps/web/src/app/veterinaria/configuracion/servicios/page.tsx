'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle2,
  DollarSign,
  Tag,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { INITIAL_SERVICES, VeterinaryService, ServiceCategory } from '../../lib/veterinary-store';

export default function VeterinaryServicesPage() {
  const [services, setServices] = useState<VeterinaryService[]>(INITIAL_SERVICES);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'consulta' as ServiceCategory,
    priceCLP: 30000,
    durationMinutes: 30,
    requiresConsent: false,
  });

  const formatCLP = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(Math.round(val));
  };

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newSrv: VeterinaryService = {
      id: `srv-${Date.now()}`,
      ...formData,
      status: 'active',
    };

    setServices([newSrv, ...services]);
    setShowModal(false);
    setFormData({
      name: '',
      description: '',
      category: 'consulta',
      priceCLP: 30000,
      durationMinutes: 30,
      requiresConsent: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Catálogo de Servicios & Aranceles CLP
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Arancel oficial de consultas, vacunas, procedimientos quirúrgicos y exámenes de laboratorio.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo Servicio
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Nombre de Servicio o Categoría..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl">
          {filteredServices.length} Servicios Activos
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Servicio / Descripción</th>
                <th className="px-6 py-3.5">Categoría</th>
                <th className="px-6 py-3.5">Duración Estimada</th>
                <th className="px-6 py-3.5">Consentimiento Informado</th>
                <th className="px-6 py-3.5 text-right">Precio Neto / Final CLP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredServices.map((srv) => (
                <tr key={srv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{srv.name}</div>
                    <p className="text-xs text-slate-500 mt-0.5">{srv.description}</p>
                  </td>

                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg capitalize border border-slate-200">
                      {srv.category}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {srv.durationMinutes} min
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {srv.requiresConsent ? (
                      <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                        Requerido
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">No aplica</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 text-base">
                    {formatCLP(srv.priceCLP)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Modal Nuevo Servicio */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Agregar Nuevo Servicio al Arancel</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre del Servicio *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Ecografía Abdominal Canina"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Categoría *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ServiceCategory })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="consulta">Consulta</option>
                    <option value="vacunacion">Vacunación</option>
                    <option value="desparasitacion">Desparasitación</option>
                    <option value="cirugia">Cirugía</option>
                    <option value="hospitalizacion">Hospitalización</option>
                    <option value="examen">Examen</option>
                    <option value="imagenologia">Imagenología</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Precio CLP *</label>
                  <input
                    type="number"
                    required
                    value={formData.priceCLP}
                    onChange={(e) => setFormData({ ...formData, priceCLP: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles sobre insumos o requisitos del procedimiento..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-sm"
                >
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

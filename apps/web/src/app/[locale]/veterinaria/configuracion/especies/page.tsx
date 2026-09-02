'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Dog,
  Cat,
  Bird,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Tag,
  Dna,
  Shield,
  Layers,
  Sparkles,
  Edit2,
  Trash2,
  Info,
} from 'lucide-react';
import { INITIAL_SPECIES, VeterinarySpecies } from '../../lib/veterinary-store';

export default function VeterinarySpeciesPage() {
  const [speciesList, setSpeciesList] = useState<VeterinarySpecies[]>(INITIAL_SPECIES);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    key: '',
    category: 'pequeños_animales' as VeterinarySpecies['category'],
    commonBreedsStr: '',
    description: '',
  });

  const filteredSpecies = speciesList.filter((sp) => {
    const matchesSearch =
      sp.name.toLowerCase().includes(search.toLowerCase()) ||
      sp.key.toLowerCase().includes(search.toLowerCase()) ||
      (sp.description && sp.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'todas' || sp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddSpecies = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const generatedKey = formData.key.trim()
      ? formData.key.toLowerCase().replace(/\s+/g, '_')
      : formData.name.toLowerCase().replace(/\s+/g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const breedsArray = formData.commonBreedsStr
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    const newSpecies: VeterinarySpecies = {
      id: `sp-${Date.now()}`,
      key: generatedKey,
      name: formData.name,
      category: formData.category,
      commonBreeds: breedsArray.length > 0 ? breedsArray : ['Mestizo / Criollo'],
      description: formData.description || 'Especie registrada en catálogo clínico.',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setSpeciesList([newSpecies, ...speciesList]);
    setShowModal(false);
    setFormData({
      name: '',
      key: '',
      category: 'pequeños_animales',
      commonBreedsStr: '',
      description: '',
    });
  };

  const getCategoryBadge = (category: VeterinarySpecies['category']) => {
    switch (category) {
      case 'pequeños_animales':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-2 py-0.5 rounded-lg">Pequeños Animales</span>;
      case 'exoticos':
        return <span className="bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold px-2 py-0.5 rounded-lg">Exóticos & Aves</span>;
      case 'mayores_ganado':
        return <span className="bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold px-2 py-0.5 rounded-lg">Mayores & Ganado</span>;
      case 'silvestres':
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-2 py-0.5 rounded-lg">Fauna Silvestre</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Catálogo de Especies & Taxonomía
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Administración multiespecie para fichas clínicas, anamnesis, vacunas y consentimientos informados.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Crear Nueva Especie
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
            <Dog className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Pequeños Animales</div>
            <div className="text-xl font-black text-slate-900">
              {speciesList.filter((s) => s.category === 'pequeños_animales').length} Especies
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold">
            <Bird className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Exóticos & Aves</div>
            <div className="text-xl font-black text-slate-900">
              {speciesList.filter((s) => s.category === 'exoticos').length} Especies
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Mayores & Ganado</div>
            <div className="text-xl font-black text-slate-900">
              {speciesList.filter((s) => s.category === 'mayores_ganado').length} Especies
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Total en Catálogo</div>
            <div className="text-xl font-black text-slate-900">{speciesList.length} Especies</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar especie por nombre (Ej. Equino, Mustélido, Bovino) o código..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'todas', label: 'Todas' },
            { id: 'pequeños_animales', label: 'Pequeños' },
            { id: 'exoticos', label: 'Exóticos' },
            { id: 'mayores_ganado', label: 'Mayores' },
            { id: 'silvestres', label: 'Silvestres' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Species Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpecies.map((sp) => (
          <div
            key={sp.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{sp.name}</h3>
                  </div>
                  <div className="mt-1">{getCategoryBadge(sp.category)}</div>
                </div>

                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                  {sp.key}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-3 line-clamp-2">{sp.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-slate-400" />
                  Razas & Variedades Frecuentes:
                </div>
                <div className="flex flex-wrap gap-1">
                  {sp.commonBreeds.map((breed, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-50 border border-slate-200/80 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-lg"
                    >
                      {breed}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Estado: <strong className="text-emerald-600">Activo</strong></span>
              <button className="text-slate-400 hover:text-slate-700 font-bold flex items-center gap-1 text-xs">
                <Edit2 className="w-3.5 h-3.5" /> Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear Nueva Especie */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Dna className="w-5 h-5 text-emerald-600" />
                Registrar Nueva Especie Animal
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSpecies} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nombre Completo de la Especie *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Mustélido (Hurón / Ferret), Equino (Caballo), Camélido Sudamericano..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Código Interno / Clave
                  </label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="Ej. huron, equino, alpaca"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Se generará automáticamente si se deja en blanco.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Categoría / Grupo *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as VeterinarySpecies['category'] })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="pequeños_animales">Pequeños Animales</option>
                    <option value="exoticos">Exóticos & Aves</option>
                    <option value="mayores_ganado">Mayores & Ganado</option>
                    <option value="silvestres">Fauna Silvestre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Razas o Variedades Frecuentes (Separadas por coma)
                </label>
                <input
                  type="text"
                  value={formData.commonBreedsStr}
                  onChange={(e) => setFormData({ ...formData, commonBreedsStr: e.target.value })}
                  placeholder="Ej. Caballo Chileno, Criollo, Fina Sangre, Percherón"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Descripción o Notas Clínicas
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Especificaciones o consideraciones anatómicas y fisiológicas para la atención médica..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
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
                  Guardar Especie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

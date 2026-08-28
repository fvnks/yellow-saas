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
  Calendar,
  Weight,
  Cpu,
  ArrowRight,
  Shield,
  Stethoscope,
} from 'lucide-react';
import { INITIAL_PATIENTS, INITIAL_CLIENTS, VeterinaryPatient, Species } from '../lib/veterinary-store';

export default function VeterinaryPatientsPage() {
  const [patients, setPatients] = useState<VeterinaryPatient[]>(INITIAL_PATIENTS);
  const [search, setSearch] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    clientId: INITIAL_CLIENTS[0]?.id || '',
    species: 'perro' as Species,
    breed: '',
    gender: 'macho' as const,
    birthDate: '',
    color: '',
    currentWeightKg: 5.0,
    microchip: '',
    isSterilized: true,
    allergies: '',
    notes: '',
  });

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.breed.toLowerCase().includes(search.toLowerCase()) ||
      (p.microchip && p.microchip.includes(search));

    const matchesSpecies = selectedSpecies === 'todos' || p.species === selectedSpecies;
    return matchesSearch && matchesSpecies;
  });

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = INITIAL_CLIENTS.find((c) => c.id === formData.clientId);
    if (!formData.name || !selectedClient) return;

    const newPatient: VeterinaryPatient = {
      id: `pat-${Date.now()}`,
      ...formData,
      clientName: selectedClient.fullName,
      clientPhone: selectedClient.phone,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setPatients([newPatient, ...patients]);
    setShowModal(false);
    setFormData({
      name: '',
      clientId: INITIAL_CLIENTS[0]?.id || '',
      species: 'perro',
      breed: '',
      gender: 'macho',
      birthDate: '',
      color: '',
      currentWeightKg: 5.0,
      microchip: '',
      isSterilized: true,
      allergies: '',
      notes: '',
    });
  };

  const getSpeciesBadge = (species: Species) => {
    switch (species) {
      case 'perro':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"><Dog className="w-3.5 h-3.5" /> Canino</span>;
      case 'gato':
        return <span className="bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"><Cat className="w-3.5 h-3.5" /> Felino</span>;
      case 'ave':
        return <span className="bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"><Bird className="w-3.5 h-3.5" /> Ave</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold px-2 py-0.5 rounded-lg uppercase">{species}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Pacientes & Mascotas (Ley 21.020)
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Directorio multiespecie, identificación por microchip, pesajes e historial clínico 360°.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Registrar Mascota
        </button>
      </div>

      {/* Filter and Species Selector */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por Nombre de Mascota, Microchip (98514...), Raza o Nombre del Tutor..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['todos', 'perro', 'gato', 'conejo', 'ave', 'exotico'].map((sp) => (
              <button
                key={sp}
                onClick={() => setSelectedSpecies(sp)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                  selectedSpecies === sp
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Mascota / Especie</th>
                <th className="px-6 py-3.5">Raza & Sexo</th>
                <th className="px-6 py-3.5">Tutor Responsable</th>
                <th className="px-6 py-3.5">Peso & Esterilizado</th>
                <th className="px-6 py-3.5">Microchip SII/Ley 21.020</th>
                <th className="px-6 py-3.5 text-right">Ficha Clínica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                        {patient.species === 'perro' ? <Dog className="w-5 h-5" /> : <Cat className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {patient.name}
                          {getSpeciesBadge(patient.species)}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{patient.color || 'Color no especificado'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800 text-xs">{patient.breed}</div>
                    <div className="text-[11px] text-slate-500 capitalize">{patient.gender}</div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-xs">{patient.clientName}</div>
                    <div className="text-[11px] text-slate-500">{patient.clientPhone}</div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Weight className="w-3.5 h-3.5 text-slate-400" />
                      {patient.currentWeightKg} kg
                    </div>
                    {patient.isSterilized ? (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                        Esterilizado/a
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                        Entero/a
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {patient.microchip ? (
                      <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg w-fit">
                        <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                        {patient.microchip}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sin microchip</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/veterinaria/pacientes/${patient.id}`}
                      className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                      Ficha 360°
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Nueva Mascota */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Registrar Nueva Mascota</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre Mascota *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Apollo"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tutor Asignado *</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {INITIAL_CLIENTS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.rut})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Especie *</label>
                  <select
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value as Species })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="perro">Canino (Perro)</option>
                    <option value="gato">Felino (Gato)</option>
                    <option value="ave">Ave</option>
                    <option value="conejo">Conejo</option>
                    <option value="exotico">Exótico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Raza</label>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    placeholder="Ej. Golden Retriever"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Peso Inicial (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.currentWeightKg}
                    onChange={(e) => setFormData({ ...formData, currentWeightKg: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">N° Microchip</label>
                  <input
                    type="text"
                    value={formData.microchip}
                    onChange={(e) => setFormData({ ...formData, microchip: e.target.value })}
                    placeholder="9851410..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
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
                  Guardar Mascota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

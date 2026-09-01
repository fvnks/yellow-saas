'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Phone,
  Mail,
  Award,
  ShieldCheck,
  Stethoscope,
  Building,
} from 'lucide-react';
import { INITIAL_PROFESSIONALS, VeterinaryProfessional } from '../lib/veterinary-store';

export default function VeterinaryProfessionalsPage() {
  const [professionals, setProfessionals] = useState<VeterinaryProfessional[]>(INITIAL_PROFESSIONALS);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    rut: '',
    professionalLicense: '',
    specialty: 'Medicina General',
    phone: '',
    email: '',
    role: 'veterinario' as const,
  });

  const handleAddProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.rut) return;

    const newPro: VeterinaryProfessional = {
      id: `pro-${Date.now()}`,
      ...formData,
      status: 'active',
    };

    setProfessionals([...professionals, newPro]);
    setShowModal(false);
    setFormData({
      fullName: '',
      rut: '',
      professionalLicense: '',
      specialty: 'Medicina General',
      phone: '',
      email: '',
      role: 'veterinario',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Equipo Médico & Registro Profesional
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Médicos veterinarios, cirujanos y personal técnico acreditado en la clínica.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Registrar Profesional
        </button>
      </div>

      {/* Grid of Professionals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professionals.map((pro) => (
          <div key={pro.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:border-emerald-300 transition-all space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-white font-bold flex items-center justify-center text-lg shadow-sm">
                {pro.fullName.charAt(4) || pro.fullName.charAt(0)}
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border border-emerald-200 capitalize">
                {pro.role}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{pro.fullName}</h3>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">{pro.specialty}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono font-bold">{pro.professionalLicense || 'N° Reg. Colvet Pendiente'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{pro.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{pro.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Registrar Profesional */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Registrar Nuevo Médico / Técnico</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProfessional} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Dr. Sebastián Contreras P."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">RUT *</label>
                  <input
                    type="text"
                    required
                    value={formData.rut}
                    onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                    placeholder="13.910.482-1"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Registro Colvet</label>
                  <input
                    type="text"
                    value={formData.professionalLicense}
                    onChange={(e) => setFormData({ ...formData, professionalLicense: e.target.value })}
                    placeholder="COLVET-CL-4892"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Especialidad</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="Medicina Interna Canina"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rol Operativo</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="veterinario">Veterinario/a</option>
                    <option value="cirujano">Cirujano/a</option>
                    <option value="tecnico">Técnico/a Veterinario</option>
                    <option value="asistente">Asistente Clínico</option>
                  </select>
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
                  Guardar Profesional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

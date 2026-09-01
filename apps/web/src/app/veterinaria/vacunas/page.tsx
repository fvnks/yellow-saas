'use client';

import React, { useState } from 'react';
import { Syringe, ShieldCheck, Printer, Calendar, Plus, Search, Dog, Cat, Cpu, CheckCircle2 } from 'lucide-react';
import { INITIAL_PATIENTS, INITIAL_VACCINATIONS, VaccinationRecord } from '../lib/veterinary-store';

export default function VeterinaryVaccinationsPage() {
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>(INITIAL_VACCINATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-1');

  // Form State
  const [vaccineName, setVaccineName] = useState('Séxtuple Canine (DHPPi)');
  const [batchNumber, setBatchNumber] = useState('LT-98214');
  const [laboratory, setLaboratory] = useState('Zoetis / Pfizer');
  const [applicationDate, setApplicationDate] = useState('2025-02-15');
  const [nextDueDate, setNextDueDate] = useState('2026-02-15');

  const filteredVaccinations = vaccinations.filter(
    (v) =>
      v.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPatient = INITIAL_PATIENTS.find((p) => p.id === selectedPatientId) || INITIAL_PATIENTS[0] || null;
  const patientVaccines = vaccinations.filter((v) => v.patientId === selectedPatient?.id);

  const handleRegisterVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert('Debe registrar o seleccionar un paciente antes de emitir la vacuna.');
      return;
    }
    const newRecord: VaccinationRecord = {
      id: `vac-${Date.now()}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      vaccineName,
      dose: '1 mL Subcutánea',
      batchNumber,
      manufacturer: laboratory,
      applicationDate,
      nextDueDate,
      professionalName: 'Dra. Andrea Morales Soto',
    };
    setVaccinations([newRecord, ...vaccinations]);
    alert('¡Vacuna registrada con éxito en el Carnet Sanitario Ley 21.020!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Carnet de Vacunación & Control Sanitario
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Registro oficial de inmunizaciones, lotes de laboratorio y calendario de refuerzos Ley 21.020.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 self-start sm:self-center"
        >
          <Printer className="w-4 h-4" />
          Imprimir Carnet Sanitario
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Registro Vacuna */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 h-fit">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Syringe className="w-4 h-4 text-emerald-600" />
            Registrar Inmunización
          </h3>

          <form onSubmit={handleRegisterVaccine} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Paciente / Mascota</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              >
                {INITIAL_PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species} • Microchip: {p.microchip || 'Sin chip'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Vacuna Biológica</label>
              <select
                value={vaccineName}
                onChange={(e) => setVaccineName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Séxtuple Canine (DHPPi)">Séxtuple Canine (DHPPi)</option>
                <option value="Octuple Canine (DHPPi+L4)">Octuple Canine (DHPPi+L4)</option>
                <option value="Triple Felina (FVRCP)">Triple Felina (FVRCP)</option>
                <option value="Antirrábica Oficial SII">Antirrábica Oficial Ley 21.020</option>
                <option value="KC Bordetella Kennel Cough">KC Bordetella (Tos de las Perreras)</option>
                <option value="Leucemia Felina (FeLV)">Leucemia Felina (FeLV)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nº de Lote</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Laboratorio</label>
                <input
                  type="text"
                  value={laboratory}
                  onChange={(e) => setLaboratory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Fecha Aplicación</label>
                <input
                  type="date"
                  value={applicationDate}
                  onChange={(e) => setApplicationDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Próximo Refuerzo</label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-extrabold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] mt-2"
            >
              <Plus className="w-4 h-4" />
              Guardar en Carnet
            </button>
          </form>
        </div>

        {/* Vista Carnet Sanitario del Paciente Seleccionado */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Carnet Oficial */}
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-sm space-y-6 relative overflow-hidden">
            <div className="bg-slate-900 text-white p-4 -m-6 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
                <div>
                  <h2 className="text-base font-black uppercase tracking-wider">Carnet Sanitario Veterinario</h2>
                  <p className="text-[10px] text-slate-300">Cumplimiento Oficial Ley 21.020 • Tenencia Responsable</p>
                </div>
              </div>
              <span className="text-xs font-mono bg-emerald-500 text-slate-950 font-extrabold px-2.5 py-1 rounded">
                AL DÍA
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-medium block">Paciente</span>
                <strong className="text-slate-900 text-sm font-bold">{selectedPatient?.name || 'Sin paciente seleccionado'}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Especie / Raza</span>
                <strong className="text-slate-800 capitalize">{selectedPatient ? `${selectedPatient.species} • ${selectedPatient.breed}` : '-'}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Microchip Nº</span>
                <strong className="text-emerald-700 font-mono">{selectedPatient?.microchip || 'Sin registro'}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Tutor Responsable</span>
                <strong className="text-slate-800">{selectedPatient?.clientName || '-'}</strong>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Syringe className="w-4 h-4 text-emerald-600" />
                Historial de Inmunizaciones Registradas
              </h4>

              {patientVaccines.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {patientVaccines.map((vac) => (
                    <div key={vac.id} className="p-3.5 flex items-center justify-between bg-white text-xs">
                      <div>
                        <strong className="text-slate-900 block font-bold text-sm">{vac.vaccineName}</strong>
                        <span className="text-slate-500">
                          Lote: <code className="text-slate-700 font-mono font-bold">{vac.batchNumber}</code> • {vac.manufacturer}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-700 font-bold block">Aplicada: {vac.applicationDate}</span>
                        <span className="text-slate-500 font-medium text-[11px]">Refuerzo: {vac.nextDueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                  Sin vacunas registradas para este paciente.
                </p>
              )}
            </div>
          </div>

          {/* Tabla de Todas las Inmunizaciones Clínica */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Registro General de Registro de Vacunas</h3>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar vacuna..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                    <th className="p-2.5">Paciente</th>
                    <th className="p-2.5">Vacuna / Biológico</th>
                    <th className="p-2.5">Lote & Lab</th>
                    <th className="p-2.5">Fecha</th>
                    <th className="p-2.5">Próximo Refuerzo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredVaccinations.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{v.patientName}</td>
                      <td className="p-2.5 text-emerald-700 font-bold">{v.vaccineName}</td>
                      <td className="p-2.5 font-mono text-[11px]">{v.batchNumber} ({v.manufacturer})</td>
                      <td className="p-2.5">{v.applicationDate}</td>
                      <td className="p-2.5 font-bold text-slate-900">{v.nextDueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

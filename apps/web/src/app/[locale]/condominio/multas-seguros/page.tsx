'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Plus, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { formatCLP } from '@/lib/condominio-client';

interface Violation {
  id: string;
  unitId: string;
  unitNumber: string;
  ownerName: string;
  description: string;
  amountCLP: number;
  amountUF: number;
  status: string;
  createdAt: string;
}

interface InsurancePolicy {
  id: string;
  insurerName: string;
  policyNumber: string;
  fireCoverageCLP: number;
  premiumAmountCLP: number;
}

export default function MultasSegurosPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddViolationModal, setShowAddViolationModal] = useState(false);
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);

  // Form states
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [description, setDescription] = useState('');
  const [amountCLP, setAmountCLP] = useState('45000');

  const [insurerName, setInsurerName] = useState('SURA Seguros');
  const [policyNumber, setPolicyNumber] = useState('POL-2026-887');
  const [fireCoverageCLP, setFireCoverageCLP] = useState('1500000000');
  const [premiumAmountCLP, setPremiumAmountCLP] = useState('450000');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/condominio/violations');
      const json = await res.json();
      if (json.success && json.data) {
        setViolations(json.data.violations || []);
        setPolicies(json.data.policies || []);
      }

      const uRes = await fetch('/api/condominio');
      const uJson = await uRes.json();
      if (uJson.success && uJson.data.units) {
        setUnits(uJson.data.units);
        if (uJson.data.units.length > 0 && !selectedUnitId) setSelectedUnitId(uJson.data.units[0].id);
      }
    } catch (err) {
      console.error('Error fetching multas y seguros:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddViolation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId || !description) return;

    try {
      const res = await fetch('/api/condominio/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_id: selectedUnitId,
          description,
          amount_clp: parseFloat(amountCLP) || 0
        })
      });
      const json = await res.json();
      if (json.success) {
        await fetchData();
        setShowAddViolationModal(false);
        setDescription('');
      } else {
        alert(json.error || 'Error al guardar multa');
      }
    } catch (err) {
      console.error('Error adding violation:', err);
    }
  };

  const handleAddPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/condominio/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'policy',
          insurer_name: insurerName,
          policy_number: policyNumber,
          fire_coverage_clp: parseFloat(fireCoverageCLP) || 0,
          premium_amount_clp: parseFloat(premiumAmountCLP) || 0
        })
      });
      const json = await res.json();
      if (json.success) {
        await fetchData();
        setShowAddPolicyModal(false);
      } else {
        alert(json.error || 'Error al registrar póliza');
      }
    } catch (err) {
      console.error('Error adding policy:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Multas, Infracciones & Pólizas de Seguro (Art. 43)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
              Ley 21.442
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Registro de sanciones al reglamento de copropiedad y fiscalización de seguros obligatorios contra incendio.
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowAddPolicyModal(true)}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
            Registrar Póliza
          </button>
          <button
            onClick={() => setShowAddViolationModal(true)}
            className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Registrar Multa
          </button>
        </div>
      </div>

      {/* Insurance Policies Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Pólizas de Seguro Obligatorio Contra Incendio (Art. 43 Copropiedad)
        </h3>
        {policies.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No hay pólizas de seguro registradas para la comunidad.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {policies.map((p) => (
              <div key={p.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{p.insurerName}</span>
                  <span className="text-slate-500">{p.policyNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cobertura Incendio Edificio:</span>
                  <span className="font-semibold text-slate-900">{formatCLP(p.fireCoverageCLP)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Prima Anual:</span>
                  <span className="font-semibold text-slate-900">{formatCLP(p.premiumAmountCLP)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Violations Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Infracciones y Multas Cargas a Gastos Comunes
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-6 py-3">Unidad</th>
                <th className="px-6 py-3">Copropietario / Residente</th>
                <th className="px-6 py-3">Motivo de Infracción</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3 text-right">Monto Multa CLP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {violations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No hay infracciones ni multas aplicadas en este período.
                  </td>
                </tr>
              ) : (
                violations.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">Depto {v.unitNumber}</td>
                    <td className="px-6 py-3.5 text-slate-700">{v.ownerName}</td>
                    <td className="px-6 py-3.5 text-slate-800">{v.description}</td>
                    <td className="px-6 py-3.5 text-slate-500">{v.createdAt ? String(v.createdAt).substring(0, 10) : '-'}</td>
                    <td className="px-6 py-3.5 text-right font-black text-rose-600">{formatCLP(v.amountCLP)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Violation Modal */}
      {showAddViolationModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Registrar Infracción o Multa</h3>
            <form onSubmit={handleAddViolation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unidad Infractora</label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      Unidad {u.number} - {u.ownerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción de la Infracción</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ruidos molestos en horario nocturno (Art. 14)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monto de la Multa CLP</label>
                <input
                  type="number"
                  required
                  value={amountCLP}
                  onChange={(e) => setAmountCLP(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddViolationModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs"
                >
                  Guardar Multa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Policy Modal */}
      {showAddPolicyModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Registrar Póliza de Seguro Edificio</h3>
            <form onSubmit={handleAddPolicy} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Compañía Aseguradora</label>
                <input
                  type="text"
                  required
                  value={insurerName}
                  onChange={(e) => setInsurerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Póliza</label>
                <input
                  type="text"
                  required
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monto Cobertura Incendio CLP</label>
                <input
                  type="number"
                  required
                  value={fireCoverageCLP}
                  onChange={(e) => setFireCoverageCLP(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prima Anual CLP</label>
                <input
                  type="number"
                  required
                  value={premiumAmountCLP}
                  onChange={(e) => setPremiumAmountCLP(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPolicyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-4 py-2 rounded-xl text-xs"
                >
                  Guardar Póliza
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

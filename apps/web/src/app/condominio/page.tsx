'use client';

import { useState, useEffect } from 'react';
import {
  Building, Plus, LayoutGrid, DollarSign, AlertCircle, CheckCircle2,
  Users, Layers, Search, Filter, Edit, Trash2, ArrowUpRight, ShieldCheck,
  FileSpreadsheet, Receipt, MessageSquare, Download, MapPin
} from 'lucide-react';
import {
  INITIAL_SECTORS,
  INITIAL_UNITS,
  CondoSector,
  CondoUnit,
  formatCLP
} from '@/lib/condominio-client';

export default function CondominioDashboardPage() {
  const [sectors, setSectors] = useState<CondoSector[]>(INITIAL_SECTORS);
  const [units, setUnits] = useState<CondoUnit[]>(INITIAL_UNITS);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [showAddUnitModal, setShowAddUnitModal] = useState<boolean>(false);
  const [showAddSectorModal, setShowAddSectorModal] = useState<boolean>(false);
  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState<CondoUnit | null>(null);

  // New Unit Form State
  const [newUnitNumber, setNewUnitNumber] = useState('');
  const [newUnitType, setNewUnitType] = useState<'departamento' | 'casa' | 'parcela' | 'bodega' | 'estacionamiento'>('departamento');
  const [newUnitSectorId, setNewUnitSectorId] = useState('s1');
  const [newUnitOwnerName, setNewUnitOwnerName] = useState('');
  const [newUnitOwnerRut, setNewUnitOwnerRut] = useState('');
  const [newUnitOwnerEmail, setNewUnitOwnerEmail] = useState('');
  const [newUnitOwnerPhone, setNewUnitOwnerPhone] = useState('');
  const [newUnitAlicuota, setNewUnitAlicuota] = useState('8.5');
  const [newUnitArea, setNewUnitArea] = useState('85');

  // New Sector Form State
  const [newSectorName, setNewSectorName] = useState('');
  const [newSectorType, setNewSectorType] = useState<'torre' | 'sector_casas' | 'sector_parcelas' | 'etapa'>('torre');
  const [newSectorDescription, setNewSectorDescription] = useState('');
  const [newSectorColor, setNewSectorColor] = useState('#0EA5E9');

  const fetchCondoData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/condominio');
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.units && json.data.units.length > 0) {
          setUnits(json.data.units);
        }
        if (json.data.sectors && json.data.sectors.length > 0) {
          setSectors(json.data.sectors);
        }
      }
    } catch (err) {
      console.error('Error fetching condo data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCondoData();
  }, []);

  // Calculations
  const filteredUnits = units.filter((u) => {
    const matchesSector = selectedSector === 'all' || u.sectorId === selectedSector;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesSearch =
      u.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.ownerRut.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSector && matchesStatus && matchesSearch;
  });

  const totalBalanceDebtCLP = units.reduce((acc, u) => acc + u.unpaidBalanceCLP, 0);
  const totalAlicuotaSum = units.reduce((acc, u) => acc + u.alicuotaPercentage, 0);
  const totalUnitsCount = units.length;
  const morososCount = units.filter((u) => u.status === 'moroso').length;
  const alDiaCount = units.filter((u) => u.status === 'al_dia').length;

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitNumber || !newUnitOwnerName) return;

    try {
      const res = await fetch('/api/condominio/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_number: newUnitNumber,
          type: newUnitType,
          resident_name: newUnitOwnerName,
          resident_email: newUnitOwnerEmail,
          resident_phone: newUnitOwnerPhone,
          alicuota_percentage: parseFloat(newUnitAlicuota) || 1.0
        })
      });
      const json = await res.json();
      if (json.success) {
        await fetchCondoData();
        setShowAddUnitModal(false);
        setNewUnitNumber('');
        setNewUnitOwnerName('');
        setNewUnitOwnerEmail('');
        setNewUnitOwnerPhone('');
      } else {
        alert(json.error || 'Error al guardar la unidad');
      }
    } catch (err) {
      console.error('Error creating unit:', err);
    }
  };

  const handleCreateSector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectorName) return;

    const newSec: CondoSector = {
      id: `sec-${Date.now()}`,
      name: newSectorName,
      type: newSectorType,
      description: newSectorDescription || 'Sector personalizado',
      color: newSectorColor,
    };

    setSectors([...sectors, newSec]);
    setShowAddSectorModal(false);
    setNewSectorName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Layout & Unidades del Condominio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-cyan-50 text-cyan-700 border border-cyan-200">
              Personalizable
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Administración visual de copropiedad, alícuotas, casas, departamentos y parcelas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddSectorModal(true)}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            Nuevo Sector / Torre
          </button>

          <button
            onClick={() => setShowAddUnitModal(true)}
            className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 shadow-xs flex items-center gap-2 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Agregar Unidad
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Unidades</span>
            <Building className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalUnitsCount}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Suma Alícuotas: <span className="font-bold text-slate-900">{totalAlicuotaSum.toFixed(1)}%</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Al Día</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{alDiaCount}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Sin morosidad registrada
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Morosos con Saldo</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">{morososCount}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Requieren aviso o cobro
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Deuda Total Acumulada</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-2">{formatCLP(totalBalanceDebtCLP)}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Saldos pendientes de pago
          </p>
        </div>
      </div>

      {/* Filter and Sector Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Sector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedSector('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedSector === 'all'
                ? 'bg-[#0F172A] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos los Sectores ({units.length})
          </button>
          {sectors.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSector(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSector === s.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Search & Status Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar unidad, RUT o propietario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="al_dia">Al Día</option>
            <option value="pendiente">Pendiente</option>
            <option value="moroso">Moroso</option>
          </select>
        </div>
      </div>

      {/* Visual Canvas / Grid Matrix */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-cyan-600" />
            Matriz Visual de Unidades
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Haz clic en cualquier unidad para ver su ficha y estado de deuda
          </span>
        </div>

        {filteredUnits.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No se encontraron unidades con los filtros seleccionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredUnits.map((u) => {
              const isMoroso = u.status === 'moroso';
              const isPendiente = u.status === 'pendiente';

              let statusBg = 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400';
              let statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
              let statusText = 'Al Día';

              if (isMoroso) {
                statusBg = 'border-rose-200 bg-rose-50/50 hover:border-rose-400';
                statusBadge = 'bg-rose-100 text-rose-800 border-rose-300';
                statusText = 'Moroso';
              } else if (isPendiente) {
                statusBg = 'border-amber-200 bg-amber-50/50 hover:border-amber-400';
                statusBadge = 'bg-amber-100 text-amber-800 border-amber-300';
                statusText = 'Pendiente';
              }

              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedUnitForDetail(u)}
                  className={`border rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-xs ${statusBg}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-slate-900">{u.number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                      {statusText}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-800 truncate">{u.ownerName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">RUT: {u.ownerRut}</p>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-600 font-medium">
                    <span>Alícuota: <strong>{u.alicuotaPercentage}%</strong></span>
                    <span>Deuda: <strong className={u.unpaidBalanceCLP > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'}>{formatCLP(u.unpaidBalanceCLP)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Detail Unit */}
      {selectedUnitForDetail && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedUnitForDetail.number}</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedUnitForDetail.sectorName}</p>
              </div>
              <button
                onClick={() => setSelectedUnitForDetail(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <p className="text-slate-500 font-medium">Propietario / Residente</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedUnitForDetail.ownerName}</p>
                <p className="text-slate-600 mt-0.5">RUT: {selectedUnitForDetail.ownerRut}</p>
                <p className="text-slate-600">Email: {selectedUnitForDetail.ownerEmail}</p>
                <p className="text-slate-600">Teléfono: {selectedUnitForDetail.ownerPhone}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <p className="text-slate-500 font-medium">Alícuota %</p>
                  <p className="text-base font-black text-cyan-600 mt-0.5">{selectedUnitForDetail.alicuotaPercentage}%</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <p className="text-slate-500 font-medium">Superficie</p>
                  <p className="text-base font-black text-slate-800 mt-0.5">{selectedUnitForDetail.areaM2} m²</p>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-950">
                <p className="font-bold text-rose-800">Saldo Deudor Actual</p>
                <p className="text-xl font-black mt-1">{formatCLP(selectedUnitForDetail.unpaidBalanceCLP)}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedUnitForDetail(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Unit Modal */}
      {showAddUnitModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateUnit} className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">Agregar Nueva Unidad al Condominio</h3>
              <button type="button" onClick={() => setShowAddUnitModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Identificador / Número</label>
                <input
                  type="text"
                  placeholder="ej. Dpto 504 o Casa 12"
                  value={newUnitNumber}
                  onChange={(e) => setNewUnitNumber(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sector / Torre</label>
                <select
                  value={newUnitSectorId}
                  onChange={(e) => setNewUnitSectorId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-bold text-slate-700"
                >
                  {sectors.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Propiedad</label>
                <select
                  value={newUnitType}
                  onChange={(e) => setNewUnitType(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-bold text-slate-700"
                >
                  <option value="departamento">Departamento</option>
                  <option value="casa">Casa</option>
                  <option value="parcela">Parcela</option>
                  <option value="estacionamiento">Estacionamiento</option>
                  <option value="bodega">Bodega</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Coeficiente Alícuota (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="5.0"
                  value={newUnitAlicuota}
                  onChange={(e) => setNewUnitAlicuota(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Nombre Propietario / Residente</label>
                <input
                  type="text"
                  placeholder="ej. Ana María Fuentes"
                  value={newUnitOwnerName}
                  onChange={(e) => setNewUnitOwnerName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">RUT Propietario</label>
                <input
                  type="text"
                  placeholder="12.345.678-9"
                  value={newUnitOwnerRut}
                  onChange={(e) => setNewUnitOwnerRut(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Notificación</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.cl"
                  value={newUnitOwnerEmail}
                  onChange={(e) => setNewUnitOwnerEmail(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddUnitModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FACC15] text-slate-950 font-bold rounded-xl text-xs hover:bg-[#EAB308]"
              >
                Guardar Unidad
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Sector Modal */}
      {showAddSectorModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateSector} className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">Crear Nuevo Sector / Torre</h3>
              <button type="button" onClick={() => setShowAddSectorModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del Sector / Torre</label>
                <input
                  type="text"
                  placeholder="ej. Torre C - Los Coihues"
                  value={newSectorName}
                  onChange={(e) => setNewSectorName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Sector</label>
                <select
                  value={newSectorType}
                  onChange={(e) => setNewSectorType(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-bold text-slate-700"
                >
                  <option value="torre">Torre / Edificio</option>
                  <option value="sector_casas">Sector de Casas</option>
                  <option value="sector_parcelas">Macrolote / Parcelas</option>
                  <option value="etapa">Etapa / Condominio</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="ej. Etapa 2 de 24 departamentos"
                  value={newSectorDescription}
                  onChange={(e) => setNewSectorDescription(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddSectorModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-xl text-xs hover:bg-cyan-700"
              >
                Crear Sector
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
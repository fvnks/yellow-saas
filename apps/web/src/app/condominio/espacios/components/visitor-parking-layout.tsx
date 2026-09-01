'use client';

import { useState, useEffect } from 'react';
import {
  Car, ShieldCheck, CheckCircle2, Clock, Plus, Trash2, Edit3, Save,
  AlertTriangle, RefreshCw, Smartphone, Zap, Settings,
  MapPin, Check, X, ArrowRightLeft, User, Building, Info, FileSpreadsheet
} from 'lucide-react';
import { INITIAL_UNITS } from '@/lib/condominio-client';

export type SpotType = 'estandar' | 'inclusivo' | 'electrico' | 'reservado';
export type SpotStatus = 'disponible' | 'ocupado' | 'mantenimiento';

export interface ParkedVisitor {
  visitorName: string;
  visitorRut: string;
  vehiclePlate: string;
  destinationUnitNumber: string;
  entryTime: string; // e.g. "14:30"
  entryTimestamp: number; // Date.now() for time calculation
  notes?: string;
}

export interface VisitorParkingSpot {
  id: string;
  code: string;
  sectorId: string;
  type: SpotType;
  status: SpotStatus;
  parkedVisitor?: ParkedVisitor;
}

export interface ParkingSector {
  id: string;
  name: string;
  description: string;
  color: string;
}

const DEFAULT_SECTORS: ParkingSector[] = [
  { id: 'sec-superficie', name: 'Nivel 1 - Superficie / Acceso Principal', description: 'Estacionamientos exteriores cerca de Conserjería', color: '#0EA5E9' },
  { id: 'sec-sub-1', name: 'Subterráneo -1 (Visitas)', description: 'Acceso por portón automatizado norte', color: '#6366F1' },
];

const DEFAULT_SPOTS: VisitorParkingSpot[] = [
  {
    id: 'spot-v01',
    code: 'V-01',
    sectorId: 'sec-superficie',
    type: 'inclusivo',
    status: 'disponible',
  },
  {
    id: 'spot-v02',
    code: 'V-02',
    sectorId: 'sec-superficie',
    type: 'estandar',
    status: 'disponible',
  },
  {
    id: 'spot-v03',
    code: 'V-03',
    sectorId: 'sec-superficie',
    type: 'electrico',
    status: 'disponible',
  },
  {
    id: 'spot-v04',
    code: 'V-04',
    sectorId: 'sec-superficie',
    type: 'estandar',
    status: 'disponible',
  },
  {
    id: 'spot-v05',
    code: 'V-05',
    sectorId: 'sec-superficie',
    type: 'estandar',
    status: 'disponible',
  },
  {
    id: 'spot-v06',
    code: 'V-06',
    sectorId: 'sec-superficie',
    type: 'reservado',
    status: 'disponible',
  },
  {
    id: 'spot-v07',
    code: 'V-07',
    sectorId: 'sec-sub-1',
    type: 'estandar',
    status: 'disponible',
  },
  {
    id: 'spot-v08',
    code: 'V-08',
    sectorId: 'sec-sub-1',
    type: 'estandar',
    status: 'disponible',
  },
  {
    id: 'spot-v09',
    code: 'V-09',
    sectorId: 'sec-sub-1',
    type: 'inclusivo',
    status: 'disponible',
  },
  {
    id: 'spot-v10',
    code: 'V-10',
    sectorId: 'sec-sub-1',
    type: 'estandar',
    status: 'disponible',
  },
];

const LOCAL_STORAGE_KEY = 'yellow_condo_visitor_parking_layout_v1';

export default function VisitorParkingLayout() {
  const [sectors, setSectors] = useState<ParkingSector[]>(DEFAULT_SECTORS);
  const [spots, setSpots] = useState<VisitorParkingSpot[]>(DEFAULT_SPOTS);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('sec-superficie');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('todos');

  // Modals
  const [parkingModalSpot, setParkingModalSpot] = useState<VisitorParkingSpot | null>(null);
  const [detailsModalSpot, setDetailsModalSpot] = useState<VisitorParkingSpot | null>(null);
  const [editSpotModalSpot, setEditSpotModalSpot] = useState<VisitorParkingSpot | null>(null);
  const [reassignModalSpot, setReassignModalSpot] = useState<VisitorParkingSpot | null>(null);
  const [showAddSpotModal, setShowAddSpotModal] = useState<boolean>(false);
  const [showAddSectorModal, setShowAddSectorModal] = useState<boolean>(false);

  // Form states for parking a visitor
  const [visName, setVisName] = useState('');
  const [visRut, setVisRut] = useState('');
  const [visPlate, setVisPlate] = useState('');
  const [visUnit, setVisUnit] = useState(INITIAL_UNITS[0]?.number || 'Dpto 101');
  const [visNotes, setVisNotes] = useState('');

  // Form states for creating/editing spot
  const [spotCode, setSpotCode] = useState('');
  const [spotSectorId, setSpotSectorId] = useState('sec-superficie');
  const [spotType, setSpotType] = useState<SpotType>('estandar');

  // Form states for creating sector
  const [sectorName, setSectorName] = useState('');
  const [sectorDesc, setSectorDesc] = useState('');

  // Load layout from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sectors && parsed.spots) {
          setSectors(parsed.sectors);
          setSpots(parsed.spots);
        }
      }
    } catch {
      // fallback to defaults
    }
  }, []);

  // Save layout to localStorage
  const saveLayoutToStorage = (newSectors: ParkingSector[], newSpots: VisitorParkingSpot[]) => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ sectors: newSectors, spots: newSpots })
      );
    } catch {
      // ignore storage errors
    }
  };

  // Park visitor action
  const handleParkVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parkingModalSpot || !visPlate) return;

    const now = new Date();
    const entryTimeString = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

    const updatedSpots = spots.map((s) => {
      if (s.id === parkingModalSpot.id) {
        return {
          ...s,
          status: 'ocupado' as SpotStatus,
          parkedVisitor: {
            visitorName: visName || 'Visita No Registrada',
            visitorRut: visRut || '15.000.000-0',
            vehiclePlate: visPlate.toUpperCase().trim(),
            destinationUnitNumber: visUnit,
            entryTime: entryTimeString,
            entryTimestamp: Date.now(),
            notes: visNotes,
          },
        };
      }
      return s;
    });

    setSpots(updatedSpots);
    saveLayoutToStorage(sectors, updatedSpots);

    // Reset form
    setParkingModalSpot(null);
    setVisName('');
    setVisRut('');
    setVisPlate('');
    setVisNotes('');
  };

  // Unpark / Checkout action
  const handleReleaseSpot = (spotId: string) => {
    const updatedSpots = spots.map((s) => {
      if (s.id === spotId) {
        return {
          ...s,
          status: 'disponible' as SpotStatus,
          parkedVisitor: undefined,
        };
      }
      return s;
    });

    setSpots(updatedSpots);
    saveLayoutToStorage(sectors, updatedSpots);
    setDetailsModalSpot(null);
  };

  // Reassign parking spot
  const handleReassignSpot = (targetSpotId: string) => {
    if (!reassignModalSpot || !reassignModalSpot.parkedVisitor) return;

    const visitorData = reassignModalSpot.parkedVisitor;

    const updatedSpots = spots.map((s) => {
      if (s.id === reassignModalSpot.id) {
        // Free old spot
        return { ...s, status: 'disponible' as SpotStatus, parkedVisitor: undefined };
      }
      if (s.id === targetSpotId) {
        // Occupy target spot
        return { ...s, status: 'ocupado' as SpotStatus, parkedVisitor: visitorData };
      }
      return s;
    });

    setSpots(updatedSpots);
    saveLayoutToStorage(sectors, updatedSpots);
    setReassignModalSpot(null);
    setDetailsModalSpot(null);
  };

  // Add new spot
  const handleAddSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotCode) return;

    const newSpot: VisitorParkingSpot = {
      id: `spot-${Date.now()}`,
      code: spotCode.toUpperCase().trim(),
      sectorId: spotSectorId,
      type: spotType,
      status: 'disponible',
    };

    const updatedSpots = [...spots, newSpot];
    setSpots(updatedSpots);
    saveLayoutToStorage(sectors, updatedSpots);

    setShowAddSpotModal(false);
    setSpotCode('');
  };

  // Add new sector
  const handleAddSector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectorName) return;

    const colors = ['#0EA5E9', '#6366F1', '#10B981', '#F59E0B', '#EC4899'];
    const randomColor = colors[sectors.length % colors.length];

    const newSector: ParkingSector = {
      id: `sec-${Date.now()}`,
      name: sectorName.trim(),
      description: sectorDesc.trim() || 'Sector de estacionamientos personalizado',
      color: randomColor,
    };

    const updatedSectors = [...sectors, newSector];
    setSectors(updatedSectors);
    saveLayoutToStorage(updatedSectors, spots);

    setShowAddSectorModal(false);
    setSectorName('');
    setSectorDesc('');
  };

  // Delete spot
  const handleDeleteSpot = (spotId: string) => {
    if (!confirm('¿Seguro que deseas eliminar este estacionamiento del layout del condominio?')) return;

    const updatedSpots = spots.filter((s) => s.id !== spotId);
    setSpots(updatedSpots);
    saveLayoutToStorage(sectors, updatedSpots);
    setEditSpotModalSpot(null);
  };

  // Update spot info
  const handleUpdateSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSpotModalSpot) return;

    const updatedSpots = spots.map((s) => (s.id === editSpotModalSpot.id ? editSpotModalSpot : s));
    setSpots(updatedSpots);
    saveLayoutToStorage(sectors, updatedSpots);
    setEditSpotModalSpot(null);
  };

  // Reset to default layout
  const handleResetLayout = () => {
    if (confirm('¿Restablecer el layout de estacionamientos a la configuración por defecto?')) {
      setSectors(DEFAULT_SECTORS);
      setSpots(DEFAULT_SPOTS);
      saveLayoutToStorage(DEFAULT_SECTORS, DEFAULT_SPOTS);
    }
  };

  // Stats
  const currentSectorSpots = spots.filter((s) => s.sectorId === selectedSectorId);
  const totalSectorSpots = currentSectorSpots.length;
  const occupiedCount = currentSectorSpots.filter((s) => s.status === 'ocupado').length;
  const availableCount = currentSectorSpots.filter((s) => s.status === 'disponible').length;
  const maintenanceCount = currentSectorSpots.filter((s) => s.status === 'mantenimiento').length;
  const occupancyPercentage = totalSectorSpots > 0 ? Math.round((occupiedCount / totalSectorSpots) * 100) : 0;

  // Filter spots based on type
  const filteredSpots = currentSectorSpots.filter((s) => {
    if (filterType === 'todos') return true;
    if (filterType === 'disponibles') return s.status === 'disponible';
    if (filterType === 'ocupados') return s.status === 'ocupado';
    if (filterType === 'inclusivo') return s.type === 'inclusivo';
    if (filterType === 'electrico') return s.type === 'electrico';
    return true;
  });

  // Calculate duration helper
  const getElapsedHoursMinutes = (timestamp?: number) => {
    if (!timestamp) return '0m';
    const diffMs = Date.now() - timestamp;
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hrs === 0) return `${remainingMins}m`;
    return `${hrs}h ${remainingMins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Layout Header Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Car className="w-5 h-5 text-cyan-600" />
                Layout de Estacionamientos para Visitas
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                Personalizable por Condominio
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Ubica visualmente el lugar físico exacto de cada vehículo de visita y gestiona el mapa según la arquitectura de tu condominio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                editMode
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              {editMode ? 'Finalizar Edición Layout' : 'Personalizar Layout Físico'}
            </button>

            {editMode && (
              <>
                <button
                  onClick={() => {
                    setSpotSectorId(selectedSectorId);
                    setShowAddSpotModal(true);
                  }}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Estacionamiento
                </button>

                <button
                  onClick={handleResetLayout}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  title="Restablecer Layout"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sector Selector Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            {sectors.map((sec) => {
              const secSpots = spots.filter((s) => s.sectorId === sec.id);
              const secOccupied = secSpots.filter((s) => s.status === 'ocupado').length;
              const isSelected = sec.id === selectedSectorId;

              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSectorId(sec.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{sec.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {secOccupied}/{secSpots.length}
                  </span>
                </button>
              );
            })}

            {editMode && (
              <button
                onClick={() => setShowAddSectorModal(true)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 border border-dashed border-slate-300 hover:bg-slate-200 text-slate-600 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Sector
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 text-xs">
            <button
              onClick={() => setFilterType('todos')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterType === 'todos' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('disponibles')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterType === 'disponibles' ? 'bg-emerald-50 text-emerald-700 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Libres ({availableCount})
            </button>
            <button
              onClick={() => setFilterType('ocupados')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterType === 'ocupados' ? 'bg-rose-50 text-rose-700 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Ocupados ({occupiedCount})
            </button>
          </div>
        </div>

        {/* Sector Summary Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ocupación Sector</span>
              <p className="text-lg font-black text-slate-900">{occupancyPercentage}%</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs">
              {occupiedCount}/{totalSectorSpots}
            </div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Disponibles</span>
              <p className="text-lg font-black text-emerald-800">{availableCount} Libres</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>

          <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Vehículos Estacionados</span>
              <p className="text-lg font-black text-rose-800">{occupiedCount} Visitas</p>
            </div>
            <Car className="w-6 h-6 text-rose-600" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">En Mantención</span>
              <p className="text-lg font-black text-slate-700">{maintenanceCount} No disp.</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Visual Parking Map Canvas */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-600" />
              Mapa de Estacionamientos Físicos
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Haz clic en cualquier box para asignar visita o registrar salida
            </span>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[11px] text-slate-600 font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block"></span> Libre
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-500 inline-block"></span> Ocupado
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-400 inline-block"></span> Reservado
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-400 inline-block"></span> Mantención
            </div>
          </div>
        </div>

        {/* Spot Grid Cards */}
        {filteredSpots.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs font-medium border-2 border-dashed border-slate-200 rounded-2xl">
            No hay estacionamientos registrados en este sector o filtro.
            {editMode && (
              <div className="mt-3">
                <button
                  onClick={() => {
                    setSpotSectorId(selectedSectorId);
                    setShowAddSpotModal(true);
                  }}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Agregar primer estacionamiento
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredSpots.map((spot) => {
              const isOccupied = spot.status === 'ocupado';
              const isAvailable = spot.status === 'disponible';
              const isMaintenance = spot.status === 'mantenimiento';

              return (
                <div
                  key={spot.id}
                  onClick={() => {
                    if (editMode) {
                      setEditSpotModalSpot(spot);
                    } else if (isOccupied) {
                      setDetailsModalSpot(spot);
                    } else if (isAvailable) {
                      setParkingModalSpot(spot);
                      setVisPlate('');
                      setVisName('');
                      setVisRut('');
                      setVisNotes('');
                    }
                  }}
                  className={`
                    relative group rounded-2xl p-4 transition-all cursor-pointer border-2 shadow-xs flex flex-col justify-between min-h-[140px]
                    ${
                      isOccupied
                        ? 'bg-rose-50/70 border-rose-300 hover:border-rose-500 hover:shadow-md'
                        : isAvailable
                        ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/80 hover:shadow-md'
                        : 'bg-slate-100 border-slate-300 text-slate-500 hover:border-slate-400'
                    }
                  `}
                >
                  {/* Top Bar: Code + Spot Badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-sm text-slate-900 tracking-tight">{spot.code}</span>
                      {spot.type === 'inclusivo' && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-extrabold text-[9px] flex items-center gap-0.5" title="Preferencial Inclusivo">
                          ♿ Inclusivo
                        </span>
                      )}
                      {spot.type === 'electrico' && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold text-[9px] flex items-center gap-0.5" title="Cargador Eléctrico">
                          ⚡ EV
                        </span>
                      )}
                      {spot.type === 'reservado' && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-extrabold text-[9px]" title="Reservado Conserjería">
                          🔒 Reservado
                        </span>
                      )}
                    </div>

                    {editMode ? (
                      <span className="p-1 rounded bg-white text-slate-700 shadow-xs border border-slate-200">
                        <Edit3 className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isOccupied ? 'bg-rose-500 animate-pulse' : isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      ></span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="my-2">
                    {isOccupied && spot.parkedVisitor ? (
                      <div className="space-y-1">
                        <div className="bg-slate-900 text-amber-300 font-black text-center text-xs py-1 px-2 rounded-lg tracking-widest border border-slate-700 shadow-xs">
                          {spot.parkedVisitor.vehiclePlate}
                        </div>
                        <p className="text-[11px] font-bold text-slate-900 truncate mt-1">
                          {spot.parkedVisitor.destinationUnitNumber}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">{spot.parkedVisitor.visitorName}</p>
                      </div>
                    ) : isAvailable ? (
                      <div className="text-center py-2">
                        <Car className="w-7 h-7 text-emerald-500 mx-auto opacity-70 group-hover:scale-110 transition-transform" />
                        <p className="text-[11px] font-bold text-emerald-700 mt-1">Disponible</p>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <AlertTriangle className="w-6 h-6 text-slate-400 mx-auto" />
                        <p className="text-[10px] font-bold text-slate-500 mt-1">Mantención</p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Footer: Time or Action */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                    {isOccupied && spot.parkedVisitor ? (
                      <>
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-rose-500" />
                          {spot.parkedVisitor.entryTime}
                        </span>
                        <span className="font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                          {getElapsedHoursMinutes(spot.parkedVisitor.entryTimestamp)}
                        </span>
                      </>
                    ) : isAvailable ? (
                      <span className="text-emerald-700 font-extrabold flex items-center gap-1 mx-auto group-hover:underline">
                        <Plus className="w-3 h-3" /> Estacionar
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium mx-auto">No Disponible</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal 1: Estacionar Vehículo de Visita */}
      {parkingModalSpot && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Estacionar Visita en Lugar Físico {parkingModalSpot.code}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sector: {sectors.find((s) => s.id === parkingModalSpot.sectorId)?.name}
                  </p>
                </div>
              </div>
              <button onClick={() => setParkingModalSpot(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleParkVisitor} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patente del Vehículo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: KJ-88-21 o BB-10-99"
                  value={visPlate}
                  onChange={(e) => setVisPlate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black tracking-widest text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unidad de Destino *</label>
                <select
                  value={visUnit}
                  onChange={(e) => setVisUnit(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {INITIAL_UNITS.map((u) => (
                    <option key={u.id} value={u.number}>
                      {u.number} - {u.ownerName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Visita</label>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={visName}
                    onChange={(e) => setVisName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RUT Visita</label>
                  <input
                    type="text"
                    placeholder="15.112.334-5"
                    value={visRut}
                    onChange={(e) => setVisRut(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observaciones Conserjería</label>
                <input
                  type="text"
                  placeholder="Ej: Autorizado por teléfono por residente"
                  value={visNotes}
                  onChange={(e) => setVisNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setParkingModalSpot(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-[#EAB308] transition-all shadow-xs"
                >
                  Confirmar e Iniciar Estacionamiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Detalles / Liberar / Reasignar Vehículo */}
      {detailsModalSpot && detailsModalSpot.parkedVisitor && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Lugar Ocupado: {detailsModalSpot.code}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Estacionamiento de Visitas
                  </p>
                </div>
              </div>
              <button onClick={() => setDetailsModalSpot(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-4 text-center space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Patente Registrada</span>
              <p className="text-2xl font-black text-amber-400 tracking-widest">{detailsModalSpot.parkedVisitor.vehiclePlate}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Unidad de Destino:</span>
                <span className="font-bold text-slate-900">{detailsModalSpot.parkedVisitor.destinationUnitNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Nombre Visita:</span>
                <span className="font-semibold text-slate-800">{detailsModalSpot.parkedVisitor.visitorName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">RUT Visita:</span>
                <span className="font-semibold text-slate-800">{detailsModalSpot.parkedVisitor.visitorRut}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Hora de Ingreso:</span>
                <span className="font-semibold text-slate-800">{detailsModalSpot.parkedVisitor.entryTime} hrs</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tiempo Transcurrido:</span>
                <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  {getElapsedHoursMinutes(detailsModalSpot.parkedVisitor.entryTimestamp)}
                </span>
              </div>
              {detailsModalSpot.parkedVisitor.notes && (
                <div className="py-1.5">
                  <span className="text-slate-500 block mb-0.5">Observaciones:</span>
                  <p className="bg-slate-50 p-2 rounded-lg text-slate-700 text-[11px] italic">
                    &quot;{detailsModalSpot.parkedVisitor.notes}&quot;
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => handleReleaseSpot(detailsModalSpot.id)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Registrar Salida y Liberar Lugar {detailsModalSpot.code}
              </button>

              <button
                onClick={() => setReassignModalSpot(detailsModalSpot)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-200"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-600" />
                Reasignar a Otro Lugar Físico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Reasignar Vehículo */}
      {reassignModalSpot && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-cyan-600" />
                Reasignar Patente {reassignModalSpot.parkedVisitor?.vehiclePlate}
              </h3>
              <button onClick={() => setReassignModalSpot(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Selecciona el nuevo estacionamiento libre donde se trasladará el vehículo:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {spots
                .filter((s) => s.status === 'disponible' && s.id !== reassignModalSpot.id)
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleReassignSpot(s.id)}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all text-left flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{s.code}</span>
                      <span className="text-[11px] text-slate-500 block">
                        Sector: {sectors.find((sec) => sec.id === s.sectorId)?.name}
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-lg">
                      Mover Aquí
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Agregar Nuevo Estacionamiento (Personalizador Layout) */}
      {showAddSpotModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Agregar Estacionamiento al Layout</h3>
              <button onClick={() => setShowAddSpotModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSpot} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Código / Número *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: V-11, SUB-05, ESP-1"
                  value={spotCode}
                  onChange={(e) => setSpotCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sector Físico</label>
                <select
                  value={spotSectorId}
                  onChange={(e) => setSpotSectorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {sectors.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Estacionamiento</label>
                <select
                  value={spotType}
                  onChange={(e) => setSpotType(e.target.value as SpotType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="estandar">🚗 Estándar (Normal)</option>
                  <option value="inclusivo">♿ Preferencial / Inclusivo (Ley 19.284)</option>
                  <option value="electrico">⚡ Cargador Vehículo Eléctrico (EV)</option>
                  <option value="reservado">🔒 Reservado Conserjería</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSpotModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 text-white hover:bg-cyan-700 transition-all shadow-xs"
                >
                  Guardar Estacionamiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Editar Configuración de Spot */}
      {editSpotModalSpot && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Editar Estacionamiento {editSpotModalSpot.code}</h3>
              <button onClick={() => setEditSpotModalSpot(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSpot} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Código del Estacionamiento</label>
                <input
                  type="text"
                  required
                  value={editSpotModalSpot.code}
                  onChange={(e) => setEditSpotModalSpot({ ...editSpotModalSpot, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Estacionamiento</label>
                <select
                  value={editSpotModalSpot.type}
                  onChange={(e) => setEditSpotModalSpot({ ...editSpotModalSpot, type: e.target.value as SpotType })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                >
                  <option value="estandar">🚗 Estándar (Normal)</option>
                  <option value="inclusivo">♿ Preferencial / Inclusivo</option>
                  <option value="electrico">⚡ Cargador Vehículo Eléctrico</option>
                  <option value="reservado">🔒 Reservado Conserjería</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estado Operativo</label>
                <select
                  value={editSpotModalSpot.status}
                  onChange={(e) => setEditSpotModalSpot({ ...editSpotModalSpot, status: e.target.value as SpotStatus })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                >
                  <option value="disponible">🟢 Disponible</option>
                  <option value="mantenimiento">⚪ Fuera de Servicio / Mantención</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteSpot(editSpotModalSpot.id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditSpotModalSpot(null)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 text-white hover:bg-cyan-700"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 6: Agregar Sector */}
      {showAddSectorModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Agregar Sector o Nivel de Estacionamientos</h3>
              <button onClick={() => setShowAddSectorModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSector} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Sector *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Subterráneo -2, Sector Torre B, Exterior"
                  value={sectorName}
                  onChange={(e) => setSectorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="Ej: Nivel -2 de estacionamientos con portón automático"
                  value={sectorDesc}
                  onChange={(e) => setSectorDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSectorModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
                >
                  Crear Sector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

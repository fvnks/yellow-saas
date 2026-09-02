'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Car,
  ArrowUpRight,
  Phone,
  Mail,
} from 'lucide-react';
import { formatCLP, formatDate, formatRUT } from '../lib/utils';
import { useAutoTalleresStore } from '../lib/auto-talleres-store';

const vehicles = [
  {
    id: 'v1',
    patente: 'ABCD12',
    marca: 'Toyota',
    modelo: 'Corolla',
    anio: 2022,
    color: 'Blanco',
    tipo: 'Sedán',
    tipo_combustible: 'Gasolina',
    transmision: 'Automática',
    kilometraje: 45000,
    client_id: 'c1',
    client_name: 'Juan Pérez',
    client_phone: '+56 9 1234 5678',
    client_email: 'juan.perez@email.com',
    created_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'v2',
    patente: 'EFGH34',
    marca: 'Chevrolet',
    modelo: 'Spark',
    anio: 2020,
    color: 'Rojo',
    tipo: 'Hatchback',
    tipo_combustible: 'Gasolina',
    transmision: 'Manual',
    kilometraje: 62000,
    client_id: 'c2',
    client_name: 'María González',
    client_phone: '+56 9 2345 6789',
    client_email: 'maria.gonzalez@email.com',
    created_at: '2024-01-08T10:30:00Z',
  },
  {
    id: 'v3',
    patente: 'IJKL56',
    marca: 'Ford',
    modelo: 'Ranger',
    anio: 2021,
    color: 'Negro',
    tipo: 'Camioneta',
    tipo_combustible: 'Diésel',
    transmision: 'Automática',
    kilometraje: 38000,
    client_id: 'c3',
    client_name: 'Roberto Díaz',
    client_phone: '+56 9 3456 7890',
    client_email: 'roberto.diaz@email.com',
    created_at: '2024-01-05T14:15:00Z',
  },
  {
    id: 'v4',
    patente: 'MNOP78',
    marca: 'Volkswagen',
    modelo: 'Golf',
    anio: 2019,
    color: 'Gris',
    tipo: 'Hatchback',
    tipo_combustible: 'Gasolina',
    transmision: 'Automática',
    kilometraje: 78000,
    client_id: 'c4',
    client_name: 'Claudia López',
    client_phone: '+56 9 4567 8901',
    client_email: 'claudia.lopez@email.com',
    created_at: '2024-01-03T09:45:00Z',
  },
  {
    id: 'v5',
    patente: 'QRST90',
    marca: 'Hyundai',
    modelo: 'Tucson',
    anio: 2023,
    color: 'Azul',
    tipo: 'SUV',
    tipo_combustible: 'Gasolina',
    transmision: 'Automática',
    kilometraje: 15000,
    client_id: 'c5',
    client_name: 'Felipe Muñoz',
    client_phone: '+56 9 5678 9012',
    client_email: 'felipe.munoz@email.com',
    created_at: '2023-12-28T16:20:00Z',
  },
];

export default function VehiculosPage() {
  const [search, setSearch] = useState('');
  const showNewVehicleModal = useAutoTalleresStore.getState().showNewVehicleModal;

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchLower = search.toLowerCase();
    return (
      vehicle.patente.toLowerCase().includes(searchLower) ||
      vehicle.marca.toLowerCase().includes(searchLower) ||
      vehicle.modelo.toLowerCase().includes(searchLower) ||
      vehicle.client_name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A]">Vehículos</h1>
          <p className="text-sm text-slate-500 mt-1">{vehicles.length} vehículos registrados</p>
        </div>
        <button
          onClick={() => useAutoTalleresStore.setState({ showNewVehicleModal: true })}
          className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Registrar Vehículo
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por patente, marca, modelo o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <Car className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-lg font-black text-[#0F172A]">{vehicle.patente}</p>
                  <p className="text-xs text-slate-500">{vehicle.marca} {vehicle.modelo}</p>
                </div>
              </div>
              <Link
                href={`/auto-talleres/vehiculos/${vehicle.id}`}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Año</span>
                <span className="font-semibold text-slate-900">{vehicle.anio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Color</span>
                <span className="font-semibold text-slate-900">{vehicle.color}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kilometraje</span>
                <span className="font-semibold text-slate-900">{vehicle.kilometraje.toLocaleString('es-CL')} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transmisión</span>
                <span className="font-semibold text-slate-900">{vehicle.transmision}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Propietario</p>
              <p className="text-sm font-semibold text-slate-900">{vehicle.client_name}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {vehicle.client_phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {vehicle.client_email}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12 bg-white border border-slate-200/80 rounded-2xl">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No se encontraron vehículos</p>
          <p className="text-sm text-slate-400 mt-1">Intenta con otros términos de búsqueda</p>
        </div>
      )}
    </div>
  );
}

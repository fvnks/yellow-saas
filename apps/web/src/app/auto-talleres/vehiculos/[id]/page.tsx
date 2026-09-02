'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Share2,
  Edit,
  Car,
  User,
  Wrench,
  Calendar,
  Clock,
  Phone,
  Mail,
  TrendingUp,
  FileText,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { formatCLP, formatDate } from '../../lib/utils';

interface Vehicle {
  id: string;
  plate: string;
  plate_type: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  fuel_type: string;
  transmission: string;
  mileage: number;
  engine_capacity: string;
  vin: string;
  observation: string;
  status: string;
  client_name: string;
  client_rut: string;
  email: string;
  telefono: string;
  total_orders: number;
  last_visit: string;
}

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    async function loadVehicle() {
      try {
        const res = await fetch(`/api/auto-talleres/vehicles/${params.id}?company_id=${process.env.NEXT_PUBLIC_COMPANY_ID}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success) setVehicle(data.data);
        else setError(data.error?.message || 'Vehicle not found');
      } catch (err) {
        setError('Error loading vehicle data');
      } finally {
        setLoading(false);
      }
    }
    loadVehicle();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
        <p className="text-slate-500 mb-4">{error || 'Vehicle not found'}</p>
        <Link href="/auto-talleres/vehiculos" className="text-orange-600 font-semibold hover:underline">
          Volver a Vehículos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/auto-talleres/vehiculos"
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-[#0F172A]">{vehicle.plate}</h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                {vehicle.plate_type}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {vehicle.brand} {vehicle.model} ({vehicle.year}) · {vehicle.color}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Printer className="w-4 h-4" />
            Imprimir Ficha
          </button>
          <Link
            href={`/auto-talleres/vehiculos/${vehicle.id}/edit`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Link>
          <button
            onClick={() => setShowOrderModal(true)}
            className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Nueva Orden
          </button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Info */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center gap-2">
              <Car className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-bold text-slate-900">Datos del Vehículo</h2>
            </div>
            <div className="p-6 grid gap-4 grid-cols-2 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Marca</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{vehicle.brand}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Modelo</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{vehicle.model}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Año</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{vehicle.year}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Color</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{vehicle.color || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Combustible</p>
                <p className="text-sm font-bold text-slate-900 mt-1 capitalize">{vehicle.fuel_type}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Transmisión</p>
                <p className="text-sm font-bold text-slate-900 mt-1 capitalize">{vehicle.transmission}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Kilometraje</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{vehicle.mileage.toLocaleString('es-CL')} km</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Motor</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{vehicle.engine_capacity || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">VIN (Chasis)</p>
                <p className="text-sm font-mono text-slate-900 mt-1">{vehicle.vin || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-bold text-slate-900">Propietario</h2>
            </div>
            <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{vehicle.client_name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">RUT</p>
                <p className="text-sm font-mono text-slate-900 mt-1">{vehicle.client_rut}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Teléfono</p>
                <p className="text-sm text-slate-700 mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {vehicle.telefono}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</p>
                <p className="text-sm text-slate-700 mt-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {vehicle.email}
                </p>
              </div>
            </div>
          </div>

          {/* Observation */}
          {vehicle.observation && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200/80">
                <h2 className="text-sm font-bold text-slate-900">Observaciones</h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl">{vehicle.observation}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80">
              <h2 className="text-sm font-bold text-slate-900">Historial</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <Wrench className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#0F172A]">{vehicle.total_orders || 0}</p>
                  <p className="text-xs text-slate-500">Órdenes realizadas</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#0F172A]">
                    {vehicle.last_visit ? new Date(vehicle.last_visit).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : 'N/A'}
                  </p>
                  <p className="text-xs text-slate-500">Última visita</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80">
              <h2 className="text-sm font-bold text-slate-900">Acciones Rápidas</h2>
            </div>
            <div className="p-4 space-y-2">
              <Link
                href={`/auto-talleres/ordenes/new?vehicle_id=${vehicle.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors text-sm font-semibold text-orange-700"
              >
                <Plus className="w-4 h-4" />
                Nueva Orden de Trabajo
              </Link>
              <Link
                href={`/auto-talleres/estimados/new?vehicle_id=${vehicle.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-700"
              >
                <FileText className="w-4 h-4" />
                Crear Estimado
              </Link>
              <Link
                href={`/auto-talleres/inspecciones/new?vehicle_id=${vehicle.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-700"
              >
                <Calendar className="w-4 h-4" />
                Nueva Inspección
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

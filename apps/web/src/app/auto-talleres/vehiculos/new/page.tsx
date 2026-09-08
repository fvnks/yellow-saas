'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Car,
  User,
  AlertCircle,
} from 'lucide-react';

import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';

interface Customer {
  id: string;
  nombre: string;
  rut: string;
  telefono: string;
  email: string;
}

interface Brand {
  id: string;
  name: string;
}

export default function NuevoVehiculoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [newBrand, setNewBrand] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    client_id: '',
    plate: '',
    plate_type: 'normal',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    fuel_type: 'naftero',
    transmission: 'manual',
    mileage: 0,
    engine_capacity: '',
    vin: '',
    observation: '',
  });

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetch('/api/customers?company_id=' + process.env.NEXT_PUBLIC_COMPANY_ID);
        if (!res.ok) {
          console.error('Failed to load customers');
          return;
        }
        const data = await res.json();
        if (data.success) setCustomers(data.data);
      } catch (err) {
        console.error('Error loading customers:', err);
      }
    }
    loadCustomers();
  }, []);

  useEffect(() => {
    async function loadBrands() {
      try {
        const res = await fetch('/api/auto-talleres/brands');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) setBrands(data.data);
      } catch (err) {
        console.error('Error loading brands:', err);
      }
    }
    loadBrands();
  }, []);

  const handleAddBrand = async () => {
    if (!newBrand) return;
    try {
      const res = await fetch('/api/auto-talleres/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBrand }),
      });
      if (res.ok) {
        const data = await res.json();
        setBrands([...brands, data.data]);
        setNewBrand('');
      }
    } catch (err) {
      console.error('Error adding brand:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auto-talleres/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, company_id: process.env.NEXT_PUBLIC_COMPANY_ID }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Error creating vehicle');

      router.push('/auto-talleres/vehiculos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/auto-talleres/vehiculos"
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#0F172A]">Registrar Vehículo</h1>
          <p className="text-sm text-slate-500 mt-1">Agrega un nuevo vehículo al sistema</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Car className="w-4 h-4 text-orange-500" />
            Datos del Vehículo
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Patente *</label>
              <input
                type="text"
                value={formData.plate}
                onChange={(e) => handleChange('plate', e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                placeholder="ABCD12"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo de Patente</label>
              <select
                value={formData.plate_type}
                onChange={(e) => handleChange('plate_type', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              >
                <option value="normal">Normal</option>
                <option value="verde">Verde (Clásico)</option>
                <option value="negra">Negra (Ejecutivo)</option>
                <option value="diplomatica">Diplomática</option>
                <option value="defensa">Defensa</option>
                <option value="temporal">Temporal</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Marca *</label>
               <div className="flex">
                 <select
                   value={formData.brand}
                   onChange={(e) => handleChange('brand', e.target.value)}
                   className="flex-1 px-4 py-2.5 rounded-l-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                   required
                 >
                   <option value="">Seleccionar marca...</option>
                   {brands.map((b) => (
                     <option key={b.id} value={b.name}>
                       {b.name}
                     </option>
                   ))}
                 </select>
                 <Dialog>
                   <DialogTrigger className="bg-orange-500 text-white px-4 py-2 rounded-r-xl hover:bg-orange-600 focus:ring-2 focus:ring-offset-2 focus:ring-orange-300">
                     + Marca
                   </DialogTrigger>
                   <DialogContent>
                     <h3 className="dialog-title">Nueva Marca</h3>
                     <input
                       className="input mb-4"
                       placeholder="Nombre de la marca"
                       onChange={(e) => setNewBrand(e.target.value)}
                     />
                     <button className="button" onClick={handleAddBrand}>Guardar</button>
                   </DialogContent>
                 </Dialog>
               </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Modelo *</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                placeholder="Corolla"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Año *</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => handleChange('year', Math.max(1900, Math.min(new Date().getFullYear() + 1, Number(e.target.value) || 0)))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                placeholder="Blanco"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">VIN (Chasis)</label>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => handleChange('vin', e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                placeholder="1HGBH41JXMN109186"
              />
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Combustible</label>
              <select
                value={formData.fuel_type}
                onChange={(e) => handleChange('fuel_type', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              >
                <option value="naftero">Naftero</option>
                <option value="diesel">Diésel</option>
                <option value="híbrido">Híbrido</option>
                <option value="eléctrico">Eléctrico</option>
                <option value="gas">Gas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Transmisión</label>
              <select
                value={formData.transmission}
                onChange={(e) => handleChange('transmission', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              >
                <option value="manual">Manual</option>
                <option value="automatica">Automática</option>
                <option value="cvt">CVT</option>
                <option value="semiautomatica">Semiautomática</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kilometraje</label>
              <input
                type="number"
                value={formData.mileage}
                onChange={(e) => handleChange('mileage', Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Motor</label>
            <input
              type="text"
              value={formData.engine_capacity}
              onChange={(e) => handleChange('engine_capacity', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              placeholder="2.0L 4 cilindros"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Observaciones</label>
            <textarea
              value={formData.observation}
              onChange={(e) => handleChange('observation', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
              placeholder="Notas adicionales sobre el vehículo..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-orange-500" />
            Propietario
          </h2>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cliente *</label>
            <select
              value={formData.client_id}
              onChange={(e) => handleChange('client_id', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              required
            >
              <option value="">Seleccionar cliente...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} - {c.rut}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-slate-200/80 flex items-center justify-end gap-3 bg-slate-50/50">
          <Link
            href="/auto-talleres/vehiculos"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.plate || !formData.brand || !formData.model || !formData.client_id}
            className="bg-[#FACC15] hover:bg-[#EAB308] disabled:bg-slate-300 disabled:cursor-not-allowed text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar Vehículo'}
          </button>
        </div>
      </form>
    </div>
  );
}

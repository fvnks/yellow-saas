'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'planning',
    start_date: '',
    end_date: '',
    budget: '',
    customer_name: '',
    project_manager_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast.error('Nombre y código son requeridos');
      return;
    }

    setLoading(true);
    try {
      const api = getApiClient();
      await api.createProject(formData);
      toast.success('Proyecto creado exitosamente');
      router.push('/projects');
    } catch (err) {
      toast.error('Error al crear proyecto');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Nuevo Proyecto</h1>
          <p className="text-sm text-slate-500 mt-1">Crear un nuevo proyecto</p>
        </div>
        <Link href="/projects"
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Nombre del proyecto"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Código *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="PRJ-001"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Cliente</label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Nombre del cliente"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="planning">Planificación</option>
                <option value="active">Activo</option>
                <option value="completed">Completado</option>
                <option value="on_hold">En Espera</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Fecha Inicio</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Fecha Fin</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Presupuesto (CLP)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-medium text-slate-700">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Descripción del proyecto..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Link href="/projects"
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Creando...' : 'Crear Proyecto'}
          </button>
        </div>
      </form>
    </div>
  );
}

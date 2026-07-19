'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [form, setForm] = useState({
    name: '', code: '', description: '', customer_id: '', start_date: '', end_date: '',
    budget: '', status: 'planning', project_manager_id: '',
  });

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getCustomers({ limit: '100' }).catch(() => ({ data: [] })),
      api.getUsers({ limit: 100 }).catch(() => ({ data: [] })),
    ]).then(([customersRes, usersRes]) => {
      setCustomers((customersRes.data || []).map((c: any) => ({ id: c.id, name: c.name })));
      setUsers((usersRes.data || []).map((u: any) => ({ id: u.id, full_name: u.full_name || u.email, email: u.email })));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) return;
    setSaving(true);
    try {
      const api = getApiClient();
      await api.createProject({
        ...form,
        budget: form.budget ? parseFloat(form.budget) : 0,
        customer_id: form.customer_id || undefined,
        project_manager_id: form.project_manager_id || undefined,
      });
      router.push('/dashboard/projects');
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Nuevo Proyecto</h1>
          <p className="text-sm text-slate-500 mt-1">Crear un nuevo proyecto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Nombre *</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Nombre del proyecto" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Codigo *</label>
              <input type="text" required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="PRJ-001" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Descripcion</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Descripcion del proyecto..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Cliente</label>
              <select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="">Sin cliente</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Gerente del Proyecto</label>
              <select value={form.project_manager_id} onChange={e => setForm({ ...form, project_manager_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="">Sin asignar</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Fecha Inicio</label>
              <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Fecha Fin</label>
              <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Presupuesto (CLP)</label>
              <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Estado</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="planning">Planificacion</option>
                <option value="active">Activo</option>
                <option value="on_hold">En Pausa</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Link href="/dashboard/projects">
            <button type="button" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Cancelar
            </button>
          </Link>
          <button type="submit" disabled={saving || !form.name || !form.code}
            className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Crear Proyecto'}
          </button>
        </div>
      </form>
    </div>
  );
}

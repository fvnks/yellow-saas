'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Search } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export default function ProjectTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const res = await api.getProjectTemplates();
      setTemplates(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newName) {
      toast.error('Nombre es requerido');
      return;
    }
    try {
      const api = getApiClient();
      await api.createProjectTemplate({ name: newName, description: newDescription });
      toast.success('Plantilla creada');
      setShowNew(false);
      setNewName('');
      setNewDescription('');
      loadTemplates();
    } catch (err) {
      toast.error('Error al crear plantilla');
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Eliminar esta plantilla?')) return;
    try {
      const api = getApiClient();
      await api.deleteProjectTemplate(templateId);
      toast.success('Plantilla eliminada');
      loadTemplates();
    } catch (err) {
      toast.error('Error al eliminar plantilla');
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Plantillas</h1>
          <p className="text-sm text-slate-500 mt-1">Plantillas de proyectos reutilizables</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nueva Plantilla
        </button>
      </div>

      {showNew && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Nueva Plantilla</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Nombre *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Nombre de la plantilla"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Descripción</label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Descripción breve"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowNew(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button onClick={handleCreate} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Crear
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Buscar plantilla..."
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map(template => (
            <div key={template.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{template.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{template.description || 'Sin descripción'}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(template.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
              <div className="mt-4 text-xs text-slate-500">
                {template.task_count || 0} tareas • {template.phase_count || 0} fases
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No se encontraron plantillas</p>
        </div>
      )}
    </div>
  );
}

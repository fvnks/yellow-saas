'use client';

import { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, GripVertical, X } from 'lucide-react';
import { toast } from 'sonner';

interface CustomField {
  id: string;
  name: string;
  field_type: string;
  options: string[];
  required: boolean;
  sort_order: number;
}

interface CustomFieldsProps {
  projectId: string;
  fields: CustomField[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  onRefresh: () => void;
  editable?: boolean;
}

const fieldTypes = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Numero' },
  { value: 'date', label: 'Fecha' },
  { value: 'select', label: 'Seleccion' },
  { value: 'boolean', label: 'Si/No' },
];

export default function CustomFields({ projectId, fields, values, onChange, onRefresh, editable = true }: CustomFieldsProps) {
  const [showManager, setShowManager] = useState(false);
  const [newField, setNewField] = useState({ name: '', field_type: 'text', options: '', required: false });
  const [editingField, setEditingField] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newField.name) { toast.error('Nombre requerido'); return; }
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/projects/${projectId}/custom-fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newField.name,
          field_type: newField.field_type,
          options: newField.field_type === 'select' ? newField.options.split(',').map(o => o.trim()).filter(Boolean) : [],
          required: newField.required,
          sort_order: fields.length,
        }),
      });
      if (res.ok) {
        toast.success('Campo creado');
        setNewField({ name: '', field_type: 'text', options: '', required: false });
        onRefresh();
      }
    } catch (e) { toast.error('Error al crear campo'); }
  };

  const handleDelete = async (fieldId: string) => {
    if (!confirm('Eliminar este campo personalizado?')) return;
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/projects/${projectId}/custom-fields/${fieldId}`, { method: 'DELETE' });
      toast.success('Campo eliminado');
      onRefresh();
    } catch (e) { toast.error('Error al eliminar'); }
  };

  return (
    <div className="space-y-3">
      {fields.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {fields.map(field => (
            <div key={field.id} className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                {field.name} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.field_type === 'text' && (
                <input type="text" value={values[field.id] || ''} onChange={e => onChange(field.id, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={`${field.name}...`} />
              )}
              {field.field_type === 'number' && (
                <input type="number" value={values[field.id] || ''} onChange={e => onChange(field.id, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0" />
              )}
              {field.field_type === 'date' && (
                <input type="date" value={values[field.id] || ''} onChange={e => onChange(field.id, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              )}
              {field.field_type === 'select' && (
                <select value={values[field.id] || ''} onChange={e => onChange(field.id, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">Seleccionar...</option>
                  {(field.options || []).map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
              {field.field_type === 'boolean' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={values[field.id] === 'true'} onChange={e => onChange(field.id, e.target.checked ? 'true' : 'false')}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-xs text-slate-600">Si</span>
                </label>
              )}
            </div>
          ))}
        </div>
      )}

      {editable && (
        <div className="flex items-center gap-2">
          <button onClick={() => setShowManager(!showManager)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <Settings className="w-3.5 h-3.5" />
            {fields.length > 0 ? 'Gestionar Campos' : 'Agregar Campos Personalizados'}
          </button>
        </div>
      )}

      {showManager && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-700">Campos Personalizados</h4>
            <button onClick={() => setShowManager(false)} className="p-1 hover:bg-slate-100 rounded">
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {fields.length > 0 && (
            <div className="space-y-2">
              {fields.map(field => (
                <div key={field.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-medium text-slate-700 flex-1">{field.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 rounded text-slate-600">{field.field_type}</span>
                  {field.required && <span className="text-[9px] text-red-500">*requerido</span>}
                  <button onClick={() => handleDelete(field.id)} className="p-1 hover:bg-red-50 rounded text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-slate-200 pt-3">
            <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nuevo Campo</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input type="text" value={newField.name} onChange={e => setNewField({ ...newField, name: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Nombre del campo" />
              <select value={newField.field_type} onChange={e => setNewField({ ...newField, field_type: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500">
                {fieldTypes.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
              </select>
              {newField.field_type === 'select' && (
                <input type="text" value={newField.options} onChange={e => setNewField({ ...newField, options: e.target.value })}
                  className="col-span-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Opciones separadas por coma" />
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={newField.required} onChange={e => setNewField({ ...newField, required: e.target.checked })}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600" />
                <span className="text-[10px] text-slate-600">Requerido</span>
              </label>
              <button onClick={handleCreate}
                className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

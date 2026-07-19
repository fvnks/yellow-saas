'use client';

import { useState } from 'react';
import { Badge } from '@yellow-erp/ui';
import { FileText, Plus, Trash2, Download, File, Image, FileSpreadsheet } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface Document {
  id: string;
  name: string;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  category: string;
  description: string | null;
  uploaded_by_name: string | null;
  created_at: string;
}

const categoryConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  contract: { label: 'Contrato', variant: 'info' },
  specification: { label: 'Especificacion', variant: 'warning' },
  invoice: { label: 'Factura', variant: 'success' },
  photo: { label: 'Foto', variant: 'neutral' },
  report: { label: 'Reporte', variant: 'danger' },
  other: { label: 'Otro', variant: 'neutral' },
};

function getFileIcon(type: string | null) {
  if (!type) return File;
  if (type.startsWith('image/')) return Image;
  if (type.includes('spreadsheet') || type.includes('excel')) return FileSpreadsheet;
  return FileText;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsTab({ projectId, documents, onRefresh }: { projectId: string; documents: Document[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', file_url: '', category: 'other', description: '' });
  const [saving, setSaving] = useState(false);

  const api = getApiClient();

  const handleCreate = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      await api.createProjectDocument(projectId, form);
      setShowForm(false);
      setForm({ name: '', file_url: '', category: 'other', description: '' });
      onRefresh();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este documento?')) return;
    try { await api.deleteProjectDocument(projectId, id); onRefresh(); } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Documentos del Proyecto</h3>
        <button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Subir Documento
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl shadow-sm">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No hay documentos adjuntos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(doc => {
            const FileIcon = getFileIcon(doc.file_type);
            return (
              <div key={doc.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                    <FileIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                      </a>
                    )}
                    <button onClick={() => handleDelete(doc.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 truncate">{doc.name}</h4>
                {doc.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{doc.description}</p>}
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant={categoryConfig[doc.category]?.variant || 'neutral'}>{categoryConfig[doc.category]?.label || doc.category}</Badge>
                  <span className="text-[9px] text-slate-400">{formatFileSize(doc.file_size)}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[9px] text-slate-400">{doc.uploaded_by_name || '—'}</span>
                  <span className="text-[9px] text-slate-400">{new Date(doc.created_at).toLocaleDateString('es-CL')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Subir Documento</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">X</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Nombre *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">URL del Archivo</label>
                <input type="url" value={form.file_url} onChange={e => setForm({ ...form, file_url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="https://..." />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Categoria</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="contract">Contrato</option>
                  <option value="specification">Especificacion</option>
                  <option value="invoice">Factura</option>
                  <option value="photo">Foto</option>
                  <option value="report">Reporte</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Descripcion</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={handleCreate} disabled={saving || !form.name}
                className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Subir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

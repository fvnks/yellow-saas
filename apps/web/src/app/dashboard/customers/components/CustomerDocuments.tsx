'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Trash2, X, File, Image, FileSpreadsheet, FileCode, HardDrive } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  description: string | null;
  file_url: string | null;
  file_data: string | null;
  mime_type: string | null;
  file_size: number | null;
  category: string;
  created_at: string;
  uploader_name: string | null;
}

interface CustomerDocumentsProps {
  customerId: string;
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  contract: { label: 'Contrato', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  agreement: { label: 'Acuerdo', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  tax_id: { label: 'Tributario', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  invoice: { label: 'Factura', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  certificate: { label: 'Certificado', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  other: { label: 'Otro', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return FileText;
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('pdf')) return FileText;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return FileSpreadsheet;
  if (mimeType.includes('json') || mimeType.includes('xml')) return FileCode;
  if (mimeType.includes('zip') || mimeType.includes('rar')) return HardDrive;
  return File;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CustomerDocuments({ customerId }: CustomerDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newDoc, setNewDoc] = useState({ name: '', description: '', category: 'other' });
  const [fileData, setFileData] = useState<{ data: string; mime: string; size: number; name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`/api/companies/placeholder/customer-documents?customer_id=${customerId}`);
      const data = await res.json();
      if (data.success !== false) setDocuments(data.data || data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchDocuments(); }, [customerId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setFileData({ data: base64, mime: file.type, size: file.size, name: file.name });
      if (!newDoc.name) setNewDoc(prev => ({ ...prev, name: file.name.replace(/\.[^.]+$/, '') }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!newDoc.name || !fileData) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/companies/placeholder/customer-documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          name: newDoc.name,
          description: newDoc.description || null,
          category: newDoc.category,
          file_data: fileData.data,
          mime_type: fileData.mime,
          file_size: fileData.size,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setNewDoc({ name: '', description: '', category: 'other' });
        setFileData(null);
        fetchDocuments();
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/companies/placeholder/customer-documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setShowDeleteConfirm(null);
        fetchDocuments();
      }
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Documentos Adjuntos</h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Subir Documento
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-slate-100 rounded-xl h-32" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No hay documentos adjuntos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.map(doc => {
            const Icon = getFileIcon(doc.mime_type);
            const cat = categoryConfig[doc.category] || categoryConfig.other;
            return (
              <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{doc.name}</p>
                    {doc.description && <p className="text-[10px] text-slate-500 mt-0.5 truncate">{doc.description}</p>}
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(doc.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${cat.color}`}>
                    {cat.label}
                  </span>
                  {doc.file_size && (
                    <span className="text-[10px] text-slate-400">{formatFileSize(doc.file_size)}</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  {new Date(doc.created_at).toLocaleDateString('es-CL')}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Subir Documento</h2>
              <button onClick={() => { setShowModal(false); setFileData(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Nombre *</label>
                <input
                  type="text"
                  value={newDoc.name}
                  onChange={e => setNewDoc({ ...newDoc, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nombre del documento"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Descripción</label>
                <textarea
                  value={newDoc.description}
                  onChange={e => setNewDoc({ ...newDoc, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="Descripción opcional"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Categoría</label>
                <select
                  value={newDoc.category}
                  onChange={e => setNewDoc({ ...newDoc, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {Object.entries(categoryConfig).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Archivo *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer"
                />
                {fileData && (
                  <p className="text-[10px] text-slate-500 mt-1">{fileData.name} ({formatFileSize(fileData.size)})</p>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowModal(false); setFileData(null); }}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!newDoc.name || !fileData || saving}
                className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Eliminar documento</h3>
            <p className="text-xs text-slate-500 mb-4">¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

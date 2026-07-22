'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const customerFields = [
  { key: 'name', label: 'Nombre', required: true },
  { key: 'tax_id', label: 'RUT', required: false },
  { key: 'email', label: 'Email', required: false },
  { key: 'phone', label: 'Teléfono', required: false },
  { key: 'address', label: 'Dirección', required: false },
  { key: 'city', label: 'Ciudad', required: false },
  { key: 'region', label: 'Región', required: false },
  { key: 'country', label: 'País', required: false },
  { key: 'trade_name', label: 'Razón Social', required: false },
  { key: 'code', label: 'Código', required: false },
  { key: 'website', label: 'Sitio Web', required: false },
  { key: 'notes', label: 'Notas', required: false },
];

export default function CustomerImport({ open, onClose, onComplete }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [preview, setPreview] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: number; errorMessages: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Por favor selecciona un archivo CSV');
      return;
    }

    setFile(selectedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length === 0) {
        toast.error('El archivo está vacío');
        return;
      }

      const parsedHeaders = parseCSVLine(lines[0]);
      setHeaders(parsedHeaders);

      const parsedPreview = lines.slice(1, 6).map(line => parseCSVLine(line));
      setPreview(parsedPreview);

      const autoMapping: Record<string, string> = {};
      parsedHeaders.forEach(header => {
        const normalizedHeader = header.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const matchedField = customerFields.find(field => {
          const normalizedField = field.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const normalizedKey = field.key.toLowerCase();
          return normalizedHeader === normalizedField ||
            normalizedHeader === normalizedKey ||
            normalizedHeader.includes(normalizedField) ||
            normalizedField.includes(normalizedHeader);
        });
        if (matchedField) {
          autoMapping[header] = matchedField.key;
        }
      });
      setMapping(autoMapping);
    };
    reader.readAsText(selectedFile);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleMappingChange = (header: string, field: string) => {
    setMapping(prev => ({ ...prev, [header]: field }));
  };

  const handleImport = async () => {
    const nameField = Object.entries(mapping).find(([, field]) => field === 'name');
    if (!nameField) {
      toast.error('Debe mapear al menos el campo "Nombre"');
      return;
    }

    setImporting(true);
    try {
      const api = getApiClient();
      const companyId = localStorage.getItem('company_id');

      const data = preview.map(row => {
        const record: Record<string, string> = {};
        headers.forEach((header, index) => {
          const field = mapping[header];
          if (field && row[index]) {
            record[field] = row[index];
          }
        });
        return record;
      });

      const res = await fetch(`/api/companies/${companyId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'customers', data }),
      });

      const json = await res.json();

      if (res.ok) {
        setResult({
          imported: json.imported || data.length,
          errors: json.errors || 0,
          errorMessages: json.errorMessages || [],
        });
        toast.success(`Importación completada: ${json.imported || data.length} registros`);
        onComplete?.();
      } else {
        toast.error(json.error || 'Error al importar');
      }
    } catch {
      toast.error('Error al importar datos');
    }
    setImporting(false);
  };

  const handleClose = () => {
    setFile(null);
    setHeaders([]);
    setPreview([]);
    setMapping({});
    setResult(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Importar Clientes</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-sm font-medium text-slate-700">Arrastra un archivo CSV aquí o haz clic para seleccionar</p>
              <p className="text-xs text-slate-500 mt-2">Formatos aceptados: .csv</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-900">Importación Completada</h3>
                    <p className="text-xs text-emerald-700 mt-1">
                      {result.imported} registros importados correctamente
                    </p>
                    {result.errors > 0 && (
                      <p className="text-xs text-amber-700 mt-1">
                        {result.errors} registros con errores
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {result.errorMessages.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-amber-900 mb-2">Errores:</h4>
                  <ul className="space-y-1">
                    {result.errorMessages.map((msg, i) => (
                      <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {msg}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">{headers.length} columnas detectadas</p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setHeaders([]);
                    setPreview([]);
                    setMapping({});
                  }}
                  className="ml-auto text-xs text-rose-600 hover:text-rose-700"
                >
                  Cambiar archivo
                </button>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Mapeo de Columnas</h4>
                <div className="space-y-3">
                  {headers.map((header, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1">
                        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          {header}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                      <div className="flex-1">
                        <select
                          value={mapping[header] || ''}
                          onChange={e => handleMappingChange(header, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        >
                          <option value="">No importar</option>
                          {customerFields.map(field => (
                            <option key={field.key} value={field.key}>
                              {field.label} {field.required ? '*' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Vista Previa (primeras 5 filas)</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        {headers.map((header, index) => (
                          <th key={index} className="text-left px-3 py-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-slate-100">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-3 py-2 text-xs text-slate-700">
                              {cell || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {result ? 'Cerrar' : 'Cancelar'}
          </button>
          {!result && file && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {importing ? 'Importando...' : 'Importar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
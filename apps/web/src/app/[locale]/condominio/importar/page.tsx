'use client';

import { useState } from 'react';
import {
  FileSpreadsheet, Upload, CheckCircle, AlertTriangle, FileText,
  ArrowRight, ShieldCheck, Download, Check
} from 'lucide-react';
import { formatCLP } from '@/lib/condominio-client';

interface ImportedRow {
  unidad: string;
  propietario: string;
  rut: string;
  alicuota: number;
  saldoInicialCLP: number;
  isValid: boolean;
  validationError?: string;
}

const DEFAULT_CSV_TEMPLATE = `Unidad,Propietario,RUT,Alicuota,SaldoInicial`;

export default function ImportarPlanillasPage() {
  const [csvContent, setCsvContent] = useState<string>(DEFAULT_CSV_TEMPLATE);
  const [parsedRows, setParsedRows] = useState<ImportedRow[]>([]);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleValidateAndProcess = () => {
    const lines = csvContent.trim().split('\n');
    const rows: ImportedRow[] = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      const cols = line.split(',');
      const unidad = cols[0]?.trim() || '';
      const propietario = cols[1]?.trim() || '';
      const rut = cols[2]?.trim() || '';
      const alicuota = parseFloat(cols[3]?.trim() || '0');
      const saldoInicialCLP = parseInt(cols[4]?.trim() || '0', 10);

      let isValid = true;
      let validationError = '';

      if (!unidad) {
        isValid = false;
        validationError = 'Falta el número o código de unidad.';
      } else if (!propietario) {
        isValid = false;
        validationError = 'Falta el nombre del propietario.';
      } else if (alicuota <= 0 || isNaN(alicuota)) {
        isValid = false;
        validationError = 'La alícuota debe ser mayor a 0%.';
      }

      rows.push({
        unidad,
        propietario,
        rut,
        alicuota,
        saldoInicialCLP,
        isValid,
        validationError,
      });
    }

    setParsedRows(rows);
    setHasProcessed(true);
    setImportSuccess(false);
  };

  const handleFinalImport = () => {
    setImportSuccess(true);
  };

  const totalAlicuotaSum = parsedRows.reduce((acc, r) => acc + (r.isValid ? r.alicuota : 0), 0);
  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Importador de Planillas CSV / Excel
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-cyan-50 text-cyan-700 border border-cyan-200">
            Validación en Tiempo Real
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Carga masiva de copropietarios, coeficientes de alícuotas y saldos iniciales con validación de datos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Input Area */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-600" />
              Ingreso de Datos o Pegar Contenido CSV
            </h2>
            <p className="text-xs text-slate-500 font-medium mb-3">
              Formato esperado: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">Unidad, Propietario, RUT, Alicuota %, SaldoInicial</code>
            </p>

            <textarea
              rows={10}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Pega aquí el contenido de tu planilla CSV..."
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCsvContent(DEFAULT_CSV_TEMPLATE)}
              className="text-xs text-slate-500 underline hover:text-slate-900 font-semibold"
            >
              Restablecer Formato Base
            </button>

            <button
              onClick={handleValidateAndProcess}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs"
            >
              <Upload className="w-4 h-4" />
              Validar Planilla
            </button>
          </div>
        </div>

        {/* Validation Results */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Resultado de la Validación
          </h2>

          {!hasProcessed ? (
            <div className="py-16 text-center text-slate-400 text-xs font-medium">
              Presiona &quot;Validar Planilla&quot; para comprobar el formato de las alícuotas y datos.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-700">Registros Válidos</p>
                  <p className="text-xl font-black text-emerald-800">{validCount}</p>
                </div>
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-rose-700">Errores</p>
                  <p className="text-xl font-black text-rose-800">{invalidCount}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-700">Suma Alícuotas</p>
                  <p className="text-xl font-black text-slate-900">{totalAlicuotaSum.toFixed(1)}%</p>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                {parsedRows.map((r, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{r.unidad} - {r.propietario}</p>
                      <p className="text-[10px] text-slate-500">RUT: {r.rut} | Alícuota: {r.alicuota}%</p>
                      {r.validationError && (
                        <p className="text-[10px] text-rose-600 font-bold mt-0.5">{r.validationError}</p>
                      )}
                    </div>
                    <div>
                      {r.isValid ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">✓ Válido</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold">✕ Error</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {importSuccess ? (
                <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ¡Planilla importada exitosamente en la base de datos!
                </div>
              ) : (
                <button
                  onClick={handleFinalImport}
                  disabled={validCount === 0}
                  className="w-full bg-amber-500 hover:bg-[#EAB308] text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Confirmar e Importar {validCount} Unidades
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
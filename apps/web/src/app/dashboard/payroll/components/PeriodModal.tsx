'use client';

import { useState } from 'react';
import { Button, Input } from '@yellow-erp/ui';
import { X, Plus, Calendar } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface Props {
  onClose: () => void;
  onSave: () => void;
}

export default function PeriodModal({ onClose, onSave }: Props) {
  const [periodStart, setPeriodStart] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [periodEnd, setPeriodEnd] = useState(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!periodStart || !periodEnd) {
      setError('Las fechas de período son obligatorias');
      return;
    }
    if (new Date(periodEnd) < new Date(periodStart)) {
      setError('La fecha de fin no puede ser anterior a la de inicio');
      return;
    }
    setSaving(true);
    setError('');
    const api = getApiClient();
    try {
      await api.createPayrollRun({ period_start: periodStart, period_end: periodEnd, notes: notes || undefined });
      onSave();
    } catch (e: any) {
      setError(e?.message || 'Error al crear período');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full dark:bg-slate-900 max-w- dark:bg-slate-900md mx-4">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Nuevo Período de Nómina</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">{error}</div>
          )}

          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Calendar className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-blue-700">Selecciona el rango de fechas para calcular la nómina de todos los empleados activos.</p>
          </div>

          <Input label="Fecha de Inicio" type="date" value={periodStart} onChange={(e: any) => setPeriodStart(e.target.value)} />
          <Input label="Fecha de Término" type="date" value={periodEnd} onChange={(e: any) => setPeriodEnd(e.target.value)} />
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e: any) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ej: Nómina julio 2026..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Plus className="w-4 h-4 mr-2" />
            {saving ? 'Creando...' : 'Crear Período'}
          </Button>
        </div>
      </div>
    </div>
  );
}

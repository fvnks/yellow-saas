'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PRIMARY_ACTION, SECONDARY_ACTION } from './button-classes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Modal } from './Modal';

export interface FieldOption {
  value: string | number;
  label: string;
}

export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: string;
  defaultValue?: string | number | boolean;
}

interface CreateEntityModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  endpoint: string;
  fields: FieldDef[];
  onSuccess: () => void;
  /** Normaliza los valores antes de enviar (opcional). */
  transform?: (values: Record<string, unknown>) => Record<string, unknown>;
}

/**
 * Modal genérico para «Nuevo <registro>» de cada listado. Renderiza un
 * formulario con los campos dados y hace POST al endpoint indicado.
 */
export function CreateEntityModal({
  title,
  isOpen,
  onClose,
  endpoint,
  fields,
  onSuccess,
  transform,
}: CreateEntityModalProps) {
  const [values, setValues] = useState<Record<string, string | number | boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // `fields` se crea de nuevo en cada render del padre: se guarda en una ref
  // para reiniciar el formulario sólo al abrir el modal, no en cada render.
  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;

  useEffect(() => {
    if (isOpen) {
      setValues(
        fieldsRef.current.reduce((acc, f) => {
          if (f.defaultValue !== undefined) acc[f.name] = f.defaultValue;
          else if (f.type === 'checkbox') acc[f.name] = false;
          else acc[f.name] = '';
          return acc;
        }, {} as Record<string, string | number | boolean>)
      );
      setError('');
    }
  }, [isOpen]);

  const setField = (name: string, value: string | number | boolean) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = fields.reduce((acc, f) => {
        const v = values[f.name];
        if (f.type === 'checkbox') {
          acc[f.name] = Boolean(v);
        } else if (f.type === 'number') {
          if (v === '' || v === undefined) {
            // Opcional vacío → undefined; requerido lo obliga HTML
            if (!f.required) acc[f.name] = undefined;
            else acc[f.name] = Number(v);
          } else {
            acc[f.name] = Number(v);
          }
        } else {
          acc[f.name] = v === '' && !f.required ? undefined : v;
        }
        return acc;
      }, {} as Record<string, unknown>);

      const body = transform ? transform(payload) : payload;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');

      onClose();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        {fields.map((f) => (
          <div key={f.name} className="space-y-2">
            <Label htmlFor={`f_${f.name}`}>
              {f.label}
              {f.required ? ' *' : ''}
            </Label>

            {f.type === 'textarea' ? (
              <textarea
                id={`f_${f.name}`}
                value={String(values[f.name] ?? '')}
                onChange={(e) => setField(f.name, e.target.value)}
                placeholder={f.placeholder}
                required={f.required}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            ) : f.type === 'select' ? (
              <select
                id={`f_${f.name}`}
                value={String(values[f.name] ?? '')}
                onChange={(e) => setField(f.name, e.target.value)}
                required={f.required}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Seleccionar…</option>
                {(f.options || []).map((o) => (
                  <option key={String(o.value)} value={String(o.value)}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === 'checkbox' ? (
              <div className="flex items-center gap-2">
                <input
                  id={`f_${f.name}`}
                  type="checkbox"
                  checked={Boolean(values[f.name])}
                  onChange={(e) => setField(f.name, e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-600">{f.placeholder || 'Sí'}</span>
              </div>
            ) : (
              <Input
                id={`f_${f.name}`}
                type={f.type || 'text'}
                value={String(values[f.name] ?? '')}
                onChange={(e) => setField(f.name, e.target.value)}
                placeholder={f.placeholder}
                required={f.required}
                min={f.min}
                max={f.max}
                step={f.step}
              />
            )}
          </div>
        ))}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" className={SECONDARY_ACTION} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className={PRIMARY_ACTION} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

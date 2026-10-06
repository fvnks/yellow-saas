'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PRIMARY_ACTION, SECONDARY_ACTION } from './button-classes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Asignatura, AsignaturaCreate, AsignaturaUpdate } from '@/types/educacion';
import { Loader2 } from 'lucide-react';

interface AsignaturaFormProps {
  asignatura?: Asignatura;
  onSave: (data: AsignaturaCreate | AsignaturaUpdate) => Promise<void>;
  onCancel: () => void;
}

export function AsignaturaForm({ asignatura, onSave, onCancel }: AsignaturaFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    nivel: '',
    horas_semanales: 4,
  });

  useEffect(() => {
    if (asignatura) {
      setFormData({
        codigo: asignatura.codigo || '',
        nombre: asignatura.nombre,
        nivel: asignatura.nivel || '',
        horas_semanales: asignatura.horas_semanales || 4,
      });
    }
  }, [asignatura]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: AsignaturaCreate | AsignaturaUpdate = {
        ...formData,
        codigo: formData.codigo || undefined,
        nivel: formData.nivel || undefined,
      };

      await onSave(data);
    } catch (error) {
      console.error('Error saving asignatura:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="codigo">Código</Label>
          <Input
            id="codigo"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            placeholder="Ej: MAT, LEN, CIE"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Matemáticas"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nivel">Nivel</Label>
          <Select
            value={formData.nivel}
            onValueChange={(value) => setFormData({ ...formData, nivel: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="parvularia">Parvularia</SelectItem>
              <SelectItem value="basica">Básica</SelectItem>
              <SelectItem value="media">Media</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="horas_semanales">Horas Semanales</Label>
          <Input
            id="horas_semanales"
            type="number"
            value={formData.horas_semanales}
            onChange={(e) => setFormData({ ...formData, horas_semanales: parseInt(e.target.value) })}
            min="1"
            max="40"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" className={SECONDARY_ACTION} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className={PRIMARY_ACTION} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {asignatura ? 'Actualizar' : 'Crear'} Asignatura
        </Button>
      </div>
    </form>
  );
}

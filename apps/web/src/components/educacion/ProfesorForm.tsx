'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Profesor, ProfesorCreate, ProfesorUpdate } from '@/types/educacion';
import { Loader2 } from 'lucide-react';

interface ProfesorFormProps {
  profesor?: Profesor;
  onSave: (data: ProfesorCreate | ProfesorUpdate) => Promise<void>;
  onCancel: () => void;
}

export function ProfesorForm({ profesor, onSave, onCancel }: ProfesorFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rut: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    telefono: '',
    especialidad: '',
    titulo: '',
    fecha_ingreso: '',
  });

  useEffect(() => {
    if (profesor) {
      setFormData({
        rut: profesor.rut,
        nombres: profesor.nombres,
        apellido_paterno: profesor.apellido_paterno,
        apellido_materno: profesor.apellido_materno || '',
        email: profesor.email || '',
        telefono: profesor.telefono || '',
        especialidad: profesor.especialidad || '',
        titulo: profesor.titulo || '',
        fecha_ingreso: profesor.fecha_ingreso || '',
      });
    }
  }, [profesor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: ProfesorCreate | ProfesorUpdate = {
        ...formData,
        apellido_materno: formData.apellido_materno || undefined,
        email: formData.email || undefined,
        telefono: formData.telefono || undefined,
        especialidad: formData.especialidad || undefined,
        titulo: formData.titulo || undefined,
        fecha_ingreso: formData.fecha_ingreso || undefined,
      };

      await onSave(data);
    } catch (error) {
      console.error('Error saving profesor:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rut">RUT *</Label>
          <Input
            id="rut"
            value={formData.rut}
            onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
            placeholder="12345678-9"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fecha_ingreso">Fecha de Ingreso</Label>
          <Input
            id="fecha_ingreso"
            type="date"
            value={formData.fecha_ingreso}
            onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombres">Nombres *</Label>
          <Input
            id="nombres"
            value={formData.nombres}
            onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apellido_paterno">Apellido Paterno *</Label>
          <Input
            id="apellido_paterno"
            value={formData.apellido_paterno}
            onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apellido_materno">Apellido Materno</Label>
          <Input
            id="apellido_materno"
            value={formData.apellido_materno}
            onChange={(e) => setFormData({ ...formData, apellido_materno: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="profesor@colegio.cl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            placeholder="+56 9 1234 5678"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="especialidad">Especialidad</Label>
          <Input
            id="especialidad"
            value={formData.especialidad}
            onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
            placeholder="Ej: Matemáticas, Lenguaje"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="titulo">Título Profesional</Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Ej: Profesor de Educación Básica"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {profesor ? 'Actualizar' : 'Crear'} Profesor
        </Button>
      </div>
    </form>
  );
}

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
import { Estudiante, EstudianteCreate, EstudianteUpdate } from '@/types/educacion';
import { Loader2 } from 'lucide-react';

interface EstudianteFormProps {
  estudiante?: Estudiante;
  cursos: { id: string; nombre: string }[];
  onSave: (data: EstudianteCreate | EstudianteUpdate) => Promise<void>;
  onCancel: () => void;
}

export function EstudianteForm({ estudiante, cursos, onSave, onCancel }: EstudianteFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rut: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    genero: '',
    direccion: '',
    telefono: '',
    email: '',
    curso_id: '',
    observaciones: '',
  });

  useEffect(() => {
    if (estudiante) {
      setFormData({
        rut: estudiante.rut,
        nombres: estudiante.nombres,
        apellido_paterno: estudiante.apellido_paterno,
        apellido_materno: estudiante.apellido_materno || '',
        fecha_nacimiento: estudiante.fecha_nacimiento,
        genero: estudiante.genero || '',
        direccion: estudiante.direccion || '',
        telefono: estudiante.telefono || '',
        email: estudiante.email || '',
        curso_id: estudiante.curso_id || '',
        observaciones: estudiante.observaciones || '',
      });
    }
  }, [estudiante]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: EstudianteCreate | EstudianteUpdate = {
        ...formData,
        curso_id: formData.curso_id || undefined,
        genero: (formData.genero || undefined) as EstudianteCreate['genero'],
      };

      await onSave(data);
    } catch (error) {
      console.error('Error saving estudiante:', error);
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
          <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
          <Input
            id="fecha_nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
            required
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
          <Label htmlFor="genero">Género</Label>
          <Select
            value={formData.genero}
            onValueChange={(value) => setFormData({ ...formData, genero: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="femenino">Femenino</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="curso_id">Curso</Label>
          <Select
            value={formData.curso_id}
            onValueChange={(value) => setFormData({ ...formData, curso_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar curso" />
            </SelectTrigger>
            <SelectContent>
              {cursos.map((curso) => (
                <SelectItem key={curso.id} value={curso.id}>
                  {curso.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="direccion">Dirección</Label>
        <Input
          id="direccion"
          value={formData.direccion}
          onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
          placeholder="Calle, número, comuna"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            placeholder="+56 9 1234 5678"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="estudiante@email.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <textarea
          id="observaciones"
          value={formData.observaciones}
          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
          rows={3}
          placeholder="Observaciones adicionales..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" className={SECONDARY_ACTION} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className={PRIMARY_ACTION} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {estudiante ? 'Actualizar' : 'Crear'} Estudiante
        </Button>
      </div>
    </form>
  );
}

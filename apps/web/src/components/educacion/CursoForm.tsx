'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Curso, CursoCreate, CursoUpdate } from '@/types/educacion';
import { Loader2 } from 'lucide-react';

interface CursoFormProps {
  curso?: Curso;
  profesores: { id: string; nombres: string; apellido_paterno: string }[];
  onSave: (data: CursoCreate | CursoUpdate) => Promise<void>;
  onCancel: () => void;
}

export function CursoForm({ curso, profesores, onSave, onCancel }: CursoFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    nivel: '',
    jornada: '',
    profesor_jefe_id: '',
    anio_lectivo: new Date().getFullYear(),
    cupo_maximo: 30,
    sala: '',
  });

  useEffect(() => {
    if (curso) {
      setFormData({
        nombre: curso.nombre,
        nivel: curso.nivel,
        jornada: curso.jornada || '',
        profesor_jefe_id: curso.profesor_jefe_id || '',
        anio_lectivo: curso.anio_lectivo,
        cupo_maximo: curso.cupo_maximo || 30,
        sala: curso.sala || '',
      });
    }
  }, [curso]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: CursoCreate | CursoUpdate = {
        ...formData,
        nivel: formData.nivel as CursoCreate['nivel'],
        profesor_jefe_id: formData.profesor_jefe_id || undefined,
        jornada: (formData.jornada || undefined) as CursoCreate['jornada'],
      };

      await onSave(data);
    } catch (error) {
      console.error('Error saving curso:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del Curso *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: 1° Básico A"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nivel">Nivel *</Label>
          <Select
            value={formData.nivel}
            onValueChange={(value) => setFormData({ ...formData, nivel: value })}
            required
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="jornada">Jornada</Label>
          <Select
            value={formData.jornada}
            onValueChange={(value) => setFormData({ ...formData, jornada: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar jornada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manana">Mañana</SelectItem>
              <SelectItem value="tarde">Tarde</SelectItem>
              <SelectItem value="completa">Completa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="anio_lectivo">Año Lectivo *</Label>
          <Input
            id="anio_lectivo"
            type="number"
            value={formData.anio_lectivo}
            onChange={(e) => setFormData({ ...formData, anio_lectivo: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="profesor_jefe_id">Profesor Jefe</Label>
          <Select
            value={formData.profesor_jefe_id}
            onValueChange={(value) => setFormData({ ...formData, profesor_jefe_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar profesor" />
            </SelectTrigger>
            <SelectContent>
              {profesores.map((prof) => (
                <SelectItem key={prof.id} value={prof.id}>
                  {prof.nombres} {prof.apellido_paterno}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sala">Sala</Label>
          <Input
            id="sala"
            value={formData.sala}
            onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
            placeholder="Ej: Sala 101"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cupo_maximo">Cupos Disponibles</Label>
        <Input
          id="cupo_maximo"
          type="number"
          value={formData.cupo_maximo}
          onChange={(e) => setFormData({ ...formData, cupo_maximo: parseInt(e.target.value) })}
          min="1"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {curso ? 'Actualizar' : 'Crear'} Curso
        </Button>
      </div>
    </form>
  );
}

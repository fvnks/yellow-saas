'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PRIMARY_ACTION, SECONDARY_ACTION } from './button-classes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Apoderado, ApoderadoCreate, ApoderadoUpdate } from '@/types/educacion';
import { Loader2 } from 'lucide-react';

interface ApoderadoFormProps {
  apoderado?: Apoderado;
  onSave: (data: ApoderadoCreate | ApoderadoUpdate) => Promise<void>;
  onCancel: () => void;
}

export function ApoderadoForm({ apoderado, onSave, onCancel }: ApoderadoFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rut: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    telefono: '',
    email: '',
    direccion: '',
    ocupacion: '',
  });

  useEffect(() => {
    if (apoderado) {
      setFormData({
        rut: apoderado.rut,
        nombres: apoderado.nombres,
        apellido_paterno: apoderado.apellido_paterno,
        apellido_materno: apoderado.apellido_materno || '',
        telefono: apoderado.telefono || '',
        email: apoderado.email || '',
        direccion: apoderado.direccion || '',
        ocupacion: apoderado.ocupacion || '',
      });
    }
  }, [apoderado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: ApoderadoCreate | ApoderadoUpdate = {
        ...formData,
        apellido_materno: formData.apellido_materno || undefined,
        telefono: formData.telefono || undefined,
        email: formData.email || undefined,
        direccion: formData.direccion || undefined,
        ocupacion: formData.ocupacion || undefined,
      };

      await onSave(data);
    } catch (error) {
      console.error('Error saving apoderado:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="apoderado@email.com"
          />
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

      <div className="space-y-2">
        <Label htmlFor="ocupacion">Ocupación</Label>
        <Input
          id="ocupacion"
          value={formData.ocupacion}
          onChange={(e) => setFormData({ ...formData, ocupacion: e.target.value })}
          placeholder="Ej: Ingeniero, Profesora, etc."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" className={SECONDARY_ACTION} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className={PRIMARY_ACTION} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {apoderado ? 'Actualizar' : 'Crear'} Apoderado
        </Button>
      </div>
    </form>
  );
}

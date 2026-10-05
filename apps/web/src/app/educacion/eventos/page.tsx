'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, MapPin, Users, Check } from 'lucide-react';
import { Evento } from '@/types/educacion';
import { CreateEntityModal } from '@/components/educacion/CreateEntityModal';

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/educacion/eventos');
      const data = await res.json();
      setEventos(data.data || []);
    } catch (error) {
      console.error('Error fetching eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'reunion':
        return 'bg-blue-100 text-blue-800';
      case 'celebracion':
        return 'bg-green-100 text-green-800';
      case 'salida_pedagogica':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-gray-600">Gestión de eventos y actividades</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map((evento) => (
            <Card key={evento.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{evento.titulo}</CardTitle>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs capitalize ${getTipoColor(evento.tipo)}`}>
                      {evento.tipo.replace('_', ' ')}
                    </span>
                  </div>
                  {evento.requiere_autorizacion && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Check className="h-4 w-4" />
                      <span className="text-xs">Autorización</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(evento.fecha_inicio).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {evento.ubicacion && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{evento.ubicacion}</span>
                    </div>
                  )}
                  {evento.curso_nombre && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{evento.curso_nombre}</span>
                    </div>
                  )}
                </div>
                {evento.descripcion && (
                  <p className="mt-3 text-sm text-gray-700">{evento.descripcion}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateEntityModal
        title="Nuevo Evento"
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        endpoint="/api/educacion/eventos"
        fields={[
          { name: 'titulo', label: 'Título', required: true },
          {
            name: 'tipo',
            label: 'Tipo',
            type: 'select',
            required: true,
            options: [
              { value: 'reunion', label: 'Reunión' },
              { value: 'celebracion', label: 'Celebración' },
              { value: 'salida_pedagogica', label: 'Salida pedagógica' },
              { value: 'otro', label: 'Otro' },
            ],
          },
          { name: 'fecha_inicio', label: 'Fecha de inicio', type: 'date', required: true },
          { name: 'fecha_termino', label: 'Fecha de término', type: 'date' },
          { name: 'ubicacion', label: 'Ubicación' },
          { name: 'descripcion', label: 'Descripción', type: 'textarea' },
          { name: 'requiere_autorizacion', label: 'Requiere autorización', type: 'checkbox', defaultValue: false },
        ]}
        onSuccess={fetchEventos}
      />
    </div>
  );
}

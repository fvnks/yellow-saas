'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Bus, MapPin, Users, Clock } from 'lucide-react';
import { TransporteRuta } from '@/types/educacion';

export default function TransportePage() {
  const [rutas, setRutas] = useState<TransporteRuta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRutas();
  }, []);

  const fetchRutas = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/educacion/transporte/rutas');
      const data = await res.json();
      setRutas(data.data || []);
    } catch (error) {
      console.error('Error fetching rutas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transporte Escolar</h1>
          <p className="text-gray-600">Gestión de rutas y paraderos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Ruta
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rutas.map((ruta) => (
            <Card key={ruta.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{ruta.nombre}</CardTitle>
                    <p className="text-sm text-gray-500">Ruta de transporte</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ruta.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {ruta.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ruta.conductor && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Conductor: {ruta.conductor}</span>
                    </div>
                  )}
                  {ruta.patente && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Bus className="h-4 w-4" />
                      <span>Patente: {ruta.patente}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>Paraderos: {ruta.total_paraderos || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Estudiantes: {ruta.total_estudiantes || 0}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Ver Detalle
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { Bell, Loader2 } from 'lucide-react';

interface Comunicado {
  id: string;
  titulo: string;
  contenido: string;
  tipo: string;
  fecha_publicacion: string;
  curso_nombre?: string;
}

export default function ComunicadosPage() {
  const { apoderado, loading: authLoading } = usePortalAuth();
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComunicados();
  }, []);

  const fetchComunicados = async () => {
    try {
      setLoading(true);
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('portal_token='))
        ?.split('=')[1];

      const res = await fetch('/api/portal-apoderado/comunicados', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setComunicados(data.data || []);
    } catch (error) {
      console.error('Error fetching comunicados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Comunicados</h1>
        <p className="text-gray-600">Información y avisos del establecimiento</p>
      </div>

      {comunicados.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay comunicados disponibles
        </div>
      ) : (
        <div className="space-y-4">
          {comunicados.map((comunicado) => (
            <Card key={comunicado.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{comunicado.titulo}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {new Date(comunicado.fecha_publicacion).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {comunicado.tipo === 'general' ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        General
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {comunicado.curso_nombre}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{comunicado.contenido}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

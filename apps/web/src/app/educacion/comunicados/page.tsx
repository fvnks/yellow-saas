'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Bell, Users, GraduationCap, Send, Loader2 } from 'lucide-react';
import { Comunicado } from '@/types/educacion';

export default function ComunicadosPage() {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<{ success: number; failed: number } | null>(null);

  useEffect(() => {
    fetchComunicados();
  }, []);

  const fetchComunicados = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/educacion/comunicados');
      const data = await res.json();
      setComunicados(data.data || []);
    } catch (error) {
      console.error('Error fetching comunicados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarNotificacion = async (comunicadoId: string) => {
    setSendingId(comunicadoId);
    setSendResult(null);

    try {
      const res = await fetch('/api/educacion/notificaciones/comunicado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comunicado_id: comunicadoId }),
      });

      const data = await res.json();
      setSendResult(data.data);
      
      // Limpiar resultado después de 5 segundos
      setTimeout(() => setSendResult(null), 5000);
    } catch (error) {
      console.error('Error enviando notificación:', error);
      alert('Error al enviar notificación');
    } finally {
      setSendingId(null);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'general':
        return <Bell className="h-4 w-4 text-blue-600" />;
      case 'por_curso':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'por_nivel':
        return <GraduationCap className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comunicados</h1>
          <p className="text-gray-600">Gestión de comunicados a apoderados</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Comunicado
        </Button>
      </div>

      {sendResult && (
        <div className="p-4 bg-green-50 text-green-800 rounded-lg">
          ✅ Notificaciones enviadas: {sendResult.success} exitosas, {sendResult.failed} fallidas
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
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
                    {getTipoIcon(comunicado.tipo)}
                    <span className="capitalize text-sm text-gray-600">
                      {comunicado.tipo.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{comunicado.contenido}</p>
                {comunicado.curso_nombre && (
                  <p className="mt-2 text-sm text-gray-500">
                    Curso: {comunicado.curso_nombre}
                  </p>
                )}
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEnviarNotificacion(comunicado.id)}
                    disabled={sendingId === comunicado.id}
                  >
                    {sendingId === comunicado.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Enviar Notificación
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

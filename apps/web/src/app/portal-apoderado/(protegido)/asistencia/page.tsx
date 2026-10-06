'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { Check, X, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface Asistencia {
  id: string;
  fecha: string;
  estado: string;
  justificacion?: string;
}

interface Estudiante {
  estudiante: {
    nombres: string;
    apellido_paterno: string;
    rut: string;
    curso: string;
  };
  resumen: {
    presentes: number;
    ausentes: number;
    atrasos: number;
    justificados: number;
    total: number;
  };
  asistencias: Asistencia[];
}

export default function AsistenciaPage() {
  const { apoderado, loading: authLoading } = usePortalAuth();
  const [asistencias, setAsistencias] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAsistencias();
  }, []);

  const fetchAsistencias = async () => {
    try {
      setLoading(true);
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('portal_token='))
        ?.split('=')[1];

      const res = await fetch('/api/portal-apoderado/asistencia', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setAsistencias(data.data || []);
    } catch (error) {
      console.error('Error fetching asistencia:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'presente':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'ausente':
        return <X className="h-4 w-4 text-red-600" />;
      case 'atrasado':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'justificado':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return null;
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
        <h1 className="text-2xl font-bold text-gray-900">Asistencia</h1>
        <p className="text-gray-600">Control de asistencia de tus pupilos</p>
      </div>

      {asistencias.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No se encontraron registros de asistencia
        </div>
      ) : (
        asistencias.map((est) => (
          <div key={est.estudiante.rut} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {est.estudiante.nombres} {est.estudiante.apellido_paterno} - {est.estudiante.curso}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{est.resumen.presentes}</div>
                    <div className="text-sm text-gray-600">Presentes</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{est.resumen.ausentes}</div>
                    <div className="text-sm text-gray-600">Ausentes</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{est.resumen.atrasos}</div>
                    <div className="text-sm text-gray-600">Atrasos</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{est.resumen.justificados}</div>
                    <div className="text-sm text-gray-600">Justificados</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {est.resumen.total > 0
                        ? Math.round((est.resumen.presentes / est.resumen.total) * 100)
                        : 0}%
                    </div>
                    <div className="text-sm text-gray-600">% Asistencia</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalle de Asistencia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Justificación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {est.asistencias.slice(0, 10).map((asist) => (
                        <tr key={asist.id} className="border-b">
                          <td className="py-3 px-4">
                            {new Date(asist.fecha).toLocaleDateString('es-CL')}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getEstadoIcon(asist.estado)}
                              <span className="capitalize">{asist.estado}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {asist.justificacion || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}

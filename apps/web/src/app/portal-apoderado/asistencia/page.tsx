'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

export default function AsistenciaPage() {
  // Datos de ejemplo
  const asistencias = [
    {
      estudiante: 'Juan Pérez',
      curso: '3° Básico A',
      resumen: {
        presentes: 18,
        ausentes: 2,
        atrasos: 1,
        justificados: 1,
        porcentaje: 90,
      },
      detalle: [
        { fecha: '2026-10-01', estado: 'presente' },
        { fecha: '2026-10-02', estado: 'presente' },
        { fecha: '2026-10-03', estado: 'ausente', justificacion: 'Cita médica' },
        { fecha: '2026-10-04', estado: 'atrasado' },
        { fecha: '2026-10-05', estado: 'presente' },
      ],
    },
  ];

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Asistencia</h1>
        <p className="text-gray-600">Control de asistencia de tus pupilos</p>
      </div>

      {asistencias.map((est) => (
        <div key={est.estudiante} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{est.estudiante} - {est.curso}</CardTitle>
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
                  <div className="text-2xl font-bold text-purple-600">{est.resumen.porcentaje}%</div>
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
                    {est.detalle.map((asist, idx) => (
                      <tr key={idx} className="border-b">
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
      ))}
    </div>
  );
}

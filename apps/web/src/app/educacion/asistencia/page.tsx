'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Check, X, Clock, AlertCircle } from 'lucide-react';
import { Asistencia } from '@/types/educacion';

export default function AsistenciaPage() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCurso, setSelectedCurso] = useState('');

  useEffect(() => {
    fetchAsistencias();
  }, [selectedDate, selectedCurso]);

  const fetchAsistencias = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('fecha', selectedDate);
      if (selectedCurso) params.append('curso_id', selectedCurso);

      const res = await fetch(`/api/educacion/asistencia?${params}`);
      const data = await res.json();
      setAsistencias(data.data || []);
    } catch (error) {
      console.error('Error fetching asistencia:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (estudianteId: string, estado: string) => {
    try {
      await fetch('/api/educacion/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: estudianteId,
          curso_id: selectedCurso,
          fecha: selectedDate,
          estado,
        }),
      });
      fetchAsistencias();
    } catch (error) {
      console.error('Error marking attendance:', error);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Asistencia</h1>
        <p className="text-gray-600">Registro de asistencia diaria</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Control de Asistencia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
              <select
                value={selectedCurso}
                onChange={(e) => setSelectedCurso(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">Seleccionar curso</option>
                <option value="1">1° Básico A</option>
                <option value="2">1° Básico B</option>
                <option value="3">2° Básico A</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Estudiante</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">RUT</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {asistencias.map((asist) => (
                    <tr key={asist.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {asist.estudiante_nombres} {asist.estudiante_apellido}
                      </td>
                      <td className="py-3 px-4">{asist.estudiante_rut}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getEstadoIcon(asist.estado)}
                          <span className="capitalize">{asist.estado}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAttendance(asist.estudiante_id, 'presente')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAttendance(asist.estudiante_id, 'ausente')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAttendance(asist.estudiante_id, 'atrasado')}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

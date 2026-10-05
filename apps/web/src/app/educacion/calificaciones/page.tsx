'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { Calificacion } from '@/types/educacion';
import { CreateEntityModal } from '@/components/educacion/CreateEntityModal';
import { useEducacionOptions } from '@/hooks/useEducacionOptions';

export default function CalificacionesPage() {
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurso, setSelectedCurso] = useState('');
  const [selectedPeriodo, setSelectedPeriodo] = useState('1');
  const [createOpen, setCreateOpen] = useState(false);
  const opciones = useEducacionOptions();

  useEffect(() => {
    fetchCalificaciones();
  }, [selectedCurso, selectedPeriodo]);

  const fetchCalificaciones = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCurso) params.append('curso_id', selectedCurso);
      if (selectedPeriodo) params.append('periodo', selectedPeriodo);

      const res = await fetch(`/api/educacion/calificaciones?${params}`);
      const data = await res.json();
      setCalificaciones(data.data || []);
    } catch (error) {
      console.error('Error fetching calificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotaColor = (nota: number) => {
    if (nota >= 6.0) return 'text-green-600';
    if (nota >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Libro de Clases</h1>
          <p className="text-gray-600">Gestión de calificaciones y evaluaciones</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ingresar Notas
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
              <select
                value={selectedCurso}
                onChange={(e) => setSelectedCurso(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">Seleccionar curso</option>
                {opciones.cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.anio_lectivo})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
              <select
                value={selectedPeriodo}
                onChange={(e) => setSelectedPeriodo(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="1">1° Trimestre</option>
                <option value="2">2° Trimestre</option>
                <option value="3">3° Trimestre</option>
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
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Asignatura</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Tipo Evaluación</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nota</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {calificaciones.map((cal) => (
                    <tr key={cal.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {cal.estudiante_nombres} {cal.estudiante_apellido}
                      </td>
                      <td className="py-3 px-4">{cal.asignatura_nombre}</td>
                      <td className="py-3 px-4 capitalize">{cal.tipo_evaluacion}</td>
                      <td className={`py-3 px-4 font-bold ${getNotaColor(Number(cal.nota))}`}>
                        {Number(cal.nota).toFixed(1)}
                      </td>
                      <td className="py-3 px-4">
                        {cal.fecha_evaluacion
                          ? new Date(cal.fecha_evaluacion).toLocaleDateString('es-CL')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateEntityModal
        title="Ingresar Nota"
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        endpoint="/api/educacion/calificaciones"
        fields={[
          {
            name: 'estudiante_id',
            label: 'Estudiante',
            type: 'select',
            required: true,
            options: opciones.estudiantes.map((e) => ({ value: e.id, label: `${e.nombres} ${e.apellido_paterno} (${e.rut})` })),
          },
          {
            name: 'curso_id',
            label: 'Curso',
            type: 'select',
            required: true,
            options: opciones.cursos.map((c) => ({ value: c.id, label: `${c.nombre} (${c.anio_lectivo})` })),
          },
          {
            name: 'asignatura_id',
            label: 'Asignatura',
            type: 'select',
            required: true,
            options: opciones.asignaturas.map((a) => ({ value: a.id, label: a.nombre })),
          },
          {
            name: 'periodo',
            label: 'Período',
            type: 'select',
            required: true,
            options: [
              { value: '1', label: '1° Trimestre' },
              { value: '2', label: '2° Trimestre' },
              { value: '3', label: '3° Trimestre' },
            ],
          },
          { name: 'anio_lectivo', label: 'Año lectivo', type: 'number', required: true, defaultValue: 2026 },
          { name: 'nota', label: 'Nota (1.0 - 7.0)', type: 'number', required: true, min: 1, max: 7, step: '0.1' },
          { name: 'tipo_evaluacion', label: 'Tipo de evaluación', required: true, placeholder: 'Ej: Prueba 1' },
          { name: 'descripcion', label: 'Descripción' },
          { name: 'fecha_evaluacion', label: 'Fecha de evaluación', type: 'date' },
        ]}
        onSuccess={fetchCalificaciones}
      />
    </div>
  );
}

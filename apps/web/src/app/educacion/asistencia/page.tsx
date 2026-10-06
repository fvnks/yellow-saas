'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Clock, AlertCircle, Users } from 'lucide-react';
import { Asistencia } from '@/types/educacion';
import { useEducacionOptions } from '@/hooks/useEducacionOptions';

export default function AsistenciaPage() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCurso, setSelectedCurso] = useState('');
  const opciones = useEducacionOptions();

  useEffect(() => {
    fetchAsistencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Si hay un curso seleccionado, mostramos a TODOS sus estudiantes, sin
  // importar si ya existe un registro de asistencia para esa fecha.
  const estudiantesDelCurso = opciones.estudiantes.filter((e) => e.curso_id === selectedCurso);

  const estadoDe = (estudianteId: string) => {
    const existente = asistencias.find((a) => a.estudiante_id === estudianteId);
    return existente?.estado ?? null;
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

  const getEstadoIcon = (estado: string | null) => {
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
        return <span className="text-xs text-slate-400">Sin marcar</span>;
    }
  };

  const renderFila = (
    id: string,
    nombres: string,
    apellido: string | undefined,
    rut: string | undefined
  ) => (
    <tr key={id} className="border-b hover:bg-slate-50">
      <td className="py-3 px-4">{nombres} {apellido || ''}</td>
      <td className="py-3 px-4">{rut || '-'}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {getEstadoIcon(estadoDe(id))}
          {estadoDe(id) && <span className="capitalize">{estadoDe(id)}</span>}
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex justify-end gap-2">
          <Button variant={estadoDe(id) === 'presente' ? 'default' : 'outline'} size="sm" onClick={() => markAttendance(id, 'presente')} title="Presente">
            <Check className="h-4 w-4" />
          </Button>
          <Button variant={estadoDe(id) === 'ausente' ? 'default' : 'outline'} size="sm" onClick={() => markAttendance(id, 'ausente')} title="Ausente">
            <X className="h-4 w-4" />
          </Button>
          <Button variant={estadoDe(id) === 'atrasado' ? 'default' : 'outline'} size="sm" onClick={() => markAttendance(id, 'atrasado')} title="Atrasado">
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-black text-ink">Asistencia</h1>
        <p className="text-sm text-slate-500 mt-1">Registro de asistencia diaria</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Control de Asistencia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Curso</label>
              <select
                value={selectedCurso}
                onChange={(e) => setSelectedCurso(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
              >
                <option value="">Seleccionar curso</option>
                {opciones.cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.anio_lectivo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedCurso === '' ? (
            <p className="text-center py-8 text-slate-500 flex items-center justify-center gap-2">
              <Users className="h-4 w-4" /> Selecciona un curso para pasar asistencia.
            </p>
          ) : loading ? (
            <div className="text-center py-8 text-slate-500">Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Estudiante</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">RUT</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Estado</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantesDelCurso.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No hay estudiantes en este curso.
                      </td>
                    </tr>
                  ) : (
                    estudiantesDelCurso.map((e) =>
                      renderFila(e.id, e.nombres, e.apellido_paterno, e.rut)
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

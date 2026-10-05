'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

interface AttendanceGridProps {
  estudiantes: {
    id: string;
    nombre: string;
    rut: string;
  }[];
  onSave: (asistencias: { estudiante_id: string; estado: string }[]) => void;
}

export function AttendanceGrid({ estudiantes, onSave }: AttendanceGridProps) {
  const [asistencias, setAsistencias] = useState<Record<string, string>>({});

  const markAttendance = (estudianteId: string, estado: string) => {
    setAsistencias((prev) => ({
      ...prev,
      [estudianteId]: prev[estudianteId] === estado ? '' : estado,
    }));
  };

  const markAll = (estado: string) => {
    const newAsistencias: Record<string, string> = {};
    estudiantes.forEach((est) => {
      newAsistencias[est.id] = estado;
    });
    setAsistencias(newAsistencias);
  };

  const handleSave = () => {
    const data = Object.entries(asistencias).map(([estudiante_id, estado]) => ({
      estudiante_id,
      estado,
    }));
    onSave(data);
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
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => markAll('presente')}>
          <Check className="h-4 w-4 mr-1" /> Todos Presentes
        </Button>
        <Button variant="outline" size="sm" onClick={() => markAll('ausente')}>
          <X className="h-4 w-4 mr-1" /> Todos Ausentes
        </Button>
        <Button variant="outline" size="sm" onClick={() => setAsistencias({})}>
          Limpiar
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Estudiante</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">RUT</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Presente</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Ausente</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Atrasado</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Justificado</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.map((est) => (
              <tr key={est.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">{est.nombre}</td>
                <td className="py-3 px-4">{est.rut}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => markAttendance(est.id, 'presente')}
                    className={`p-2 rounded-full ${
                      asistencias[est.id] === 'presente'
                        ? 'bg-green-100'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Check className={`h-4 w-4 ${
                      asistencias[est.id] === 'presente' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </button>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => markAttendance(est.id, 'ausente')}
                    className={`p-2 rounded-full ${
                      asistencias[est.id] === 'ausente'
                        ? 'bg-red-100'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <X className={`h-4 w-4 ${
                      asistencias[est.id] === 'ausente' ? 'text-red-600' : 'text-gray-400'
                    }`} />
                  </button>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => markAttendance(est.id, 'atrasado')}
                    className={`p-2 rounded-full ${
                      asistencias[est.id] === 'atrasado'
                        ? 'bg-yellow-100'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Clock className={`h-4 w-4 ${
                      asistencias[est.id] === 'atrasado' ? 'text-yellow-600' : 'text-gray-400'
                    }`} />
                  </button>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => markAttendance(est.id, 'justificado')}
                    className={`p-2 rounded-full ${
                      asistencias[est.id] === 'justificado'
                        ? 'bg-blue-100'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <AlertCircle className={`h-4 w-4 ${
                      asistencias[est.id] === 'justificado' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Guardar Asistencia
        </Button>
      </div>
    </div>
  );
}

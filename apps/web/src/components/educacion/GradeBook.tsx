'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PRIMARY_ACTION } from './button-classes';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

interface GradeBookProps {
  estudiantes: {
    id: string;
    nombre: string;
    rut: string;
  }[];
  asignaturas: {
    id: string;
    nombre: string;
  }[];
  onSave: (calificaciones: {
    estudiante_id: string;
    curso_asignatura_id: string;
    nota: number;
    tipo_evaluacion: string;
  }[]) => void;
}

export function GradeBook({ estudiantes, asignaturas, onSave }: GradeBookProps) {
  const [selectedAsignatura, setSelectedAsignatura] = useState('');
  const [selectedPeriodo, setSelectedPeriodo] = useState(1);
  const [tipoEvaluacion, setTipoEvaluacion] = useState('prueba');
  const [notas, setNotas] = useState<Record<string, number>>({});

  const handleNotaChange = (estudianteId: string, nota: string) => {
    const numNota = parseFloat(nota);
    if (numNota >= 1.0 && numNota <= 7.0) {
      setNotas((prev) => ({ ...prev, [estudianteId]: numNota }));
    }
  };

  const handleSave = () => {
    const data = Object.entries(notas).map(([estudiante_id, nota]) => ({
      estudiante_id,
      curso_asignatura_id: selectedAsignatura,
      nota,
      tipo_evaluacion: tipoEvaluacion,
      periodo: selectedPeriodo,
    }));
    onSave(data);
  };

  const getNotaColor = (nota: number) => {
    if (nota >= 6.0) return 'text-green-600';
    if (nota >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Asignatura</label>
          <select
            value={selectedAsignatura}
            onChange={(e) => setSelectedAsignatura(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
          >
            <option value="">Seleccionar asignatura</option>
            {asignaturas.map((asig) => (
              <option key={asig.id} value={asig.id}>{asig.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Período</label>
          <select
            value={selectedPeriodo}
            onChange={(e) => setSelectedPeriodo(parseInt(e.target.value))}
            className="px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
          >
            <option value={1}>1° Trimestre</option>
            <option value={2}>2° Trimestre</option>
            <option value={3}>3° Trimestre</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Evaluación</label>
          <select
            value={tipoEvaluacion}
            onChange={(e) => setTipoEvaluacion(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
          >
            <option value="prueba">Prueba</option>
            <option value="trabajo">Trabajo</option>
            <option value="participacion">Participación</option>
            <option value="examen">Examen</option>
          </select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Estudiante</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">RUT</th>
              <th className="text-center py-3 px-4 font-medium text-slate-600">Nota</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.map((est) => (
              <tr key={est.id} className="border-t hover:bg-slate-50">
                <td className="py-3 px-4">{est.nombre}</td>
                <td className="py-3 px-4">{est.rut}</td>
                <td className="py-3 px-4 text-center">
                  <Input
                    type="number"
                    min="1.0"
                    max="7.0"
                    step="0.1"
                    value={notas[est.id] || ''}
                    onChange={(e) => handleNotaChange(est.id, e.target.value)}
                    className="w-20 text-center"
                    placeholder="1.0 - 7.0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button className={PRIMARY_ACTION} onClick={handleSave} disabled={!selectedAsignatura}>
          Guardar Notas
        </Button>
      </div>
    </div>
  );
}

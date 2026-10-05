'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { Loader2 } from 'lucide-react';

interface Nota {
  id: string;
  asignatura: string;
  nota: number;
  tipo_evaluacion: string;
  periodo: number;
  anio_lectivo: number;
  fecha_evaluacion: string;
}

interface Estudiante {
  estudiante: {
    nombres: string;
    apellido_paterno: string;
    rut: string;
    curso: string;
  };
  notas: Nota[];
}

export default function NotasPage() {
  const { apoderado, loading: authLoading } = usePortalAuth();
  const [notas, setNotas] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotas();
  }, []);

  const fetchNotas = async () => {
    try {
      setLoading(true);
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('portal_token='))
        ?.split('=')[1];

      const res = await fetch('/api/portal-apoderado/notas', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setNotas(data.data || []);
    } catch (error) {
      console.error('Error fetching notas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotaColor = (nota: number) => {
    if (nota >= 6.0) return 'text-green-600';
    if (nota >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
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
        <h1 className="text-2xl font-bold text-gray-900">Notas</h1>
        <p className="text-gray-600">Calificaciones de tus pupilos</p>
      </div>

      {notas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No se encontraron notas
        </div>
      ) : (
        notas.map((est) => (
          <Card key={est.estudiante.rut}>
            <CardHeader>
              <CardTitle>
                {est.estudiante.nombres} {est.estudiante.apellido_paterno} - {est.estudiante.curso}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Asignatura</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">1° Trimestre</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">2° Trimestre</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">3° Trimestre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(new Set(est.notas.map((n) => n.asignatura))).map((asignatura) => {
                      const notasAsignatura = est.notas.filter((n) => n.asignatura === asignatura);
                      const nota1 = notasAsignatura.find((n) => n.periodo === 1);
                      const nota2 = notasAsignatura.find((n) => n.periodo === 2);
                      const nota3 = notasAsignatura.find((n) => n.periodo === 3);

                      return (
                        <tr key={asignatura} className="border-b">
                          <td className="py-3 px-4">{asignatura}</td>
                          <td className={`py-3 px-4 text-center font-medium ${nota1 ? getNotaColor(nota1.nota) : 'text-gray-400'}`}>
                            {nota1 ? nota1.nota.toFixed(1) : '-'}
                          </td>
                          <td className={`py-3 px-4 text-center font-medium ${nota2 ? getNotaColor(nota2.nota) : 'text-gray-400'}`}>
                            {nota2 ? nota2.nota.toFixed(1) : '-'}
                          </td>
                          <td className={`py-3 px-4 text-center font-medium ${nota3 ? getNotaColor(nota3.nota) : 'text-gray-400'}`}>
                            {nota3 ? nota3.nota.toFixed(1) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

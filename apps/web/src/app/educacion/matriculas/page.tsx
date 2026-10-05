'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Check, X, Clock } from 'lucide-react';
import { Matricula } from '@/types/educacion';

export default function MatriculasPage() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnio, setSelectedAnio] = useState(2026);

  useEffect(() => {
    fetchMatriculas();
  }, [selectedAnio]);

  const fetchMatriculas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('anio_lectivo', selectedAnio.toString());

      const res = await fetch(`/api/educacion/matriculas?${params}`);
      const data = await res.json();
      setMatriculas(data.data || []);
    } catch (error) {
      console.error('Error fetching matriculas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'cancelada':
        return <X className="h-4 w-4 text-red-600" />;
      case 'traspasada':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matrículas</h1>
          <p className="text-gray-600">Gestión de matrículas anuales</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Matrícula
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Matrículas</CardTitle>
            <select
              value={selectedAnio}
              onChange={(e) => setSelectedAnio(parseInt(e.target.value))}
              className="px-3 py-2 border rounded-md"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Estudiante</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">RUT</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Curso</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha Matrícula</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {matriculas.map((matricula) => (
                    <tr key={matricula.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {matricula.estudiante_nombres} {matricula.estudiante_apellido}
                      </td>
                      <td className="py-3 px-4">{matricula.estudiante_rut}</td>
                      <td className="py-3 px-4">{matricula.curso_nombre}</td>
                      <td className="py-3 px-4">
                        {new Date(matricula.fecha_matricula).toLocaleDateString('es-CL')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getEstadoIcon(matricula.estado)}
                          <span className="capitalize">{matricula.estado}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
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

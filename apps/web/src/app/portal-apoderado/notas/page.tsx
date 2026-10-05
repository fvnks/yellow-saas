'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotasPage() {
  // Datos de ejemplo
  const notas = [
    {
      estudiante: 'Juan Pérez',
      curso: '3° Básico A',
      asignaturas: [
        { nombre: 'Matemáticas', promedio: 6.2, notas: [6.0, 6.5, 6.1] },
        { nombre: 'Lenguaje', promedio: 6.5, notas: [6.3, 6.7, 6.5] },
        { nombre: 'Ciencias', promedio: 6.0, notas: [5.8, 6.2, 6.0] },
        { nombre: 'Historia', promedio: 6.4, notas: [6.2, 6.6, 6.4] },
        { nombre: 'Inglés', promedio: 6.8, notas: [6.5, 7.0, 6.9] },
      ],
    },
  ];

  const getNotaColor = (nota: number) => {
    if (nota >= 6.0) return 'text-green-600';
    if (nota >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notas</h1>
        <p className="text-gray-600">Calificaciones de tus pupilos</p>
      </div>

      {notas.map((est) => (
        <Card key={est.estudiante}>
          <CardHeader>
            <CardTitle>{est.estudiante} - {est.curso}</CardTitle>
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
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {est.asignaturas.map((asig) => (
                    <tr key={asig.nombre} className="border-b">
                      <td className="py-3 px-4">{asig.nombre}</td>
                      <td className={`py-3 px-4 text-center font-medium ${getNotaColor(asig.notas[0])}`}>
                        {asig.notas[0].toFixed(1)}
                      </td>
                      <td className={`py-3 px-4 text-center font-medium ${getNotaColor(asig.notas[1])}`}>
                        {asig.notas[1].toFixed(1)}
                      </td>
                      <td className={`py-3 px-4 text-center font-medium ${getNotaColor(asig.notas[2])}`}>
                        {asig.notas[2].toFixed(1)}
                      </td>
                      <td className={`py-3 px-4 text-center font-bold ${getNotaColor(asig.promedio)}`}>
                        {asig.promedio.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

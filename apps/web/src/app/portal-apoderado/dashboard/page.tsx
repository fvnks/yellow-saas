'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, DollarSign, Bell } from 'lucide-react';

export default function DashboardPage() {
  // Datos de ejemplo - en producción vendrían de la API
  const estudiantes = [
    { id: '1', nombre: 'Juan Pérez', curso: '3° Básico A', promedio: 6.2, asistencia: 95 },
    { id: '2', nombre: 'María Pérez', curso: '1° Básico B', promedio: 6.5, asistencia: 98 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen de tus pupilos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pupilos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estudiantes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Asistencia Promedio</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(estudiantes.reduce((acc, e) => acc + e.asistencia, 0) / estudiantes.length)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Promedio General</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(estudiantes.reduce((acc, e) => acc + e.promedio, 0) / estudiantes.length).toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pagos Pendientes</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mis Pupilos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {estudiantes.map((est) => (
                <div key={est.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{est.nombre}</div>
                    <div className="text-sm text-gray-500">{est.curso}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      <span className="text-gray-500">Promedio: </span>
                      <span className="font-medium">{est.promedio.toFixed(1)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Asistencia: </span>
                      <span className="font-medium">{est.asistencia}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                <div>
                  <div className="font-medium">Reunión de Apoderados</div>
                  <div className="text-sm text-gray-500">3° Básico A - 18:00 hrs</div>
                  <div className="text-xs text-gray-400">15 Oct 2026</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                <div>
                  <div className="font-medium">Prueba de Matemáticas</div>
                  <div className="text-sm text-gray-500">3° Básico A - 10:00 hrs</div>
                  <div className="text-xs text-gray-400">16 Oct 2026</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export default function ComunicadosPage() {
  // Datos de ejemplo
  const comunicados = [
    {
      id: '1',
      titulo: 'Reunión de Apoderados 3° Básico A',
      contenido: 'Estimados apoderados, les informamos que el día viernes 15 de octubre se realizará la reunión de apoderados del curso 3° Básico A a las 18:00 hrs en la sala de clases.',
      fecha: '2026-10-10',
      tipo: 'por_curso',
      curso: '3° Básico A',
    },
    {
      id: '2',
      titulo: 'Salida Pedagógica al Museo Interactivo',
      contenido: 'Se informa que el día 20 de octubre los estudiantes de 4° Medio A realizarán una salida pedagógica al Museo Interactivo. Se requiere autorización de los apoderados.',
      fecha: '2026-10-08',
      tipo: 'por_curso',
      curso: '4° Medio A',
    },
    {
      id: '3',
      titulo: 'Celebración del Día del Profesor',
      contenido: 'El próximo 16 de octubre celebraremos el Día del Profesor. Las actividades se realizarán durante la mañana. Los estudiantes pueden traer una tarjeta o detalle para sus profesores.',
      fecha: '2026-10-05',
      tipo: 'general',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Comunicados</h1>
        <p className="text-gray-600">Información y avisos del establecimiento</p>
      </div>

      <div className="space-y-4">
        {comunicados.map((comunicado) => (
          <Card key={comunicado.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{comunicado.titulo}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {new Date(comunicado.fecha).toLocaleDateString('es-CL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {comunicado.tipo === 'general' ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      General
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {comunicado.curso}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{comunicado.contenido}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

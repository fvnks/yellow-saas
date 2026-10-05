'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Check, X, Clock, AlertCircle } from 'lucide-react';
import { Postulacion } from '@/types/educacion';

export default function AdmisionPage() {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostulaciones();
  }, []);

  const fetchPostulaciones = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/educacion/postulaciones');
      const data = await res.json();
      setPostulaciones(data.data || []);
    } catch (error) {
      console.error('Error fetching postulaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'aceptada':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'rechazada':
        return <X className="h-4 w-4 text-red-600" />;
      case 'lista_espera':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'aceptada':
        return 'Aceptada';
      case 'rechazada':
        return 'Rechazada';
      case 'lista_espera':
        return 'Lista de Espera';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admisión</h1>
          <p className="text-gray-600">Gestión de postulaciones</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Postulación
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postulaciones.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {postulaciones.filter((p) => p.estado === 'pendiente').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Aceptadas</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {postulaciones.filter((p) => p.estado === 'aceptada').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lista Espera</CardTitle>
            <AlertCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {postulaciones.filter((p) => p.estado === 'lista_espera').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Postulaciones</CardTitle>
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
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Apoderado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nivel</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {postulaciones.map((postulacion) => (
                    <tr key={postulacion.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {postulacion.estudiante_nombres} {postulacion.estudiante_apellido_paterno}
                      </td>
                      <td className="py-3 px-4">
                        {postulacion.apoderado_nombres} {postulacion.apoderado_apellido_paterno}
                      </td>
                      <td className="py-3 px-4">{postulacion.nivel_postulacion || '-'}</td>
                      <td className="py-3 px-4">
                        {new Date(postulacion.fecha_postulacion).toLocaleDateString('es-CL')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getEstadoIcon(postulacion.estado)}
                          <span>{getEstadoLabel(postulacion.estado)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="outline" size="sm">
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

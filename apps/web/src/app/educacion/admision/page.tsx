'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PRIMARY_ACTION, SECONDARY_ACTION } from '@/components/educacion/button-classes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Check, X, Clock, AlertCircle } from 'lucide-react';
import { Postulacion } from '@/types/educacion';
import { CreateEntityModal } from '@/components/educacion/CreateEntityModal';
import { Modal } from '@/components/educacion/Modal';

export default function AdmisionPage() {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [postulacionVer, setPostulacionVer] = useState<Postulacion | null>(null);

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
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Admisión</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de postulaciones</p>
        </div>
        <Button className={PRIMARY_ACTION} onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Postulación
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postulaciones.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pendientes</CardTitle>
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
            <CardTitle className="text-sm font-medium text-slate-600">Aceptadas</CardTitle>
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
            <CardTitle className="text-sm font-medium text-slate-600">Lista Espera</CardTitle>
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
            <div className="text-center py-8 text-slate-500">Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Estudiante</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Apoderado</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Nivel</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Estado</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {postulaciones.map((postulacion) => (
                    <tr key={postulacion.id} className="border-b hover:bg-slate-50">
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
                        <Button
                          variant="outline"
                          size="sm"
                          className={SECONDARY_ACTION}
                          onClick={() => setPostulacionVer(postulacion)}
                        >
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

      <Modal
        isOpen={!!postulacionVer}
        onClose={() => setPostulacionVer(null)}
        title="Detalle de Postulación"
      >
        {postulacionVer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-500">Estudiante</label>
                <p className="text-ink">
                  {postulacionVer.estudiante_nombres} {postulacionVer.estudiante_apellido_paterno}{' '}
                  {postulacionVer.estudiante_apellido_materno || ''}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Fecha de Nacimiento</label>
                <p className="text-ink">
                  {postulacionVer.estudiante_fecha_nacimiento
                    ? new Date(postulacionVer.estudiante_fecha_nacimiento).toLocaleDateString('es-CL')
                    : '—'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Apoderado</label>
                <p className="text-ink">
                  {postulacionVer.apoderado_nombres} {postulacionVer.apoderado_apellido_paterno || ''}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Contacto</label>
                <p className="text-ink">
                  {postulacionVer.apoderado_email || '—'}
                  {postulacionVer.apoderado_telefono ? ` · ${postulacionVer.apoderado_telefono}` : ''}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Nivel</label>
                <p className="text-ink">{postulacionVer.nivel_postulacion || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Año de Postulación</label>
                <p className="text-ink">{postulacionVer.anio_postulacion || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Fecha de Postulación</label>
                <p className="text-ink">
                  {new Date(postulacionVer.fecha_postulacion).toLocaleDateString('es-CL')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Estado</label>
                <p className="text-ink">{getEstadoLabel(postulacionVer.estado)}</p>
              </div>
            </div>
            {postulacionVer.observaciones && (
              <div>
                <label className="text-sm font-medium text-slate-500">Observaciones</label>
                <p className="text-ink">{postulacionVer.observaciones}</p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                className={SECONDARY_ACTION}
                onClick={() => setPostulacionVer(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <CreateEntityModal
        title="Nueva Postulación"
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        endpoint="/api/educacion/postulaciones"
        fields={[
          { name: 'estudiante_nombres', label: 'Nombres del estudiante', required: true },
          { name: 'estudiante_apellido_paterno', label: 'Apellido paterno del estudiante', required: true },
          { name: 'estudiante_apellido_materno', label: 'Apellido materno del estudiante' },
          { name: 'estudiante_fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date' },
          { name: 'apoderado_nombres', label: 'Nombres del apoderado' },
          { name: 'apoderado_apellido_paterno', label: 'Apellido paterno del apoderado' },
          { name: 'apoderado_email', label: 'Email del apoderado', type: 'email' },
          { name: 'apoderado_telefono', label: 'Teléfono del apoderado' },
          { name: 'nivel_postulacion', label: 'Nivel al que postula' },
          { name: 'anio_postulacion', label: 'Año de postulación', type: 'number', defaultValue: 2026 },
          { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
        ]}
        onSuccess={fetchPostulaciones}
      />
    </div>
  );
}

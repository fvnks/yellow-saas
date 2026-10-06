'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { DollarSign, Download, Check, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface Pension {
  id: string;
  mes: number;
  anio: number;
  monto: number;
  fecha_vencimiento: string;
  estado: string;
  fecha_pago?: string;
  metodo_pago?: string;
}

interface Estudiante {
  estudiante: {
    nombres: string;
    apellido_paterno: string;
    rut: string;
    curso: string;
  };
  pensiones: Pension[];
}

export default function PagosPage() {
  const { apoderado, loading: authLoading } = usePortalAuth();
  const [pagos, setPagos] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPagos();
  }, []);

  const fetchPagos = async () => {
    try {
      setLoading(true);
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('portal_token='))
        ?.split('=')[1];

      const res = await fetch('/api/portal-apoderado/pagos', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setPagos(data.data || []);
    } catch (error) {
      console.error('Error fetching pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pagada':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'pendiente':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'vencida':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(monto);
  };

  const getMesNombre = (mes: number) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1];
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalPendiente = pagos.reduce((acc, est) => {
    return acc + est.pensiones
      .filter((p) => p.estado === 'pendiente' || p.estado === 'vencida')
      .reduce((sum, p) => sum + p.monto, 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
        <p className="text-gray-600">Control de pensiones y pagos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pendiente</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatMonto(totalPendiente)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pupilos</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pensiones</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pagos.reduce((acc, est) => acc + est.pensiones.length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {pagos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No se encontraron pensiones
        </div>
      ) : (
        pagos.map((est) => (
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
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Mes</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Monto</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Vencimiento</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {est.pensiones.map((pension) => (
                      <tr key={pension.id} className="border-b">
                        <td className="py-3 px-4">
                          {getMesNombre(pension.mes)} {pension.anio}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatMonto(pension.monto)}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(pension.fecha_vencimiento).toLocaleDateString('es-CL')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getEstadoIcon(pension.estado)}
                            <span className="capitalize">{pension.estado}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            {pension.estado === 'pendiente' && (
                              <Button size="sm">Pagar</Button>
                            )}
                            {pension.estado === 'pagada' && (
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Boleta
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
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

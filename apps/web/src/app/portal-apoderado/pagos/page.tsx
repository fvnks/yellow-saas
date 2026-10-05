'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Download, Check, Clock, AlertCircle } from 'lucide-react';

export default function PagosPage() {
  // Datos de ejemplo
  const pensiones = [
    {
      id: '1',
      estudiante: 'Juan Pérez',
      mes: 'Octubre',
      anio: 2026,
      monto: 150000,
      fechaVencimiento: '2026-10-05',
      estado: 'pendiente',
    },
    {
      id: '2',
      estudiante: 'Juan Pérez',
      mes: 'Septiembre',
      anio: 2026,
      monto: 150000,
      fechaVencimiento: '2026-09-05',
      estado: 'pagada',
    },
    {
      id: '3',
      estudiante: 'María Pérez',
      mes: 'Octubre',
      anio: 2026,
      monto: 150000,
      fechaVencimiento: '2026-10-05',
      estado: 'pendiente',
    },
  ];

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

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pagada':
        return 'Pagada';
      case 'pendiente':
        return 'Pendiente';
      case 'vencida':
        return 'Vencida';
      default:
        return estado;
    }
  };

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(monto);
  };

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
            <div className="text-2xl font-bold text-red-600">
              {formatMonto(pensiones.filter((p) => p.estado === 'pendiente').reduce((acc, p) => acc + p.monto, 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pagado este Mes</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatMonto(pensiones.filter((p) => p.estado === 'pagada').reduce((acc, p) => acc + p.monto, 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Próximo Vencimiento</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">05 Oct</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Pensiones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Estudiante</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Mes</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Monto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Vencimiento</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pensiones.map((pension) => (
                  <tr key={pension.id} className="border-b">
                    <td className="py-3 px-4">{pension.estudiante}</td>
                    <td className="py-3 px-4">{pension.mes} {pension.anio}</td>
                    <td className="py-3 px-4 font-medium">{formatMonto(pension.monto)}</td>
                    <td className="py-3 px-4">
                      {new Date(pension.fechaVencimiento).toLocaleDateString('es-CL')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getEstadoIcon(pension.estado)}
                        <span className="capitalize">{getEstadoLabel(pension.estado)}</span>
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
    </div>
  );
}

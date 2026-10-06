'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PRIMARY_ACTION } from '@/components/educacion/button-classes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, DollarSign, Check, Clock, AlertCircle } from 'lucide-react';
import { Subvencion } from '@/types/educacion';
import { CreateEntityModal } from '@/components/educacion/CreateEntityModal';

export default function SubvencionesPage() {
  const [subvenciones, setSubvenciones] = useState<Subvencion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnio, setSelectedAnio] = useState(2026);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    fetchSubvenciones();
  }, [selectedAnio]);

  const fetchSubvenciones = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('anio', selectedAnio.toString());

      const res = await fetch(`/api/educacion/subvenciones?${params}`);
      const data = await res.json();
      setSubvenciones(data.data || []);
    } catch (error) {
      console.error('Error fetching subvenciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'recibida':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'aprobada':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'solicitada':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
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

  const totalMonto = subvenciones.reduce(
    (acc: number, s: Subvencion) => acc + (s.monto || 0),
    0
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Subvenciones</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de subvenciones del Mineduc</p>
        </div>
        <Button className={PRIMARY_ACTION} onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Subvención
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Subvenciones</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatMonto(totalMonto)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Cantidad</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subvenciones.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Año</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedAnio}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Subvenciones</CardTitle>
            <select
              value={selectedAnio}
              onChange={(e) => setSelectedAnio(parseInt(e.target.value))}
              className="px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Año</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Monto</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Fecha Recepción</th>
                  </tr>
                </thead>
                <tbody>
                  {subvenciones.map((subvencion) => (
                    <tr key={subvencion.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">{subvencion.tipo}</td>
                      <td className="py-3 px-4">{subvencion.anio}</td>
                      <td className="py-3 px-4 font-medium">
                        {subvencion.monto ? formatMonto(subvencion.monto) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getEstadoIcon(subvencion.estado || '')}
                          <span className="capitalize">{subvencion.estado || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {subvencion.fecha_recepcion
                          ? new Date(subvencion.fecha_recepcion).toLocaleDateString('es-CL')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateEntityModal
        title="Nueva Subvención"
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        endpoint="/api/educacion/subvenciones"
        fields={[
          { name: 'tipo', label: 'Tipo', required: true, placeholder: 'Ej: Subvención escolar preferencial' },
          { name: 'anio', label: 'Año', type: 'number', required: true, defaultValue: 2026 },
          { name: 'monto', label: 'Monto (CLP)', type: 'number' },
          {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            options: [
              { value: 'solicitada', label: 'Solicitada' },
              { value: 'aprobada', label: 'Aprobada' },
              { value: 'recibida', label: 'Recibida' },
            ],
          },
          { name: 'fecha_recepcion', label: 'Fecha de recepción', type: 'date' },
          { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
        ]}
        onSuccess={fetchSubvenciones}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PRIMARY_ACTION, SECONDARY_ACTION } from '@/components/educacion/button-classes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, DollarSign, Check, Clock, AlertCircle, Download } from 'lucide-react';
import { Pension } from '@/types/educacion';
import { CreateEntityModal } from '@/components/educacion/CreateEntityModal';

export default function PensionesPage() {
  const [pensiones, setPensiones] = useState<Pension[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [selectedAnio, setSelectedAnio] = useState(new Date().getFullYear());
  const [createOpen, setCreateOpen] = useState(false);
  const [registrandoId, setRegistrandoId] = useState<string | null>(null);

  useEffect(() => {
    fetchPensiones();
  }, [selectedMes, selectedAnio]);

  const fetchPensiones = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('mes', selectedMes.toString());
      params.append('anio', selectedAnio.toString());

      const res = await fetch(`/api/educacion/pensiones?${params}`);
      const data = await res.json();
      setPensiones(data.data || []);
    } catch (error) {
      console.error('Error fetching pensiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarPagada = async (id: string) => {
    setRegistrandoId(id);
    try {
      const hoy = new Date().toISOString().slice(0, 10);
      const res = await fetch(`/api/educacion/pensiones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: 'pagada',
          fecha_pago: hoy,
          metodo_pago: 'efectivo',
        }),
      });

      if (res.ok) fetchPensiones();
    } catch (error) {
      console.error('Error registrando pago:', error);
    } finally {
      setRegistrandoId(null);
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

  const totalPendiente = pensiones
    .filter((p) => p.estado === 'pendiente' || p.estado === 'vencida')
    .reduce((acc, p) => acc + p.monto, 0);

  const totalPagado = pensiones
    .filter((p) => p.estado === 'pagada')
    .reduce((acc, p) => acc + p.monto, 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Pensiones</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de pensiones mensuales</p>
        </div>
        <Button className={PRIMARY_ACTION} onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generar Pensiones
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Pendiente</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatMonto(totalPendiente)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Pagado</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatMonto(totalPagado)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Pensiones</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pensiones.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Pensiones</CardTitle>
            <div className="flex gap-2">
              <select
                value={selectedMes}
                onChange={(e) => setSelectedMes(parseInt(e.target.value))}
                className="px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('es-CL', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedAnio}
                onChange={(e) => setSelectedAnio(parseInt(e.target.value))}
                className="px-3 py-2 rounded-xl border border-slate-200/80 bg-white"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>
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
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Estudiante</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Curso</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Monto</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Vencimiento</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Estado</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pensiones.map((pension) => (
                    <tr key={pension.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">
                        {pension.estudiante_nombres} {pension.estudiante_apellido}
                      </td>
                      <td className="py-3 px-4">{pension.curso_nombre || '-'}</td>
                      <td className="py-3 px-4 font-medium">{formatMonto(pension.monto)}</td>
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
                            <Button size="sm" className={PRIMARY_ACTION} onClick={() => marcarPagada(pension.id)} disabled={registrandoId === pension.id}>
                              Registrar Pago
                            </Button>
                          )}
                          {pension.estado === 'pagada' && (
                            <Button variant="outline" size="sm" className={SECONDARY_ACTION}>
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
          )}
        </CardContent>
      </Card>

      <CreateEntityModal
        title="Generar Pensiones"
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        endpoint="/api/educacion/pensiones/generar"
        fields={[
          { name: 'mes', label: 'Mes (1-12)', type: 'number', required: true, min: 1, max: 12, defaultValue: selectedMes },
          { name: 'anio', label: 'Año', type: 'number', required: true, defaultValue: selectedAnio },
          { name: 'monto', label: 'Monto mensual (CLP)', type: 'number', required: true },
          { name: 'fecha_vencimiento', label: 'Fecha de vencimiento', type: 'date', required: true },
        ]}
        onSuccess={fetchPensiones}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { Users, Calendar, FileText, DollarSign, Bell, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { apoderado, loading: authLoading } = usePortalAuth();
  const [stats, setStats] = useState({
    pupilos: 0,
    asistenciaPromedio: 0,
    promedioGeneral: 0,
    pagosPendientes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('portal_token='))
        ?.split('=')[1];

      // Obtener notas
      const notasRes = await fetch('/api/portal-apoderado/notas', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const notasData = await notasRes.json();

      // Obtener asistencia
      const asistenciaRes = await fetch('/api/portal-apoderado/asistencia', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const asistenciaData = await asistenciaRes.json();

      // Obtener pagos
      const pagosRes = await fetch('/api/portal-apoderado/pagos', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const pagosData = await pagosRes.json();

      // Calcular estadísticas
      const pupilos = notasData.data?.length || 0;
      
      let asistenciaTotal = 0;
      let asistenciaCount = 0;
      asistenciaData.data?.forEach((est: any) => {
        if (est.resumen.total > 0) {
          asistenciaTotal += (est.resumen.presentes / est.resumen.total) * 100;
          asistenciaCount++;
        }
      });
      const asistenciaPromedio = asistenciaCount > 0 ? Math.round(asistenciaTotal / asistenciaCount) : 0;

      let sumaNotas = 0;
      let countNotas = 0;
      notasData.data?.forEach((est: any) => {
        est.notas.forEach((n: any) => {
          sumaNotas += n.nota;
          countNotas++;
        });
      });
      const promedioGeneral = countNotas > 0 ? (sumaNotas / countNotas).toFixed(1) : '0.0';

      let pagosPendientes = 0;
      pagosData.data?.forEach((est: any) => {
        est.pensiones.forEach((p: any) => {
          if (p.estado === 'pendiente' || p.estado === 'vencida') {
            pagosPendientes++;
          }
        });
      });

      setStats({
        pupilos,
        asistenciaPromedio,
        promedioGeneral: parseFloat(promedioGeneral),
        pagosPendientes,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Bienvenido, {apoderado?.nombres} {apoderado?.apellido_paterno}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pupilos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pupilos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Asistencia Promedio</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.asistenciaPromedio}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Promedio General</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.promedioGeneral}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pagos Pendientes</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.pagosPendientes}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/portal-apoderado/notas"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Ver Notas</div>
                <div className="text-sm text-gray-500">Calificaciones de tus pupilos</div>
              </div>
            </a>
            <a
              href="/portal-apoderado/asistencia"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Ver Asistencia</div>
                <div className="text-sm text-gray-500">Control de asistencia</div>
              </div>
            </a>
            <a
              href="/portal-apoderado/comunicados"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <Bell className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium">Comunicados</div>
                <div className="text-sm text-gray-500">Avisos del establecimiento</div>
              </div>
            </a>
            <a
              href="/portal-apoderado/pagos"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <DollarSign className="h-5 w-5 text-red-600" />
              <div>
                <div className="font-medium">Pagos</div>
                <div className="text-sm text-gray-500">Control de pensiones</div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de Pupilos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apoderado?.pupilos?.map((pupilo: any) => (
                <div key={pupilo.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {pupilo.nombres} {pupilo.apellido_paterno}
                    </div>
                    <div className="text-sm text-gray-500">{pupilo.curso_nombre}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      <span className="text-gray-500">RUT: </span>
                      <span className="font-medium">{pupilo.rut}</span>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-gray-500">
                  No se encontraron pupilos asignados
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Calendar, BookOpen, DollarSign, Bell } from 'lucide-react';

interface Evento {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  ubicacion?: string;
}

export default function EducacionDashboard() {
  const [stats, setStats] = useState({
    estudiantes: 0,
    cursos: 0,
    profesores: 0,
    asistenciaHoy: '—',
    pensionesPendientes: 0,
    comunicados: 0,
  });
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const hoy = new Date().toISOString().slice(0, 10);
        const [estudiantes, cursos, profesores, asistencia, pensiones, comunicados, eventosRes] = await Promise.all([
          fetch('/api/educacion/estudiantes').then((r) => r.json()).catch(() => ({ total: 0 })),
          fetch('/api/educacion/cursos').then((r) => r.json()).catch(() => ({ data: [] })),
          fetch('/api/educacion/profesores').then((r) => r.json()).catch(() => ({ data: [] })),
          fetch(`/api/educacion/asistencia?fecha=${hoy}`).then((r) => r.json()).catch(() => ({ data: [] })),
          fetch('/api/educacion/pensiones').then((r) => r.json()).catch(() => ({ data: [] })),
          fetch('/api/educacion/comunicados').then((r) => r.json()).catch(() => ({ data: [] })),
          fetch('/api/educacion/eventos').then((r) => r.json()).catch(() => ({ data: [] })),
        ]);

        if (cancelado) return;

        const registrosDia = Array.isArray(asistencia.data) ? asistencia.data : [];
        const presentes = registrosDia.filter((a: any) => a.estado === 'presente').length;
        const asistenciaHoy = registrosDia.length > 0
          ? `${Math.round((presentes / registrosDia.length) * 100)}%`
          : '—';

        const pendientes = Array.isArray(pensiones.data)
          ? pensiones.data.filter((p: any) => p.estado === 'pendiente').length
          : 0;

        const proximos = (Array.isArray(eventosRes.data) ? eventosRes.data : [])
          .filter((e: any) => String(e.fecha_inicio || '').slice(0, 10) >= hoy)
          .sort((a: any, b: any) => String(a.fecha_inicio).localeCompare(String(b.fecha_inicio)))
          .slice(0, 3);

        setStats({
          estudiantes: typeof estudiantes.total === 'number' ? estudiantes.total : (estudiantes.data?.length ?? 0),
          cursos: cursos.data?.length ?? 0,
          profesores: profesores.data?.length ?? 0,
          asistenciaHoy,
          pensionesPendientes: pendientes,
          comunicados: comunicados.data?.length ?? 0,
        });
        setEventos(proximos);
      } catch (error) {
        console.error('Error cargando el panel educativo:', error);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  const tarjetas = [
    { title: 'Estudiantes', value: stats.estudiantes, icon: Users, description: 'Total de estudiantes activos', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Cursos', value: stats.cursos, icon: GraduationCap, description: 'Cursos este año lectivo', color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Profesores', value: stats.profesores, icon: BookOpen, description: 'Docentes activos', color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { title: 'Asistencia Hoy', value: stats.asistenciaHoy, icon: Calendar, description: 'Promedio de asistencia', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { title: 'Pensiones Pendientes', value: stats.pensionesPendientes, icon: DollarSign, description: 'Por cobrar este mes', color: 'text-red-600', bgColor: 'bg-red-100' },
    { title: 'Comunicados', value: stats.comunicados, icon: Bell, description: 'Publicados esta semana', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Módulo Educativo</h1>
        <p className="text-gray-600 mt-2">Gestión integral de tu institución educativa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tarjetas.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cargando ? '…' : stat.value}
              </div>
              <CardDescription className="text-xs mt-1">{stat.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Accede a las funciones más utilizadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/educacion/estudiantes" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Gestionar Estudiantes</div>
              <div className="text-sm text-gray-500">Ver, agregar o editar estudiantes</div>
            </a>
            <a href="/educacion/asistencia" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Registrar Asistencia</div>
              <div className="text-sm text-gray-500">Control de asistencia diaria</div>
            </a>
            <a href="/educacion/calificaciones" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Libro de Clases</div>
              <div className="text-sm text-gray-500">Gestión de calificaciones</div>
            </a>
            <a href="/educacion/pensiones" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Pensiones</div>
              <div className="text-sm text-gray-500">Control de pagos mensuales</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>Actividades programadas</CardDescription>
          </CardHeader>
          <CardContent>
            {eventos.length === 0 ? (
              <p className="text-sm text-gray-500">No hay eventos próximos registrados todavía.</p>
            ) : (
              <div className="space-y-4">
                {eventos.map((e, i) => (
                  <div key={e.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full ${['bg-blue-500', 'bg-green-500', 'bg-purple-500'][i % 3]}`} />
                    <div>
                      <div className="font-medium">{e.titulo}</div>
                      <div className="text-sm text-gray-500">{e.ubicacion || e.descripcion || '—'}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(String(e.fecha_inicio).slice(0, 10) + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

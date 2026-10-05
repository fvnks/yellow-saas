import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Calendar, BookOpen, DollarSign, Bell } from 'lucide-react';

export default function EducacionDashboard() {
  const stats = [
    {
      title: 'Estudiantes',
      value: '1,234',
      icon: Users,
      description: 'Total de estudiantes activos',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Cursos',
      value: '48',
      icon: GraduationCap,
      description: 'Cursos este año lectivo',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Asistencia Hoy',
      value: '95%',
      icon: Calendar,
      description: 'Promedio de asistencia',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Profesores',
      value: '67',
      icon: BookOpen,
      description: 'Docentes activos',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Pensiones Pendientes',
      value: '23',
      icon: DollarSign,
      description: 'Por cobrar este mes',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Comunicados',
      value: '5',
      icon: Bell,
      description: 'Publicados esta semana',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Módulo Educativo</h1>
        <p className="text-gray-600 mt-2">
          Gestión integral de tu institución educativa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <CardDescription className="text-xs mt-1">
                {stat.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accede a las funciones más utilizadas
            </CardDescription>
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
            <CardDescription>
              Actividades programadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                <div>
                  <div className="font-medium">Reunión de Apoderados</div>
                  <div className="text-sm text-gray-500">1° Básico A - 18:00 hrs</div>
                  <div className="text-xs text-gray-400">15 Oct 2026</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                <div>
                  <div className="font-medium">Prueba de Matemáticas</div>
                  <div className="text-sm text-gray-500">3° Básico B - 10:00 hrs</div>
                  <div className="text-xs text-gray-400">16 Oct 2026</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-purple-500" />
                <div>
                  <div className="font-medium">Salida Pedagógica</div>
                  <div className="text-sm text-gray-500">4° Medio A - Museo Interactivo</div>
                  <div className="text-xs text-gray-400">20 Oct 2026</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

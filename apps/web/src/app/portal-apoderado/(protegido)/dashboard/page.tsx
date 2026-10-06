'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { Users, Calendar, FileText, DollarSign, Bell, Loader2, Building, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSearchParams, useRouter } from 'next/navigation';
import { validarHijo, normalizarRut, TIPOS_VINCULO } from '@/lib/educacion/portal-registration';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentCompany } from '@/store/store';

interface Hijo {
  id: string;
  rut: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento?: string;
  curso_nombre?: string;
  tipo_vinculo: string;
  es_apoderado_principal?: boolean;
}

interface CompanyBranding {
  logo_url?: string;
  color_principal?: string;
  color_secundario?: string;
}

export default function DashboardPage() {
  const { apoderado, loading: authLoading, logout, error } = usePortalAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = useSelector((state: any) => state.currentCompany?.id);
  
  // Obtener branding de la empresa
  const [branding, setBranding] = useState<CompanyBranding>({});
  useEffect(() => {
    if (companyId) {
      fetch(`/api/super-admin/companies/${companyId}`)
        .then(r => r.json())
        .then(data => setBranding(data.data || {}))
        .catch(() => setBranding({}));
    }
  }, [companyId]);

  const [hijos, setHijos] = useState<Hijo[]>([]);
  const [hijoSeleccionado, setHijoSeleccionado] = useState<string | null>(null);
  const [cargandoHijos, setCargandoHijos] = useState(true);
  const [errorHijos, setErrorHijos] = useState<string[]>([]);
  const [exito, setExito] = useState('');

  // Cargar hijos y dashboard data
  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('portal_token='))
      ?.split('=')[1];

    if (!token) {
      router.push('/portal-apoderado/login');
      return;
    }

    const cargarDatos = async () => {
      setCargandoHijos(true);
      try {
        // Cargar hijos
        const hijosRes = await fetch('/api/portal-apoderado/hijos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const hijosData = await hijosRes.json();
        if (hijosRes.ok) setHijos(hijosData.data || []);
        else setErrorHijos([hijosData.error || 'No pudimos cargar tus hijos']);

        // Si hay hijos, seleccionar el primero o el principal
        const hijosConPrincipal = hijosData.data || [];
        const principal = hijosConPrincipal.find((h: any) => h.es_apoderado_principal);
        const primero = hijosConPrincipal[0];
        if (principal) setHijoSeleccionado(principal.id);
        else if (primero) setHijoSeleccionado(primero.id);
        
        // Cargar dashboard stats
        await cargarStatsDashboard(token);
      } catch (err) {
        setErrorHijos(['Error cargando datos del portal']);
      } finally {
        setCargandoHijos(false);
      }
    };

    cargarDatos();
  }, [token, router]);

  const cargarStatsDashboard = async (token: string) => {
    try {
      // Obtener notas
      const notasRes = await fetch('/api/portal-apoderado/notas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const notasData = await notasRes.json();

      // Obtener asistencia
      const asistenciaRes = await fetch('/api/portal-apoderado/asistencia', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const asistenciaData = await asistenciaRes.json();

      // Obtener pagos
      const pagosRes = await fetch('/api/portal-apoderado/pagos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pagosData = await pagosRes.json();

      // Calcular estadísticas (mismo lógica que antes)
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
        est.pensiones?.forEach((p: any) => {
          if (p.estado === 'pendiente' || p.estado === 'vencida') {
            pagosPendientes++;
          }
        });
      });

      // Aquí podríamos guardar en Redux o estado local
      // Por ahora solo console.log para no romper el render
      console.log('Dashboard stats:', { pupilos, asistenciaPromedio, promedioGeneral, pagosPendientes });
    } catch (error) {
      console.error('Error cargando stats del dashboard:', error);
    }
  };

  // Agregar nuevo hijo
  const [agregandoHijo, setAgregandoHijo] = useState(false);
  const [formHijo, setFormHijo] = useState({ rut: '', fecha_nacimiento: '', tipo: 'padre' });

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('registro') === 'ok') {
      setExito('Tu cuenta fue creada y tus hijos quedaron vinculados.');
    }
  }, []);

  const agregarHijo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorHijos([]);
    setExito('');

    const errores = validarHijo(formHijo);
    if (errores.length > 0) {
      setErrorHijos(errores);
      return;
    }

    setAgregandoHijo(true);
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('portal_token='))
        ?.split('=')[1];
      const res = await fetch('/api/portal-apoderado/hijos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formHijo, rut: normalizarRut(formHijo.rut) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No pudimos agregar a tu hijo');

      setExito('Hijo agregado correctamente.');
      setFormHijo({ rut: '', fecha_nacimiento: '', tipo: 'padre' });
      await cargarHijos();
    } catch (err) {
      setErrorHijos([err instanceof Error ? err.message : 'No pudimos agregar a tu hijo']);
    } finally {
      setAgregandoHijo(false);
    }
  };

  const quitarHijo = async (hijo: Hijo) => {
    setErrorHijos([]);
    setExito('');
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('portal_token='))
        ?.split('=')[1];
      const res = await fetch(`/api/portal-apoderado/hijos/${hijo.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No pudimos quitar a tu hijo');

      setExito('Hijo quitado de tu cuenta.');
      await cargarHijos();
    } catch (err) {
      setErrorHijos([err instanceof Error ? err.message : 'No pudimos quitar a tu hijo']);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Determinar colores del tema
  const colorPrincipal = branding.color_principal || 'sunshine';
  const colorSecundario = branding.color_secundario || 'white';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header con branding y selector de hijo */}
      <header className="border-b border-slate-200 py-4">
        <div className="mx-auto max-w-5xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding.logo_url ? (
              <img
                src={branding.logo_url}
                alt="Logo del colegio"
                className="h-8 w-auto"
              />
            ) : (
              <span className="text-xl font-black text-ink">Portal Apoderado</span>
            )}
            <span className="text-sm text-slate-500">
              {apoderado?.nombres || ''} {apoderado?.apellido_paterno || ''}
            }
          </div>

          {/* Selector de hijo persistente */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/portal-apoderado/hijos')}
              aria-label="Mis hijos"
            >
              <Users className="h-4 w-4" />
            </Button>
            
            {/* Dropdown de hijos */}
            {hijos.length > 0 && !authLoading ? (
              <div
                className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg shadow-opacity-60 z-20 min-w-48"
                style={{ maxHeight: '200px', overflowY: 'auto' }}
              >
                <div className="px-4 py-2 font-medium text-slate-600">
                  Mis hijos ({hijos.length})
                </div>
                <div className="space-y-1 max-h-80">
                  {hijos.map((hijo) => (
                    <button
                      key={hijo.id}
                      className={hijoSeleccionado === hijo.id
                        ? 'flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-sunshine/20 text-sunshine'
                        : 'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50'}
                      onClick={() => setHijoSeleccionado(hijo.id)}
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        {hijo.nombres} {hijo.apellido_paterno}
                        {hijo.apellido_materno && ` ${hijo.apellido_materno}`}
                        {hijo.curso_nombre && ` · ${hijo.curso_nombre}`}
                        {hijo.es_apoderado_principal && ' (principal)'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : hijos.length === 0 ? (
              <p className="px-4 py-2 text-sm text-slate-500">
                Aún no tienes hijos vinculados
              </p>
            ) : (
              <p className="px-4 py-2 text-sm text-slate-500">
                Cargando...
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pupilos</CardTitle>
              <Users className="h-4 w-4 text-sunshine-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Asistencia Promedio</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">-- %</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Promedio General</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">-- .0</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pagos Pendientes</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick access cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Acceso Rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="/portal-apoderado/notas"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors"
              >
                <FileText className="h-4 w-4 text-sunshine-500" />
                <div>
                  <div className="font-medium">Ver Notas</div>
                  <div className="text-sm text-slate-500">Calificaciones de tus pupilos</div>
                </div>
              </a>
              <a
                href="/portal-apoderado/asistencia"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors"
              >
                <Calendar className="h-4 w-4 text-green-500" />
                <div>
                  <div className="font-medium">Ver Asistencia</div>
                  <div className="text-sm text-slate-500">Control de asistencia</div>
                </div>
              </a>
              <a
                href="/portal-apoderado/pagos"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors"
              >
                <DollarSign className="h-4 w-4 text-red-500" />
                <div>
                  <div className="font-medium">Pagos</div>
                  <div className="text-sm text-slate-500">Control de pensiones</div>
                </div>
              </a>
              <a
                href="/portal-apoderado/comunicados"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors"
              >
                <Bell className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="font-medium">Comunicados</div>
                  <div className="text-sm text-slate-500">Avisos del establecimiento</div>
                </div>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Pupilos</CardTitle>
            </CardHeader>
            <CardContent>
              {hijoSeleccionado ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Clic en un hijo para ver detalles</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Selecciona un hijo en el menú superior para ver su información</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import {
  Loader2,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Baby,
  Users,
} from 'lucide-react';
import {
  validarHijo,
  normalizarRut,
  TIPOS_VINCULO,
} from '@/lib/educacion/portal-registration';

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

function leerToken(): string | null {
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('portal_token='))
      ?.split('=')[1] ?? null
  );
}

export default function MisHijosPage() {
  const { loading: authLoading, logout } = usePortalAuth();
  const [hijos, setHijos] = useState<Hijo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState<string[]>([]);
  const [exito, setExito] = useState('');
  const [agregando, setAgregando] = useState(false);
  const [form, setForm] = useState({ rut: '', fecha_nacimiento: '', tipo: 'padre' });

  // Mensaje de bienvenida tras el registro (se lee en cliente para no
  // depender de useSearchParams en tiempo de build).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('registro') === 'ok') {
      setExito('Tu cuenta fue creada y tus hijos quedaron vinculados.');
    }
  }, []);

  const cargarHijos = useCallback(async () => {
    const token = leerToken();
    if (!token) return;

    try {
      const res = await fetch('/api/portal-apoderado/hijos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setHijos(data.data || []);
      else setErrores([data.error || 'No pudimos cargar tus hijos']);
    } catch {
      setErrores(['No pudimos cargar tus hijos']);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) cargarHijos();
  }, [authLoading, cargarHijos]);

  const agregarHijo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores([]);
    setExito('');

    const errores = validarHijo(form);
    if (errores.length > 0) {
      setErrores(errores);
      return;
    }

    setAgregando(true);
    try {
      const token = leerToken();
      const res = await fetch('/api/portal-apoderado/hijos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, rut: normalizarRut(form.rut) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No pudimos agregar a tu hijo');

      setExito('Hijo agregado correctamente.');
      setForm({ rut: '', fecha_nacimiento: '', tipo: 'padre' });
      await cargarHijos();
    } catch (err) {
      setErrores([err instanceof Error ? err.message : 'No pudimos agregar a tu hijo']);
    } finally {
      setAgregando(false);
    }
  };

  const quitarHijo = async (hijo: Hijo) => {
    setErrores([]);
    setExito('');
    try {
      const token = leerToken();
      const res = await fetch(`/api/portal-apoderado/hijos/${hijo.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No pudimos quitar a tu hijo');

      setExito('Hijo quitado de tu cuenta.');
      await cargarHijos();
    } catch (err) {
      setErrores([err instanceof Error ? err.message : 'No pudimos quitar a tu hijo']);
    }
  };

  if (authLoading || cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5" /> Mis hijos
          </h2>
          <p className="text-sm text-gray-500">
            Aquí solo aparecen tus hijos. Nadie más puede ver su información.
          </p>
        </div>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-800">
          Cerrar sesión
        </button>
      </div>

      {exito && (
        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          <CheckCircle2 className="h-4 w-4" /> {exito}
        </div>
      )}

      {errores.length > 0 && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg space-y-1">
          {errores.map((error) => (
            <div key={error} className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hijos vinculados ({hijos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {hijos.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aún no tienes hijos vinculados. Agrega a tu hijo con su RUT y fecha de nacimiento.
            </p>
          ) : (
            <div className="space-y-3">
              {hijos.map((hijo) => (
                <div
                  key={hijo.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <Baby className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {hijo.nombres} {hijo.apellido_paterno} {hijo.apellido_materno || ''}
                      </p>
                      <p className="text-sm text-gray-500">
                        RUT {hijo.rut}
                        {hijo.curso_nombre ? ` · ${hijo.curso_nombre}` : ''}
                        {hijo.fecha_nacimiento
                          ? ` · nace ${String(hijo.fecha_nacimiento).slice(0, 10)}`
                          : ''}
                      </p>
                      <span className="text-xs uppercase text-gray-400">
                        {hijo.tipo_vinculo}
                        {hijo.es_apoderado_principal ? ' · apoderado principal' : ''}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => quitarHijo(hijo)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Quitar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar un hijo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={agregarHijo} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nuevo-rut">RUT del hijo</Label>
                <Input
                  id="nuevo-rut"
                  value={form.rut}
                  onChange={(e) => setForm({ ...form, rut: e.target.value })}
                  placeholder="12345678-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nuevo-fecha">Fecha de nacimiento</Label>
                <Input
                  id="nuevo-fecha"
                  type="date"
                  value={form.fecha_nacimiento}
                  onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nuevo-tipo">Vínculo</Label>
                <select
                  id="nuevo-tipo"
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {TIPOS_VINCULO.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo === 'padre' ? 'Padre' : tipo === 'madre' ? 'Madre' : 'Tutor'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="submit" disabled={agregando}>
              {agregando ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Agregar hijo
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Baby,
} from 'lucide-react';
import {
  validarApoderado,
  validarListaHijos,
  normalizarRut,
  TIPOS_VINCULO,
} from '@/lib/educacion/portal-registration';

interface HijoForm {
  rut: string;
  fecha_nacimiento: string;
  tipo: string;
}

const HIJO_VACIO: HijoForm = { rut: '', fecha_nacimiento: '', tipo: 'padre' };

export default function PortalRegistroPage() {
  const router = useRouter();
  const [paso, setPaso] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [apoderado, setApoderado] = useState({
    rut: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    password: '',
    telefono: '',
  });
  const [hijos, setHijos] = useState<HijoForm[]>([{ ...HIJO_VACIO }]);

  const setCampo = (campo: keyof typeof apoderado, valor: string) =>
    setApoderado((prev) => ({ ...prev, [campo]: valor }));

  const setHijo = (indice: number, campo: keyof HijoForm, valor: string) =>
    setHijos((prev) => prev.map((h, i) => (i === indice ? { ...h, [campo]: valor } : h)));

  const agregarHijo = () => setHijos((prev) => [...prev, { ...HIJO_VACIO }]);

  const quitarHijo = (indice: number) =>
    setHijos((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== indice) : prev));

  const avanzar = (e: React.FormEvent) => {
    e.preventDefault();
    const erroresApoderado = validarApoderado(apoderado);
    if (erroresApoderado.length > 0) {
      setErrores(erroresApoderado);
      return;
    }
    setErrores([]);
    setPaso(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const erroresHijos = validarListaHijos(hijos);
    if (erroresHijos.length > 0) {
      setErrores(erroresHijos);
      return;
    }

    setLoading(true);
    setErrores([]);

    try {
      const res = await fetch('/api/portal-apoderado/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...apoderado,
          rut: normalizarRut(apoderado.rut),
          hijos: hijos.map((h) => ({ ...h, rut: normalizarRut(h.rut) })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.errores?.length > 0 ? data.errores.join(' ') : data.error || 'No pudimos crear tu cuenta'
        );
      }

      // Entrar directo al portal con la sesión que devuelve el registro.
      document.cookie = `portal_token=${data.data.token}; path=/; max-age=28800; SameSite=Lax`;
      router.push('/portal-apoderado/hijos?registro=ok');
    } catch (err) {
      setErrores([err instanceof Error ? err.message : 'No pudimos crear tu cuenta']);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-8 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Crear cuenta de apoderado</CardTitle>
          <p className="text-gray-500">
            Paso {paso} de 2 · {paso === 1 ? 'Tus datos' : 'Tus hijos'}
          </p>
        </CardHeader>

        <CardContent>
          {errores.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg space-y-1">
              {errores.map((error) => (
                <div key={error} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {paso === 1 && (
            <form onSubmit={avanzar} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT *</Label>
                  <Input
                    id="rut"
                    value={apoderado.rut}
                    onChange={(e) => setCampo('rut', e.target.value)}
                    placeholder="12345678-9"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={apoderado.telefono}
                    onChange={(e) => setCampo('telefono', e.target.value)}
                    placeholder="+56912345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres *</Label>
                  <Input
                    id="nombres"
                    value={apoderado.nombres}
                    onChange={(e) => setCampo('nombres', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido_paterno">Apellido paterno *</Label>
                  <Input
                    id="apellido_paterno"
                    value={apoderado.apellido_paterno}
                    onChange={(e) => setCampo('apellido_paterno', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido_materno">Apellido materno</Label>
                  <Input
                    id="apellido_materno"
                    value={apoderado.apellido_materno}
                    onChange={(e) => setCampo('apellido_materno', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={apoderado.email}
                  onChange={(e) => setCampo('email', e.target.value)}
                  placeholder="apoderado@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={apoderado.password}
                  onChange={(e) => setCampo('password', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Continuar <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          )}

          {paso === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
                Para proteger a tus hijos pedimos el <strong>RUT</strong> y la{' '}
                <strong>fecha de nacimiento</strong> de cada uno. Deben coincidir con la ficha que
                tiene el colegio, y <strong>solo tú</strong> podrás ver su información.
              </div>

              {hijos.map((hijo, indice) => (
                <div key={indice} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Baby className="h-4 w-4" /> Hijo {indice + 1}
                    </span>
                    {hijos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => quitarHijo(indice)}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                      >
                        <Trash2 className="h-4 w-4" /> Quitar
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`hijo-rut-${indice}`}>RUT del hijo *</Label>
                      <Input
                        id={`hijo-rut-${indice}`}
                        value={hijo.rut}
                        onChange={(e) => setHijo(indice, 'rut', e.target.value)}
                        placeholder="12345678-9"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`hijo-fecha-${indice}`}>Fecha de nacimiento *</Label>
                      <Input
                        id={`hijo-fecha-${indice}`}
                        type="date"
                        value={hijo.fecha_nacimiento}
                        onChange={(e) => setHijo(indice, 'fecha_nacimiento', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`hijo-tipo-${indice}`}>Vínculo *</Label>
                      <select
                        id={`hijo-tipo-${indice}`}
                        value={hijo.tipo}
                        onChange={(e) => setHijo(indice, 'tipo', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {TIPOS_VINCULO.map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {tipo === 'padre'
                              ? 'Padre'
                              : tipo === 'madre'
                                ? 'Madre'
                                : 'Tutor'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="button" variant="outline" onClick={agregarHijo} className="flex-1">
                  Agregar otro hijo
                </Button>
                <Button type="button" variant="outline" onClick={() => setPaso(1)} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  Crear cuenta
                </Button>
              </div>

              <p className="flex items-start gap-2 text-xs text-gray-500">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                Si un hijo no aparece es porque aún no está matriculado: contacta al colegio y vuelve
                a intentar.
              </p>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              ¿Ya tienes cuenta?{' '}
              <Link href="/portal-apoderado" className="text-blue-600 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

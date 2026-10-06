'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { PRIMARY_ACTION } from '@/components/educacion/button-classes';
import { fijarSesionPortal } from '@/lib/portal-session';

/**
 * Login propio del portal de apoderados. Antes redirigía a `/login` (login
 * genérico de personal, con campo "Email" y copy que no le correspondía).
 * Aquí el campo de usuario acepta correo, RUT o "nombre y apellido": el motor
 * único es `POST /api/auth/login-unified`, que resuelve los tres formatos.
 */

function LoginForm() {
  const searchParams = useSearchParams();
  const expirada = searchParams.get('expired') === '1';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [recordar, setRecordar] = useState(true);
  const [verClave, setVerClave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login-unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, recordar }),
      });

      const payload = await res.json();

      if (!res.ok) {
        // El middleware devuelve { error: string } y la ruta { error: { message } }.
        const mensaje =
          (typeof payload?.error === 'string' ? payload.error : payload?.error?.message) ??
          'No pudimos iniciar sesión. Revisa tus datos e intenta de nuevo.';
        setError(mensaje);
        return;
      }

      const token = payload?.data?.token as string;
      const tokenType = payload?.data?.tokenType ?? payload?.data?.user?.role_type;

      if (tokenType === 'profesor') {
        // Cuenta de profesor: cookie de su portal y su dashboard.
        fijarSesionPortal(token, 'profesor', recordar);
        window.location.href = payload?.data?.redirectTo ?? '/portal-profesor/dashboard';
        return;
      }

      if (tokenType !== 'apoderado') {
        setError(
          'Esta cuenta pertenece al personal del establecimiento. Ingresa por el acceso de personal.'
        );
        return;
      }

      fijarSesionPortal(token, 'apoderado', recordar);
      window.location.href = payload?.data?.redirectTo ?? '/portal-apoderado/dashboard';
    } catch {
      setError('No pudimos conectar con el servidor. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <Link href="/portal-apoderado" className="text-xl font-black text-ink">
        Portal de Apoderados
      </Link>

      <div className="mt-6 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-ink">Entrar al portal</h1>
        <p className="mt-1 text-sm text-slate-500">
          Con tu correo, RUT o nombre y apellido.
        </p>

        {expirada && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>Tu sesión expiró o finalizó. Ingresa nuevamente.</p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="identifier" className="text-sm font-bold text-slate-700">
              Correo, RUT o nombre y apellido
            </label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="ej: maria.gonzalez@correo.cl, 12.345.678-9 o María González"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:border-[#006680] focus:outline-none focus:ring-2 focus:ring-electric-cyan/40"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-bold text-slate-700">
              Contraseña
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={verClave ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-ink focus:border-[#006680] focus:outline-none focus:ring-2 focus:ring-electric-cyan/40"
              />
              <button
                type="button"
                onClick={() => setVerClave((v) => !v)}
                aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                {verClave ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={recordar}
              onChange={(e) => setRecordar(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Recordarme por 30 días
          </label>

          <button
            type="submit"
            disabled={loading}
            className={`${PRIMARY_ACTION} inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 disabled:opacity-60`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <LogIn className="h-4 w-4" aria-hidden />
            )}
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          <Link
            href="/portal-apoderado"
            className="font-bold text-[#006680] hover:underline"
          >
            Volver a la portada
          </Link>
        </p>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        ¿Eres personal del establecimiento?{' '}
        <Link href="/login" className="underline hover:text-slate-600">
          Ingresa por el acceso de personal
        </Link>
        .
      </p>
    </div>
  );
}

export default function PortalApoderadoLoginPage() {
  // useSearchParams exige un Suspense boundary (mismo patrón que /login).
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

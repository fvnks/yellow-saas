'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button, Input, Card, CardContent } from '@yellow-erp/ui';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === 'admin@yellow.cl' && password === 'demo123') {
      router.push(redirect);
      router.refresh();
    } else {
      setError('Credenciales inválidas. Usa: admin@yellow.cl / demo123');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Yellow ERP</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Iniciar Sesión</h1>
          <p className="text-slate-500 mt-2">Accede a tu panel de gestión</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm" role="alert">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yellow.cl"
                required
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Iniciar Sesión
              </Button>
            </form>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 text-center mb-2">Credenciales de prueba:</p>
              <div className="text-xs text-slate-500 font-mono space-y-1 text-center">
                <p>Email: admin@yellow.cl</p>
                <p>Pass: demo123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-500">Cargando...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
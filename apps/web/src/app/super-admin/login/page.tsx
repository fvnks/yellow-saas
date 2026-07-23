'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Shield, Mail, Lock, AlertCircle } from 'lucide-react';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/super-admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || 'Credenciales inválidas');
        setLoading(false);
        return;
      }

      document.cookie = `auth-token=${data.data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      window.location.href = '/admin';
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-950 font-sans text-white antialiased selection:bg-white/10">
      {/* Left Panel - Branding */}
      <div className="relative hidden w-full flex-col p-4 lg:flex lg:min-h-screen lg:w-1/2">
        <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-slate-900 border border-slate-800 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[128px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500 rounded-full blur-[128px]" />
          </div>
          {/* Logo overlay */}
          <div className="absolute top-8 left-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">Yellow ERP</span>
                <span className="block text-xs text-indigo-400 font-medium tracking-wider uppercase">Panel de Administración</span>
              </div>
            </div>
          </div>
          {/* Access notice */}
          <div className="absolute bottom-8 left-8 right-8">
            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <p className="text-white/60 text-sm">
                Acceso restringido solo para administradores de plataforma.
                El acceso a datos de empresas requiere consentimiento explícito.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full flex-col items-center justify-center p-6 sm:p-12 lg:w-1/2">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">Yellow ERP</span>
            <span className="block text-[10px] text-indigo-400 font-medium tracking-wider uppercase">Admin</span>
          </div>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Title */}
          <div className="mb-10">
            <h1 className="mb-4 text-[48px] font-semibold leading-[1.05] tracking-tight text-white">
              Admin
              <br />
              Panel
            </h1>
            <p className="text-[15px] text-slate-400 text-balance">
              Acceso exclusivo para administradores de la plataforma Yellow ERP.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[14px] font-medium text-slate-300">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yellow.cl"
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 pl-10 pr-4 py-3 text-[14px] text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-[14px] font-medium text-slate-300">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 pl-10 pr-12 py-3 text-[14px] font-mono text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Sign in Button */}
            <div className="mt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-3 text-[14px] font-medium text-white transition-transform active:scale-[0.98] hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Acceder al Panel'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-[14px] text-slate-500">
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors underline underline-offset-4">
              Volver al login de empresas
            </Link>
          </div>

          <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-500 text-center mb-2">Credenciales de prueba:</p>
            <div className="text-xs text-slate-400 font-mono space-y-1 text-center">
              <p>Email: superadmin@yellow.cl</p>
              <p>Pass: SuperAdmin123!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

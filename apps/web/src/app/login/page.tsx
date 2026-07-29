'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, type Variants } from 'motion/react';
import { Eye, EyeOff, Building2, Mail, Lock, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/select';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
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

      const maxAge = remember ? 7 * 24 * 60 * 60 : undefined;
      document.cookie = `auth-token=${data.data.token}; path=/; max-age=${maxAge}`;

      // Redirect based on role_type
      const roleType = data.data.user?.role_type;
      if (roleType === 'super_admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = redirect;
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans text-slate-900 antialiased selection:bg-slate-900/10 lg:flex-row">
      {/* Left Image Panel */}
      <div className="relative hidden w-full flex-col p-4 lg:flex lg:min-h-screen lg:w-1/2">
        <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-slate-900 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[128px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500 rounded-full blur-[128px]" />
          </div>
          {/* Logo overlay */}
          <div className="absolute top-8 left-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Yellow ERP</span>
            </div>
          </div>
          {/* Bottom text */}
          <div className="absolute bottom-8 left-8 right-8">
            <p className="text-white/60 text-sm">
              Gestión empresarial integral para PyMEs chilenas
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full flex-col items-center justify-center p-6 sm:p-12 lg:w-1/2">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">Yellow ERP</span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[400px]"
        >
          {/* Title */}
          <motion.div variants={itemVariants} className="mb-10">
            <h1 className="mb-4 text-[48px] font-semibold leading-[1.05] tracking-tight text-slate-900">
              Bienvenido
              <br />
              de vuelta
            </h1>
            <p className="text-[15px] text-slate-500 text-balance">
              Inicia sesión para acceder al panel de gestión de tu empresa.
            </p>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              variants={itemVariants}
              className="mb-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[14px] font-medium text-slate-800">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yellow-erp.cl"
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <label htmlFor="password" className="text-[14px] font-medium text-slate-800">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-12 py-3 text-[14px] font-mono text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Remember & Forgot */}
            <motion.div variants={itemVariants} className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2.5">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-[18px] rounded border-slate-300 text-slate-900 focus:ring-slate-900 transition-colors"
                />
                <label htmlFor="remember" className="text-[14px] text-slate-600">
                  Mantener sesión
                </label>
              </div>
              <a href="#" className="text-[14px] font-medium text-slate-800 underline decoration-slate-800 underline-offset-4 transition-colors hover:text-black hover:decoration-black">
                ¿Olvidaste tu contraseña?
              </a>
            </motion.div>

            {/* Sign in Button */}
            <motion.div variants={itemVariants} className="mt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-slate-900 py-3 text-[14px] font-medium text-white transition-transform active:scale-[0.98] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="flex items-center gap-4 mt-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">o</span>
            <div className="flex-1 h-px bg-slate-200" />
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="mt-8 text-center text-[14px] text-slate-500">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-semibold text-slate-800 underline decoration-slate-800 underline-offset-4 transition-colors hover:text-black hover:decoration-black">
              Regístrate
            </Link>
          </motion.div>
        </motion.div>
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

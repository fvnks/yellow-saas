'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, type Variants } from 'motion/react';
import { Eye, EyeOff, Building2, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import AuthPanel from '@/components/auth/AuthPanel';

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
      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 400, damping: 30 },
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
      localStorage.setItem('yellow_last_access', new Date().toISOString());

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
    <div className="flex min-h-screen w-full bg-card font-sans text-foreground antialiased selection:bg-primary/10 lg:flex-row">
      {/* Left Image Panel */}
      <AuthPanel />

      {/* Right Form Panel */}
      <div className="flex w-full flex-col items-center justify-center p-6 sm:p-12 lg:w-1/2">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-foreground">Yellow ERP</span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[400px]"
        >
          {/* Title */}
          <motion.div variants={itemVariants} className="mb-10">
            <h1 className="mb-4 text-[40px] font-bold leading-[1.05] tracking-tight text-foreground sm:text-[48px]">
              Bienvenido
              <br />
              de vuelta
            </h1>
            <p className="text-[15px] text-muted-foreground text-balance">
              Inicia sesión para acceder al panel de gestión de tu empresa.
            </p>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              variants={itemVariants}
              role="alert"
              className="mb-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[14px] font-medium text-foreground">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yellow-erp.cl"
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-colors"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <label htmlFor="password" className="text-[14px] font-medium text-foreground">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-border bg-card pl-10 pr-12 py-3 text-[14px] font-mono text-foreground placeholder:text-muted-foreground focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-slate-600 transition-colors"
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
                  className="size-[18px] rounded border-slate-300 text-foreground focus:ring-slate-900 focus:ring-2 transition-colors"
                />
                <label htmlFor="remember" className="text-[14px] text-slate-600 cursor-pointer">
                  Mantener sesión
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-[14px] font-medium text-foreground hover:text-foreground transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </motion.div>

            {/* Sign in Button */}
            <motion.div variants={itemVariants} className="mt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary py-3 text-[14px] font-medium text-white transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="flex items-center gap-4 mt-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-muted-foreground">o</span>
            <div className="flex-1 h-px bg-slate-200" />
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="mt-8 text-center text-[14px] text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-semibold text-foreground hover:text-foreground transition-colors">
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
    <Suspense fallback={<div className="min-h-screen bg-muted flex items-center justify-center"><p className="text-muted-foreground">Cargando...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}

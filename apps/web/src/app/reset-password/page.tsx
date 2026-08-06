'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, type Variants } from 'motion/react';
import { ArrowLeft, Building2, Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import AuthPanel from '@/components/auth/AuthPanel';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      setError('La contraseña debe incluir mayúsculas, minúsculas, números y un carácter especial');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!token) {
      setError('El enlace de restablecimiento es inválido o ha expirado');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || 'No se pudo restablecer la contraseña');
        setLoading(false);
        return;
      }

      setDone(true);
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-card font-sans text-foreground antialiased lg:flex-row">
      {/* Left Image Panel */}
      <AuthPanel />

      {/* Right Form Panel */}
      <div className="flex w-full flex-col items-center justify-center p-6 sm:p-12 lg:w-1/2">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">Yellow ERP</span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[400px]"
        >
          {!done ? (
            <>
              {/* Back link */}
              <motion.div variants={itemVariants} className="mb-8">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a iniciar sesión
                </Link>
              </motion.div>

              {/* Title */}
              <motion.div variants={itemVariants} className="mb-8">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="mb-3 text-[36px] font-bold leading-[1.05] tracking-tight text-slate-950">
                  Nueva
                  <br />
                  contraseña
                </h1>
                <p className="text-[15px] text-muted-foreground text-balance">
                  Define una nueva contraseña para tu cuenta.
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
                {/* Password */}
                <motion.div variants={itemVariants} className="flex flex-col gap-2">
                  <label htmlFor="password" className="text-[14px] font-medium text-slate-800">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                      className="w-full rounded-lg border border-border bg-card pl-10 pr-12 py-3 text-[14px] font-mono text-foreground placeholder:text-muted-foreground focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors"
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

                {/* Confirm */}
                <motion.div variants={itemVariants} className="flex flex-col gap-2">
                  <label htmlFor="confirmPassword" className="text-[14px] font-medium text-slate-800">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                      className="w-full rounded-lg border border-border bg-card pl-10 pr-12 py-3 text-[14px] font-mono text-foreground placeholder:text-muted-foreground focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>

                <div className="bg-muted p-4 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-600 font-medium mb-2">La contraseña debe incluir:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Al menos 8 caracteres</li>
                    <li>• Una letra mayúscula y una minúscula</li>
                    <li>• Al menos un número</li>
                    <li>• Al menos un carácter especial (@$!%*?&)</li>
                  </ul>
                </div>

                {/* Submit */}
                <motion.div variants={itemVariants} className="mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-primary hover:bg-primary/90 py-3 text-[14px] font-medium text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? 'Guardando...' : 'Restablecer contraseña'}
                  </button>
                </motion.div>
              </form>
            </>
          ) : (
            <>
              {/* Success */}
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h1 className="mb-3 text-2xl font-bold tracking-tight text-slate-950">
                  ¡Contraseña actualizada!
                </h1>
                <p className="text-[15px] text-muted-foreground text-balance">
                  Tu contraseña fue restablecida correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="mt-8 w-full rounded-lg bg-primary hover:bg-primary/90 text-white px-4 py-3 text-sm font-medium transition-all duration-150 active:scale-[0.98]"
                >
                  Ir a Iniciar Sesión
                </button>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted flex items-center justify-center"><p className="text-muted-foreground">Cargando...</p></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

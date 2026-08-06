'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'motion/react';
import { ArrowLeft, Building2, Mail, AlertCircle, Loader2, CheckCircle2, Lock } from 'lucide-react';
import AuthPanel from '@/components/auth/AuthPanel';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState('');

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
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || 'Error al enviar la solicitud');
        setLoading(false);
        return;
      }

      // En desarrollo mostramos el link de reset para poder probar
      if (data.data?.resetLink) {
        setDevLink(data.data.resetLink);
      }
      setSent(true);
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
          {!sent ? (
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
                  ¿Olvidaste tu
                  <br />
                  contraseña?
                </h1>
                <p className="text-[15px] text-muted-foreground text-balance">
                  Ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla.
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
                  <label htmlFor="email" className="text-[14px] font-medium text-slate-800">
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
                      className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors"
                    />
                  </div>
                </motion.div>

                {/* Submit */}
                <motion.div variants={itemVariants} className="mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-primary hover:bg-primary/90 py-3 text-[14px] font-medium text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? 'Enviando...' : 'Enviar instrucciones'}
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
                  Revisa tu correo
                </h1>
                <p className="text-[15px] text-muted-foreground text-balance">
                  Si existe una cuenta con <span className="font-medium text-foreground">{email}</span>,
                  recibirás un enlace para restablecer tu contraseña.
                </p>

                {devLink && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                    <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider mb-1">
                      Modo desarrollo
                    </p>
                    <p className="text-xs text-blue-800 mb-2">
                      No hay sistema de email configurado. Usa este enlace de prueba:
                    </p>
                    <Link
                      href={devLink}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 underline decoration-blue-300 underline-offset-4 transition-colors break-all"
                    >
                      Restablecer contraseña →
                    </Link>
                  </div>
                )}

                <Link
                  href="/login"
                  className="mt-8 inline-flex items-center gap-2 text-[14px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a iniciar sesión
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted flex items-center justify-center"><p className="text-muted-foreground">Cargando...</p></div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

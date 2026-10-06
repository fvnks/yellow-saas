'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, type Variants } from 'motion/react';
import { Eye, EyeOff, Building2, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import AuthPanel from '@/components/auth/AuthPanel';
import { SiteLiquidButton } from '@/components/landing/SiteLiquidButton';
import { setAuthToken, clearAuthToken, getAuthToken, syncAuthCookie, parseJwtPayload } from '@/lib/auth-token';
import { fijarSesionPortal } from '@/lib/portal-session';

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

function LoginForm() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || '/select';
  // Evita open-redirect: solo acepta rutas internas.
  const redirect =
    rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : '/select';
  const redirectParam = searchParams.get('redirect');
  // Contexto apoderado: llegan enlaces con ?contexto=apoderado o con
  // ?redirect=/portal-apoderado/* (marcadores viejos del portal). El login
  // propio vive en /portal-apoderado/login; este es el respaldo con copy que
  // sí le corresponde (el campo acepta correo, RUT o nombre y apellido).
  const contextoApoderado =
    searchParams.get('contexto') === 'apoderado' ||
    (redirectParam?.startsWith('/portal-apoderado') ?? false);
  // La sesión fue invalidada por el servidor (token caducado o JWT_SECRET rotado):
  // AuthWatcher limpia el token y redirige aquí con este flag.
  const sessionExpired = searchParams.get('session') === 'expired';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Si el middleware nos devolvió a /login (?redirect=...) es
  // porque la cookie estaba ausente: reescribimos la cookie
  // desde localStorage y volvemos al destino original.
  // Una visita voluntaria a /login (sin ?redirect) muestra
  // el formulario para poder cambiar de cuenta.
  useEffect(() => {
    const token = getAuthToken();
    if (!token || !redirectParam) return;
    syncAuthCookie();
    const payload = parseJwtPayload(token);
    const exp = typeof payload?.exp === 'number' ? payload.exp : 0;
    if (!payload || exp * 1000 <= Date.now()) {
      clearAuthToken();
      return;
    }
    // Guardia anti-bucle: si el middleware sigue devolviéndonos
    // a /login (ej: secreto JWT rotado), el token no es válido
    // para el servidor. Tras 3 redirecciones en menos de 30s
    // limpiamos y mostramos el formulario.
    const BOUNCES_KEY = 'yellow_login_bounces';
    const now = Date.now();
    const last = Number(sessionStorage.getItem(`${BOUNCES_KEY}_ts`) || '0');
    const count =
      now - last < 30_000
        ? Number(sessionStorage.getItem(BOUNCES_KEY) || '0') + 1
        : 1;
    sessionStorage.setItem(BOUNCES_KEY, String(count));
    sessionStorage.setItem(`${BOUNCES_KEY}_ts`, String(now));
    if (count >= 3) {
      sessionStorage.removeItem(BOUNCES_KEY);
      sessionStorage.removeItem(`${BOUNCES_KEY}_ts`);
      clearAuthToken();
      return;
    }
    // Super admin sin empresa activa va a la consola,
    // no a /dashboard (el middleware lo redirigiría a /admin).
    window.location.href =
      payload.role_type === 'super_admin' && !payload.company_id
        ? '/admin'
        : redirectParam;
  }, [redirectParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login-unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, recordar: remember }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // El middleware responde { error: string } y las rutas { error: { message } }.
        setError(
          (typeof data.error === 'string' ? data.error : data.error?.message) ||
            t('invalidCredentials')
        );
        setLoading(false);
        return;
      }

      const tokenType = data.data.tokenType || data.data.user?.role_type || data.data.user?.tipo;

      if (tokenType === 'apoderado') {
        // Cookie + JWT con la misma duración: 8h o 30 días según "recordarme".
        fijarSesionPortal(data.data.token, 'apoderado', remember);
        localStorage.setItem('yellow_last_access', new Date().toISOString());
        window.location.href = data.data.redirectTo || '/portal-apoderado/dashboard';
        return;
      }

      if (tokenType === 'profesor') {
        fijarSesionPortal(data.data.token, 'profesor', remember);
        localStorage.setItem('yellow_last_access', new Date().toISOString());
        window.location.href = data.data.redirectTo || '/portal-profesor/dashboard';
        return;
      }

      const maxAge = remember ? 7 * 24 * 60 * 60 : undefined;
      setAuthToken(data.data.token, maxAge);
      localStorage.setItem('yellow_last_access', new Date().toISOString());

      const roleType = data.data.user?.role_type;
      if (roleType === 'super_admin') {
        window.location.href = '/admin';
      } else if (data.data.redirectTo) {
        window.location.href = data.data.redirectTo;
      } else {
        window.location.href = redirect;
      }
    } catch {
      setError(t('connectionError'));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-cloud font-sans text-ink antialiased selection:bg-sunshine/10 lg:flex-row">
      {/* Left Image Panel */}
      <AuthPanel />

      {/* Right Form Panel */}
      <div className="flex w-full flex-col items-center justify-center p-6 sm:p-12 lg:w-1/2">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'conic-gradient(from 270deg, #FFA500 15%, #33dbdb 40%, #33d58e 55%, #F5C518 65%, #fc527d 85%, #FFA500 100%)' }}>
            <div className="w-7 h-7 bg-snow rounded-full flex items-center justify-center">
              <Building2 className="w-4 h-4 text-sunshine-ink" />
            </div>
          </div>
          <span className="text-lg font-bold text-ink">Yellow ERP</span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[400px]"
        >
          {/* Title */}
          <motion.div variants={itemVariants} className="mb-10">
            <h1 className="mb-4 text-[40px] font-bold leading-[1.05] tracking-tight text-ink sm:text-[48px]">
              {contextoApoderado ? 'Portal de Apoderados' : t('welcomeBack')}
            </h1>
            <p className="text-[15px] text-slate-text text-balance">
              {contextoApoderado
                ? 'Consulta las notas, asistencia y pagos de tus hijos.'
                : t('loginSubtitle')}
            </p>
          </motion.div>

          {/* Sesión expirada */}
          {sessionExpired && (
            <motion.div
              variants={itemVariants}
              role="status"
              className="mb-4 flex items-center gap-2 p-3 bg-[#f0b400]/10 border border-[#f0b400]/30 rounded-md text-[#8a6100] text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Tu sesión expiró. Vuelve a iniciar sesión para continuar.
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              variants={itemVariants}
              role="alert"
              className="mb-4 flex items-center gap-2 p-3 bg-[#e24444]/5 border border-[#e24444]/20 rounded-md text-[#e24444] text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email / identificador */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[14px] font-medium text-ink">
                {contextoApoderado ? 'Correo, RUT o nombre y apellido' : t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-iron" />
                <input
                  id="email"
                  type={contextoApoderado ? 'text' : 'email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    contextoApoderado
                      ? 'maria.gonzalez@correo.cl, 12.345.678-9 o María González'
                      : 'admin@yellow-erp.cl'
                  }
                  autoComplete={contextoApoderado ? 'username' : 'email'}
                  required
                  className="w-full rounded-md border border-mist bg-snow pl-10 pr-4 py-3 text-[14px] text-ink placeholder:text-iron focus:border-sunshine-dark focus:outline-none focus:ring-2 focus:ring-sunshine-dark/20 transition-colors"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <label htmlFor="password" className="text-[14px] font-medium text-ink">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-iron" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-md border border-mist bg-snow pl-10 pr-12 py-3 text-[14px] font-mono text-ink placeholder:text-iron focus:border-sunshine-dark focus:outline-none focus:ring-2 focus:ring-sunshine-dark/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-iron hover:text-ink transition-colors"
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
                  className="size-[18px] rounded border-mist text-sunshine-ink focus:ring-sunshine-dark focus:ring-2 transition-colors"
                />
                <label htmlFor="remember" className="text-[14px] text-ink cursor-pointer">
                  {contextoApoderado ? 'Recordarme por 30 días' : t('rememberMe')}
                </label>
              </div>
              {!contextoApoderado && (
                <Link
                  href="/es/forgot-password"
                  className="text-[14px] font-medium text-ink hover:text-sunshine-ink transition-colors"
                >
                  {t('forgotPassword')}
                </Link>
              )}
            </motion.div>

            {/* Sign in Button */}
            <motion.div variants={itemVariants} className="mt-2">
              <SiteLiquidButton type="submit" disabled={loading} variant="primary" className="w-full py-3 text-[14px]">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? t('signingIn') : t('signIn')}
              
</SiteLiquidButton>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="flex items-center gap-4 mt-6">
            <div className="flex-1 h-px bg-mist" />
            <span className="text-xs text-iron">o</span>
            <div className="flex-1 h-px bg-mist" />
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="mt-8 text-center text-[14px] text-slate-text">
            {contextoApoderado ? (
              <>
                ¿Problemas para entrar? Contacta a la administración del colegio.{' '}
                <Link
                  href="/portal-apoderado/login"
                  className="font-semibold text-ink hover:text-sunshine-ink transition-colors"
                >
                  Ir al login del portal
                </Link>
              </>
            ) : (
              <>
                {t('noAccount')}{' '}
                <Link href="/es/register" className="font-semibold text-ink hover:text-sunshine-ink transition-colors">
                  {t('signUp')}
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const t = useTranslations('common');
  return (
    <Suspense fallback={<div className="min-h-screen bg-cloud flex items-center justify-center"><p className="text-slate-text">{t('loading')}</p></div>}>
      <LoginForm />
    </Suspense>
  );
}

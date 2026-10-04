'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, Shield, BarChart3, Settings, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'yellow_cookie_consent';

type ConsentState = 'all' | 'essential' | null;

interface CookieConsentProps {
  className?: string;
}

export function CookieConsent({ className }: CookieConsentProps) {
  const [visible, setVisible] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [consent, setConsent] = useState<ConsentState>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setConsent(stored as ConsentState);
        return;
      }
    } catch {
      // ignore
    }
    // Show banner after a brief delay so it doesn't block first paint
    const id = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(id);
  }, []);

  const handleConsent = (value: ConsentState) => {
    try {
      localStorage.setItem(STORAGE_KEY, value ?? '');
    } catch {
      // ignore
    }
    setConsent(value);
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  if (consent) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'fixed bottom-4 left-4 right-4 z-[100] sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-[380px]',
            className
          )}
        >
          <div className="relative rounded-2xl border border-mist bg-snow shadow-xl-2">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              aria-label=" cerrar aviso de cookies"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md text-iron hover:bg-cloud hover:text-ink transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-5">
              {/* Cookie illustration */}
              <div className="mx-auto -mt-2 mb-4 flex h-14 w-20 items-center justify-center rounded-2xl bg-sunshine/10 border border-sunshine-dark/20">
                <Cookie className="h-8 w-8 text-sunshine-ink" />
              </div>

              <h3 className="text-sm font-bold text-ink mb-1.5">
                Tu privacidad es importante para nosotros
              </h3>
              <p className="text-xs text-slate-text leading-relaxed mb-4">
                Utilizamos cookies esenciales para que el sitio funcione correctamente.
                Opcionalmente, podés aceptar cookies analíticas para ayudarnos a mejorar.
                Consultá nuestra{' '}
                <a
                  href="/cookies"
                  className="font-semibold text-sunshine-ink hover:underline underline-offset-2"
                >
                  Política de Cookies
                </a>.
              </p>

              {/* Cookie categories preview */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-[11px]">
                  <Shield className="h-3.5 w-3.5 text-forest shrink-0" />
                  <span className="text-ink font-medium">Esenciales</span>
                  <span className="text-iron">· siempre activas</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <BarChart3 className="h-3.5 w-3.5 text-sky-accent shrink-0" />
                  <span className="text-ink font-medium">Analíticas</span>
                  <span className="text-iron">· opt-in</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <Settings className="h-3.5 w-3.5 text-sunshine-ink shrink-0" />
                  <span className="text-ink font-medium">Preferencias</span>
                  <span className="text-iron">· opt-in</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!showOptions ? (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-2"
                  >
                    <Button
                      variant="default"
                      className="w-full bg-sunshine text-ink hover:bg-sunshine-hover font-semibold"
                      onClick={() => handleConsent('all')}
                    >
                      <Check className="h-4 w-4" />
                      Acepto todas las cookies
                    </Button>
                    <button
                      onClick={() => setShowOptions(true)}
                      className="text-xs font-medium text-slate-text hover:text-ink transition-colors py-1"
                    >
                      Personalizar preferencias
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="options"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-2"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-sunshine-dark/30 text-sunshine-ink hover:bg-sunshine/5 font-semibold"
                      onClick={() => handleConsent('all')}
                    >
                      Acepto todas
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleConsent('essential')}
                    >
                      Solo esenciales
                    </Button>
                    <button
                      onClick={() => setShowOptions(false)}
                      className="text-xs font-medium text-iron hover:text-ink transition-colors py-1"
                    >
                      ← Volver
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CookieConsent;
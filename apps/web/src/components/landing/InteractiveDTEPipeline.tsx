'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, ShieldCheck, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useReducedMotion } from 'motion/react';

const STEPS = [
  { id: 1, label: 'Borrador', description: 'Documento preliminar con datos de la venta', status: 'draft' },
  { id: 2, label: 'Enviando SII', description: 'Factura electrónica en trámite de validación', status: 'sending' },
  { id: 3, label: 'Procesando SII', description: 'Validación CAF y timbre electrónico', status: 'processing' },
  { id: 4, label: 'Aceptado', description: 'DTE autorizado y listo para uso', status: 'accepted' },
  { id: 5, label: 'Rechazado', description: 'Documento rechazado por el SII, requiere corrección', status: 'rejected' },
] as const;

type StepId = typeof STEPS[number]['id'];

interface InteractiveDTEPipelineProps {
  onTryInteractive?: () => void;
}

export function InteractiveDTEPipeline({ onTryInteractive }: InteractiveDTEPipelineProps = {}) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<StepId>(1);
  const [isInteractive, setIsInteractive] = useState(false);
  const [form, setForm] = useState({
    rut: '',
    amount: '',
    docType: 'factura',
  });
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');

  // Auto-play when not in interactive mode and reduced motion is off
  useEffect(() => {
    if (!isInteractive && !reduce) {
      const interval = setInterval(() => {
        setStep(prev => {
          if (prev >= 5) return 1 as StepId;
          return (prev + 1) as StepId;
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isInteractive, reduce]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('pending');
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    // 70% accepted, 30% rejected for variety
    const accepted = Math.random() > 0.3;
    setStep(accepted ? 4 : 5);
    setStatus(accepted ? 'success' : 'error');
  }, []);

  const handleTryInteractive = useCallback(() => {
    setIsInteractive(true);
    setStep(1);
    setForm({ rut: '', amount: '', docType: 'factura' });
    setStatus('pending');
    if (onTryInteractive) onTryInteractive();
  }, [onTryInteractive]);

  if (isInteractive) {
    return (
      <div className="p-6 sm:p-8 bg-snow border border-mist rounded-3xl shadow-card">
        <h3 className="text-lg font-semibold text-ink mb-4">Emitir DTE Interactivo</h3>
        <p className="text-sm text-slate-text mb-6">
          Ingresa los datos de tu factura para ver el proceso SII en tiempo real.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">RUT del emisor *</label>
              <input
                type="text"
                value={form.rut}
                onChange={e => setForm({ ...form, rut: e.target.value.replace(/[^0-9kK]/g, '') })}
                maxLength={12}
                className="w-full bg-cloud border border-mist rounded-md px-4 py-3 text-sm text-ink placeholder-iron focus:outline-none focus:ring-2 focus:ring-monday-violet/20 focus:border-monday-violet transition-all"
                placeholder="76.432.190-K"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Monto *</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                min={1000}
                className="w-full bg-cloud border border-mist rounded-md px-4 py-3 text-sm text-ink placeholder-iron focus:outline-none focus:ring-2 focus:ring-monday-violet/20 focus:border-monday-violet transition-all"
                placeholder="$ 10.000"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Tipo de documento *</label>
            <select
              value={form.docType}
              onChange={e => setForm({ ...form, docType: e.target.value })}
              className="w-full bg-cloud border border-mist rounded-md px-4 py-3 text-sm text-ink placeholder-iron focus:outline-none focus:ring-2 focus:ring-monday-violet/20 focus:border-monday-violet transition-all"
            >
              <option value="factura">Factura Normal</option>
              <option value="nota-credito">Nota de Crédito</option>
              <option value="nota-debito">Nota de Débito</option>
              <option value="guia">Guía de Despacho</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-monday-violet hover:bg-monday-violet-hover text-white px-6 py-3.5 rounded-[160px] text-sm font-medium flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] shadow-sm"
            disabled={status !== 'pending'}
          >
            {status === 'pending' ? (
              <>
                <span className="w-4 h-4" />
                Enviar a SII
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                DTE Aceptado
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                DTE Rechazado
              </>
            )}
          </button>
        </form>
        {status === 'success' && (
          <div className="mt-4 pt-4 border-t border-mist text-center">
            <CheckCircle className="w-8 h-8 bg-mint/30 rounded-2xl mx-auto mb-2 text-forest" />
            <p className="text-sm text-ink">Tu factura fue aceptada por el SII. Puedes timbrar y enviar al cliente.</p>
          </div>
        )}
        {status === 'error' && (
          <div className="mt-4 pt-4 border-t border-mist text-center">
            <XCircle className="w-8 h-8 bg-peach/30 rounded-2xl mx-auto mb-2 text-[#c64d00]" />
            <p className="text-sm text-ink">El SII rechazó tu documento. Verifica los datos e inténtalo nuevamente.</p>
          </div>
        )}
        <div className="mt-6 pt-6 border-t border-mist text-xs text-slate-text">
          <p>Datos de prueba. No se envían documentos reales al SII.</p>
        </div>
        <button
          onClick={handleTryInteractive}
          className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-monday-violet hover:text-monday-violet-hover transition-colors underline-offset-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Probar con otros datos
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-snow/80 backdrop-blur-xl border border-mist rounded-3xl shadow-card border-b-0 pb-0">
      {/* Pipeline steps */}
      <div className="absolute inset-0 pointer-events-none">
        {STEPS.map((stepConfig, i) => (
          <motion.div
            key={stepConfig.id}
            className={`flex items-center justify-center ${step <= stepConfig.id ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 ease-out ${reduce ? 'transition-none' : ''}`}
            style={{ transitionDelay: `${i * 0.2}s` }}
          >
            <div className="w-10 h-10 rounded-full bg-monday-violet/20 border border-monday-violet/20 text-monday-violet flex items-center justify-center text-xs font-bold">
              {stepConfig.label[0]}
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-1 h-8 mx-auto bg-monday-violet/20" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Step indicators with connection animation */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-2 pt-6"
        style={{ transition: reduce ? 'none' : 'transform 0.3s ease-out' }}
      >
        {STEPS.map((stepConfig, i) => (
          <motion.div
            key={stepConfig.id}
            className={`flex flex-col items-center gap-1 text-[10px] font-black tracking-widest ${
              step === stepConfig.id
                ? 'text-monday-violet'
                : 'text-monday-violet/60'
            }`}
            style={{ transitionDelay: `${i * 0.15}s` }}
          >
            <span className="w-8 h-8 rounded-full bg-monday-violet text-white flex items-center justify-center">
              {stepConfig.label[0]}
            </span>
            <span className="text-xs capitalize">{stepConfig.label}</span>
            {i < STEPS.length - 1 && (
              <motion.span
                className="w-8 h-1 bg-monday-violet/20"
                style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
              />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* CTA below pipeline */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 180, mass: 0.9 }}
          className="inline-flex items-center gap-2 rounded-[160px] bg-monday-violet hover:bg-monday-violet-hover text-white px-8 py-3.5 text-sm font-medium shadow-md transition-all duration-150 active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Empezar Gratis — 14 Días</span>
        </motion.div>
      </div>

      {/* Interactive toggle button */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -20 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 180, mass: 0.9, delay: 0.2 }}
        className="absolute top-6 right-6 flex items-center gap-2 text-xs font-medium text-monday-violet hover:text-monday-violet-hover transition-colors"
      >
        <span className="relative">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-monday-violet/20 bg-monday-violet/10 text-monday-violet"
          >
            Auto
            <span className="w-1.5 h-1.5 rounded-full bg-mint/50 animate-pulse" />
          </span>
        </span>
        <span onClick={handleTryInteractive} className="ml-2 cursor-pointer transition-colors hover underline">
          Probar
        </span>
      </motion.div>
    </div>
  );
}
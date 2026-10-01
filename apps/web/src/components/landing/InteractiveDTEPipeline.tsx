'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ShieldCheck, Check, RefreshCw, Layers, Clock } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Borrador' },
  { id: 2, label: 'Firma Digital' },
  { id: 3, label: 'Validación SII' },
  { id: 4, label: 'DTE Aceptado' },
] as const;

export function InteractiveDTEPipeline() {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev >= 4 ? 1 : prev + 1));
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='bg-snow border border-mist rounded-3xl p-6 sm:p-8 shadow-card flex flex-col gap-6 min-h-[440px] justify-between relative overflow-hidden'>
      {/* Glow background */}
      <div className='absolute top-0 right-0 w-48 h-48 bg-monday-violet/5 rounded-full blur-3xl pointer-events-none' />

      {/* Header Widget */}
      <div className='flex items-center justify-between border-b border-mist pb-4 w-full'>
        <div className='flex items-center gap-2'>
          <Layers className='w-5 h-5 text-monday-violet' />
          <div>
            <h3 className='text-sm font-bold text-ink'>Ciclo DTE en Tiempo Real</h3>
            <p className='text-[10px] text-slate-text'>Procesamiento automático SII con timbrado</p>
          </div>
        </div>
        <span className='px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-monday-violet/10 text-monday-violet border border-monday-violet/20 flex items-center gap-1'>
          <RefreshCw className='w-3 h-3 animate-spin' /> Demo Activa
        </span>
      </div>

      {/* Interactive Factura Display Card */}
      <div className='w-full flex-1 flex flex-col justify-center items-center'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className='w-full max-w-sm bg-cloud border border-mist rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col gap-3'
          >
            {/* Stamp/Status indicators overlay */}
            <div className='absolute top-4 right-4'>
              {step === 1 && (
                <span className='px-2 py-0.5 rounded-md text-[9px] font-bold bg-iron/20 text-iron uppercase tracking-wider'>
                  1. Borrador
                </span>
              )}
              {step === 2 && (
                <span className='px-2 py-0.5 rounded-md text-[9px] font-bold bg-lavender text-[#7c3aed] uppercase tracking-wider animate-pulse'>
                  2. Firmando CAF...
                </span>
              )}
              {step === 3 && (
                <span className='px-2 py-0.5 rounded-md text-[9px] font-bold bg-sky-accent/30 text-[#006680] uppercase tracking-wider animate-pulse'>
                  3. Validando SII...
                </span>
              )}
              {step === 4 && (
                <span className='px-2 py-0.5 rounded-md text-[9px] font-bold bg-mint/30 text-forest border border-mint/50 uppercase tracking-wider flex items-center gap-1'>
                  <Check className='w-3 h-3' /> 4. DTE Aceptado
                </span>
              )}
            </div>

            {/* Factura Layout details */}
            <div className='flex items-center gap-3'>
              <div className={'w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ' + (step === 4 ? 'bg-mint/30 text-forest' : 'bg-monday-violet/10 text-monday-violet')}>
                <FileText className='w-5 h-5' />
              </div>
              <div className='text-left'>
                <p className='text-xs font-bold text-ink'>FACTURA ELECTRÓNICA</p>
                <p className='text-[10px] text-iron font-mono'>Folio: N° {step >= 2 ? '41029' : '---'}</p>
              </div>
            </div>

            <div className='space-y-1.5 border-t border-mist pt-2 text-[11px]'>
              <div className='flex justify-between'>
                <span className='text-slate-text'>Receptor:</span>
                <span className='font-bold text-ink'>Inversiones Andes SpA</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-text'>RUT:</span>
                <span className='font-bold text-ink'>76.432.190-K</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-slate-text'>Monto Neto:</span>
                <span className='font-medium text-ink'>.000 CLP</span>
              </div>
              <div className='flex justify-between border-b border-mist pb-1.5'>
                <span className='text-slate-text'>IVA (19%):</span>
                <span className='font-medium text-ink'>.600 CLP</span>
              </div>
              <div className='flex justify-between text-xs font-bold pt-0.5'>
                <span className='text-ink'>Total DTE:</span>
                <span className='text-monday-violet'>.600 CLP</span>
              </div>
            </div>

            {/* Dynamic Status Log */}
            <div className='mt-1 flex items-center gap-2 p-2 bg-snow border border-mist rounded-xl'>
              {step >= 2 ? (
                <ShieldCheck className='w-4 h-4 text-forest shrink-0' />
              ) : (
                <Clock className='w-4 h-4 text-iron shrink-0' />
              )}
              <span className='text-[10px] text-slate-text font-medium truncate'>
                {step === 1 && 'Ingresando ítems y receptor...'}
                {step === 2 && 'Firma digital aplicada con certificado'}
                {step === 3 && 'Documento en cola de validación SII'}
                {step === 4 && 'Timbre SII verificado legalmente'}
              </span>
            </div>

            {/* Timbre Electrónico SII simulación */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className='p-2 border border-dashed border-monday-violet/40 rounded-lg bg-snow text-center flex flex-col items-center gap-0.5'
              >
                <div className='w-full flex justify-center gap-0.5 opacity-75 py-1'>
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className={'h-4 bg-ink ' + (i % 3 === 0 ? 'w-1' : 'w-0.5')} />
                  ))}
                </div>
                <span className='text-[8px] text-monday-violet font-bold tracking-widest uppercase'>Timbre Electrónico SII</span>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Steps Progress Footer */}
      <div className='w-full flex justify-between items-center relative pt-4 border-t border-mist'>
        {STEPS.map((s) => {
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className='flex flex-col items-center gap-1.5 focus:outline-none transition-transform active:scale-95'
            >
              <div className={'w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-300 ' + (
                isActive 
                  ? 'bg-monday-violet text-white border-monday-violet shadow-sm scale-110' 
                  : isDone 
                    ? 'bg-mint/30 text-forest border-mint/50' 
                    : 'bg-cloud text-iron border-mist'
              )}>
                {isDone ? <Check className='w-4 h-4' /> : s.id}
              </div>
              <span className={'text-[9px] font-bold uppercase transition-colors ' + (isActive ? 'text-monday-violet' : 'text-iron')}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

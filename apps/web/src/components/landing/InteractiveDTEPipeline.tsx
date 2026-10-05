'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ShieldCheck, Check, RefreshCw, Layers, Clock, Grip } from 'lucide-react';

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
    <div className='relative'>
      {/* Browser window frame — makes the demo read as a real app, not a mock */}
      <div className='bg-snow border border-mist rounded-2xl shadow-xl overflow-hidden'>
        {/* Title bar (mac-style traffic lights + URL bar) */}
        <div className='flex items-center justify-between border-b border-mist bg-cloud px-4 py-2.5 gap-3'>
          <div className='flex items-center gap-2'>
            <span className='w-3 h-3 rounded-full bg-[#FF5F57]' />
            <span className='w-3 h-3 rounded-full bg-[#FEBC2E]' />
            <span className='w-3 h-3 rounded-full bg-[#28C840]' />
          </div>
          <div className='flex items-center gap-2 text-[11px] text-slate-text font-medium bg-snow border border-mist rounded-md px-3 py-1 flex-1 max-w-[300px] mx-auto'>
            <svg className='w-3.5 h-3.5 shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
            </svg>
            app.yellow-erp.cl
          </div>
          <Grip className='w-4 h-4 text-iron/40 shrink-0' />
        </div>

        {/* App chrome — mini sidebar + main content */}
        <div className='flex min-h-[440px]'>
          {/* Mini sidebar */}
          <div className='w-12 border-r border-mist bg-cloud/60 flex flex-col items-center py-4 gap-4'>
            <div className='w-8 h-8 rounded-xl bg-sunshine flex items-center justify-center'>
              <span className='text-white font-black text-xs'>Y</span>
            </div>
            {[1,2,3,4,5].map(i => (
              <div key={i} className='w-6 h-1 rounded-full bg-mist' />
            ))}
          </div>

          {/* Main content */}
          <div className='flex-1 flex flex-col p-6 sm:p-8 relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-48 h-48 bg-sunshine/5 rounded-full blur-3xl pointer-events-none' />

            {/* Header Widget */}
            <div className='flex items-center justify-between border-b border-mist pb-4 w-full mb-6'>
              <div className='flex items-center gap-2'>
                <Layers className='w-5 h-5 text-sunshine-ink' />
                <div>
                  <h2 className='text-sm font-bold text-ink'>Ciclo DTE en Tiempo Real</h2>
                  <p className='text-[10px] text-slate-text'>Procesamiento automático SII con timbrado</p>
                </div>
              </div>
              <span className='px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-sunshine/10 text-sunshine-ink border border-sunshine-dark/20 flex items-center gap-1'>
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
                      <span className='px-2 py-0.5 rounded-md text-[9px] font-bold bg-iron/20 text-slate-text uppercase tracking-wider'>
                        1. Borrador
                      </span>
                    )}
                    {step === 2 && (
                      <span className='px-2 py-0.5 rounded-md text-[9px] font-bold bg-lavender text-[#8A6100] uppercase tracking-wider animate-pulse'>
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
                    <div className={'w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ' + (step === 4 ? 'bg-mint/30 text-forest' : 'bg-sunshine/10 text-sunshine-ink')}>
                      <FileText className='w-5 h-5' />
                    </div>
                    <div className='text-left'>
                      <p className='text-xs font-bold text-ink'>FACTURA ELECTRÓNICA</p>
                      <p className='text-[10px] text-slate-text font-mono'>Folio: N° {step >= 2 ? '41029' : '---'}</p>
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
                      <span className='font-medium text-ink'>$1.000.000</span>
                    </div>
                    <div className='flex justify-between border-b border-mist pb-1.5'>
                      <span className='text-slate-text'>IVA (19%):</span>
                      <span className='font-medium text-ink'>$190.000</span>
                    </div>
                    <div className='flex justify-between text-xs font-bold pt-0.5'>
                      <span className='text-ink'>Total DTE:</span>
                      <span className='text-sunshine-ink text-lg'>$1.190.000</span>
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

                  {/* Timbre Electrónico SII */}
                  {step === 4 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className='p-2 border border-dashed border-sunshine-dark/40 rounded-lg bg-snow text-center flex flex-col items-center gap-0.5'
                    >
                      <div className='w-full flex justify-center gap-0.5 opacity-75 py-1'>
                        {[...Array(24)].map((_, i) => (
                          <div key={i} className={'h-4 bg-ink ' + (i % 3 === 0 ? 'w-1' : 'w-0.5')} />
                        ))}
                      </div>
                      <span className='text-[8px] text-sunshine-ink font-bold tracking-widest uppercase'>Timbre Electrónico SII</span>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Steps Progress Footer */}
            <div className='w-full flex justify-between items-center relative pt-4 border-t border-mist mt-4'>
              {STEPS.map((s) => {
                const isActive = step === s.id;
                const isDone = step > s.id;
                return (
                  <button
                    key={s.id}
                    type='button'
                    onClick={() => setStep(s.id)}
                    className='flex flex-col items-center gap-1.5 focus:outline-none transition-transform active:scale-95'
                  >
                    <span
                      className={
                        'w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-300 ' +
                        (isActive
                          ? 'bg-sunshine text-white border-sunshine-dark shadow-sm scale-110'
                          : isDone
                            ? 'bg-mint/30 text-forest border-mint/50'
                            : 'bg-cloud text-slate-text border-mist')
                      }
                    >
                      {isDone ? <Check className='w-4 h-4' /> : s.id}
                    </span>
                    <span
                      className={
                        'text-[9px] font-bold uppercase transition-colors ' + (isActive ? 'text-sunshine-ink' : 'text-slate-text')
                      }
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
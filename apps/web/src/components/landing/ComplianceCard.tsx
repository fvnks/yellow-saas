'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  FileText,
  Calculator,
  Package,
  Building2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type RegulationCard = {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  status: string;
  statusColor: string;
  features: string[];
  normativaRef: string;
  normativaLabel: string;
};

const REGULATION_CARDS: RegulationCard[] = [
  {
    id: 'sii-dte',
    title: 'Facturación Electrónica SII',
    icon: ShieldCheck,
    color: 'text-monday-violet',
    bgColor: 'bg-monday-violet/10',
    borderColor: 'border-monday-violet/20',
    status: 'Activo',
    statusColor: 'bg-mint/30 text-forest',
    features: ['DTE 33, 34, 35, 46, 56, 61', 'CAF con firma digital', 'Timbre en segundos'],
    normativaRef: 'https://www.sii.cl/normativa/resoluciones/resol-exenta-n-4-2023',
    normativaLabel: 'Res. Exenta N°4/2023',
  },
  {
    id: 'libros-contables',
    title: 'Libros Contables Electrónicos',
    icon: FileText,
    color: 'text-forest',
    bgColor: 'bg-forest/10',
    borderColor: 'border-forest/20',
    status: 'Vigente',
    statusColor: 'bg-sky-accent/30 text-[#006680]',
    features: ['Libro Ventas, Compras, Honorarios', 'Firma electrónica calificada', 'Conservación 5 años'],
    normativaRef: 'https://www.sii.cl/normativa/resoluciones/resol-exenta-n-53-2021',
    normativaLabel: 'Res. Exenta N°53/2021',
  },
  {
    id: 'nominas',
    title: 'Nómina y DL 3.500',
    icon: Calculator,
    color: 'text-peony',
    bgColor: 'bg-peony/30',
    borderColor: 'border-peony/40',
    status: 'Activo',
    statusColor: 'bg-mint/30 text-forest',
    features: ['AFP 10-11.44%', 'ISAPRE 7%+UF', 'Previred automático'],
    normativaRef: 'https://www.sii.cl/previred',
    normativaLabel: 'DL 3.500',
  },
  {
    id: 'inventario',
    title: 'Inventario Tributario',
    icon: Package,
    color: 'text-sky-accent',
    bgColor: 'bg-sky-accent/10',
    borderColor: 'border-sky-accent/20',
    status: 'Vigente',
    statusColor: 'bg-sky-accent/30 text-[#006680]',
    features: ['Art. 41 ter Código Tributario', 'Método FIFO', 'Mermas Art. 31 N°4'],
    normativaRef: 'https://www.hacienda.gov.ley/articulo-41-ter',
    normativaLabel: 'Art. 41 ter',
  },
  {
    id: 'condominio',
    title: 'Condominio Ley 21.442',
    icon: Building2,
    color: 'text-cotton-candy',
    bgColor: 'bg-cotton-candy/20',
    borderColor: 'border-cotton-candy/30',
    status: 'Vigente',
    statusColor: 'bg-sky-accent/30 text-[#006680]',
    features: ['Asambleas y quórums', 'Fondo reserva 2%', 'Multas UF 10-100'],
    normativaRef: 'https://www.leychilena.cl/LPV21442',
    normativaLabel: 'Ley 21.442',
  },
];

export function ComplianceCard({ reducedMotion }: { reducedMotion: boolean }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {REGULATION_CARDS.map((card, index) => {
        const isActive = activeId === card.id;
        const Icon = card.icon;

        return (
          <motion.div
            key={card.id}
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            className={cn(
              'bg-snow border rounded-2xl p-4 transition-all duration-200 cursor-pointer group',
              isActive ? 'border-fog shadow-card-hover' : 'border-mist hover:border-fog hover:shadow-card'
            )}
            onClick={() => setActiveId(isActive ? null : card.id)}
          >
            {/* Header compacto */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border', card.bgColor, card.borderColor)}>
                  <Icon className={cn('w-5 h-5', card.color)} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-ink leading-tight">{card.title}</h3>
                  <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold mt-1', card.statusColor)}>
                    {card.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Features */}
            <AnimatePresence initial={false}>
              {isActive ? (
                <motion.div
                  initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                  animate={reducedMotion ? { height: 'auto', opacity: 1 } : { height: 'auto', opacity: 1 }}
                  exit={reducedMotion ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 border-t border-mist">
                    <ul className="space-y-1.5">
                      {card.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] text-ink">
                          <CheckCircle2 className="w-3.5 h-3.5 text-monday-violet mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={card.normativaRef}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium text-monday-violet hover:text-monday-violet-hover transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {card.normativaLabel}
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                  animate={reducedMotion ? { height: 'auto', opacity: 1 } : { height: 'auto', opacity: 1 }}
                  exit={reducedMotion ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-[11px] text-slate-text leading-relaxed">
                    {card.features[0]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

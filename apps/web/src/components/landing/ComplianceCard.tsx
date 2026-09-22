'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Calendar, Users, Folder, BarChart, DollarSign, Building2, Loader2 } from 'lucide-react';

type RegulationCard = {
  id: string;
  title: string;
  icon: any;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  content: () => React.ReactNode;
  normativaRef: string; // URL or norm number
};

const REGULATION_CARDS: RegulationCard[] = [
  {
    id: 'sii-dte',
    title: 'Facturación Electrónica SII',
    icon: ShieldCheck,
    color: 'text-monday-violet',
    badgeBg: 'bg-monday-violet/10',
    badgeText: 'text-monday-violet',
    badgeBorder: 'border-monday-violet/20',
    content: () => (
      <div className="space-y-3">
        <p className="text-[11px] font-medium text-ink">
          Resolución Exenta N°4/2023 — Tipos de DTE: 33 (Factura), 34 (Nota Crédito), 35 (Nota Débito), 46 (Boleta), 56 (Ticket), 61 (Guía)
        </p>
        <p className="text-[11px] font-medium text-ink">
          CAF (Certificate Authority Format): Firma digital del emisor, validada por SII antes del timbre
        </p>
        <p className="text-[11px] font-medium text-ink">
          Timbraje: SII agrega el código de validación y fecha de autorización. Plazo: segundos/minutos
        </p>
      </div>
    ),
    normativaRef: 'https://www.sii.cl/normativa/resoluciones/resol-exenta-n-4-2023',
  },
  {
    id: 'libros-contables',
    title: 'Libros Contables Electrónicos',
    icon: Folder,
    color: 'text-forest',
    badgeBg: 'bg-forest/10',
    badgeText: 'text-forest',
    badgeBorder: 'border-forest/50',
    content: () => (
      <div className="space-y-3">
        <p className="text-[11px] font-medium text-ink">
          Resolución Exenta N°53/2021 — Formato obligatorio: Libro Ventas, Libro Compras, Libro Honorarios, Libro IVA
        </p>
        <p className="text-[11px] font-medium text-ink">
          Firma electrónica qualificada (RUT del representante legal) requerida para apertura CERT
        </p>
        <p className="text-[11px] font-medium text-ink">
          Conservación: 5 años en formato SII establecidos, accesible vía portal SII
        </p>
      </div>
    ),
    normativaRef: 'https://www.sii.cl/normativa/resoluciones/resol-exenta-n-53-2021',
  },
  {
    id: 'nominas',
    title: 'Nómina y DL 3.500',
    icon: Calendar,
    color: 'text-peony',
    badgeBg: 'bg-peony/40',
    badgeText: 'text-peony',
    badgeBorder: 'border-peony/50',
    content: () => (
      <div className="space-y-3">
        <p className="text-[11px] font-medium text-ink">
          AFP: 10-11.44% (empresa), ISAPRE: 7%+UF (colaborador), DL 3.500 establece causales y trámites
        </p>
        <p className="text-[11px] font-medium text-ink">
          Previred: Certificado de pago antes del quinto día hábil siguiente. Integración obligatoria con proveedor autorizado
        </p>
        <p className="text-[11px] font-medium text-ink">
          Ley 21.210: Licencias médicas, licencias por hijo, permiso postnatal compartido (actualizada 2024)
        </p>
      </div>
    ),
    normativaRef: 'https://www.sii.cl/previred',
  },
  {
    id: 'inventario',
    title: 'Inventario Tributario',
    icon: Folder,
    color: 'text-sky-accent',
    badgeBg: 'bg-sky-accent/10',
    badgeText: 'text-sky-accent',
    badgeBorder: 'border-sky-accent/50',
    content: () => (
      <div className="space-y-3">
        <p className="text-[11px] font-medium text-ink">
          Art. 41 ter Código Tributario: Llevar libros de entrada, salida y existencias (Kardex obligatorio)
        </p>
        <p className="text-[11px] font-medium text-ink">
          FIFO (First In, First Out): método obligatorio para valorización de mercancías según normativa tributaria
        </p>
        <p className="text-[11px] font-medium text-ink">
          Mermas Art. 31 N°4: Registro y justificación de pérdidas por robo, deterioro, vencimiento, daño
        </p>
      </div>
    ),
    normativaRef: 'https://www.hacienda.gov.ley/articulo-41-ter',
  },
  {
    id: 'condominio',
    title: 'Condominio Ley 21.442',
    icon: Building2,
    color: 'text-cotton-candy',
    badgeBg: 'bg-cotton-candy/20',
    badgeText: 'text-cotton-candy',
    badgeBorder: 'border-cotton-candy/40',
    content: () => (
      <div className="space-y-3">
        <p className="text-[11px] font-medium text-ink">
          Asamblea: convocatoria obligatoria, quórums por tipo de acuerdo (mayoría simple, calificada, unánime)
        </p>
        <p className="text-[11px] font-medium text-ink">
          Fondo de reserva: mínimo 2% del valor de las áreas comunes, aplicación obligatoria desde 2023
        </p>
        <p className="text-[11px] font-medium text-ink">
          Contabilidad separada por condominio. Multas por incumplimiento: UF 10-100 según gravedad
        </p>
      </div>
    ),
    normativaRef: 'https://www.leychilena.cl/LPV21442',
  },
];

export function ComplianceCard({ reducedMotion }: { reducedMotion: boolean }) {
  const [activeId, setActiveId] = useState< string | null>(null);

  return (
    <div className="space-y-4">
      {REGULATION_CARDS.map((card) => (
        <motion.div
          key={card.id}
          className="bg-snow border border-mist rounded-3xl shadow-card overflow-hidden"
          style={{ transition: reducedMotion ? 'none' : 'height 0.3s ease' }}
        >
          <details
            open={activeId === card.id}
            onToggle={() => setActiveId(activeId === card.id ? null : card.id)}
            className={`p-5 flex items-start justify-between border-b border-mist last:border-0 ${card.badgeBg} ${card.badgeText} ${card.badgeBorder}`}
            style={{ transition: `background ${reducedMotion ? '0.3s' : '0.2s ease'}, borderColor ${reducedMotion ? '0.3s' : '0.2s ease'}` }}
          >
            <summary className="list-none cursor-pointer flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <motion.span
                  className={`w-8 h-8 rounded-xl ${card.color} flex items-center justify-center flex-shrink-0`}
                  style={{ transition: `transform ${reducedMotion ? '0s' : '0.2s ease'}` }}
                >
                  <card.icon className={`w-4 h-4`} />
                </motion.span>
                <span className="text-[12px] font-black tracking-widest capitalize flex-1">
                  {card.title}
                </span>
              </div>
              <div className="text-[10px] font-semibold text-ink opacity-80">
                {card.badgeText.replace('text-', '').replace('/30', '').replace('/40', '').replace('/50', '')}
              </div>
            </summary>
            <div className={`p-5 border-t border-mist`}>
              {card.content()}
              <a
                href={card.normativaRef}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-xs font-medium text-monday-violet hover:text-monday-violet-hover underline underline-offset-2"
              >
                Ver normativa completa
              </a>
            </div>
          </details>
        </motion.div>
      ))}
    </div>
  );
}
'use client';

import { motion } from 'framer-motion';
import { Package, ShoppingCart, Users, BarChart3, Shield, Calculator, Wallet, Building2 } from 'lucide-react';
import { useReducedMotion } from 'motion/react';

type Module = {
  id: string;
  title: string;
  icon: any;
  accent: string;
  subtitle: string;
  keyMetric: string;
  metricValue: string | number;
};

const MODULES: Module[] = [
  { id: 'inventory', title: 'Inventario', icon: Package, accent: 'sky-accent', subtitle: 'Bodegas, SKU, trazabilidad', keyMetric: 'Stock', metricValue: '342 items' },
  { id: 'sales', title: 'Ventas', icon: ShoppingCart, accent: 'monday-violet', subtitle: 'Cotizaciones, órdenes, DTE', keyMetric: 'Facturas', metricValue: '1.420 este mes' },
  { id: 'accounting', title: 'Contabilidad', icon: BarChart3, accent: 'mint', subtitle: 'Plan de cuentas, asientos automáticos', keyMetric: 'Asientos', metricValue: '87 este mes' },
  { id: 'payroll', title: 'Nómina', icon: Wallet, accent: 'peony', subtitle: 'AFP, ISAPRE, liquidaciones', keyMetric: 'Sueldos', metricValue: '24 colaboradores' },
  { id: 'projects', title: 'Proyectos', icon: Building2, accent: 'cotton-candy', subtitle: 'Gantt, Kanban, presupuestos', keyMetric: 'Proyectos', metricValue: '5 activos' },
];

export function ModuleFlow({ reducedMotion }: { reducedMotion: boolean }) {
  const staggerChildren = reducedMotion ? 0 : 0.1;

  return (
    <div className="relative py-12 sm:py-16 bg-snow border border-mist rounded-3xl shadow-card">
      <h2 className="text-2xl sm:text-3xl font-light text-ink tracking-[-0.02em] mb-8 text-center">
        Flujo de Datos en Yellow ERP
      </h2>

      <motion.div
        className="relative grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 pt-4"
        style={{ transitionDelay: `${staggerChildren}s` }}
      >
        {MODULES.map((mod) => (
          <motion.div
            key={mod.id}
            className={`bg-cloud border border-mist rounded-2xl p-4 shadow-xs text-center group`}
            style={{ transition: `transform ${staggerChildren * 2}s ease, opacity 0.3s ease` }}
          >
            <motion.div
              className={`w-10 h-10 ${mod.accent} rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110`}
            >
              <mod.icon className={`w-5 h-5 ${mod.accent === 'monday-violet' ? 'text-white' : 'text-ink'}`} />
            </motion.div>
            <h3 className="text-sm font-semibold text-ink mb-1">{mod.title}</h3>
            <p className="text-xs text-slate-text capitalize">{mod.subtitle}</p>
            <p className="text-xs font-bold text-ink">{typeof mod.metricValue === 'number' ? mod.metricValue : Number(mod.metricValue.replace(/[^\d]/g, ''))}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* SVG connectors showing data flow between modules */}
      <motion.svg
        className="absolute inset-0 pointer-events-none"
        style={{ transition: reducedMotion ? 'none' : 'opacity 0.5s ease' }}
        opacity={reducedMotion ? 0.3 : 1}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <path d="M0,0 L0,7 L9,3.5 z" fill="currentColor" />
          </marker>
        </defs>

        {/* Sales → Accounting */}
        <path
          d="M160 80 Q200 80, 200 100"
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray="4 4"
          markerEnd="url(#arrowhead)"
          className="opacity-50"
        />
        <path
          d="M240 100 Q280 100, 280 120"
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray="4 4"
          markerEnd="url(#arrowhead)"
          className="opacity-50"
        />

        {/* Accounting → Payroll */}
        <path
          d="M320 120 Q360 120, 360 140"
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray="4 4"
          markerEnd="url(#arrowhead)"
          className="opacity-50"
        />

        {/* Payroll → Projects */}
        <path
          d="M400 140 Q440 140, 440 160"
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray="4 4"
          markerEnd="url(#arrowhead)"
          className="opacity-50"
        />

        {/* Projects → Inventory */}
        <path
          d="M480 160 Q520 160, 520 180"
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray="4 4"
          markerEnd="url(#arrowhead)"
          className="opacity-50"
        />

        {/* Inventory → Sales */}
        <path
          d="M560 180 Q600 180, 600 200"
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray="4 4"
          markerEnd="url(#arrowhead)"
          className="opacity-50"
        />
      </motion.svg>
    </div>
  );
}
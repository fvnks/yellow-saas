'use client';

import { motion } from 'motion/react';
import { Building2, TrendingUp, Package, UsersRound, ShieldCheck } from 'lucide-react';

const highlights = [
  {
    icon: TrendingUp,
    title: 'Ventas y facturación',
    desc: 'Documentos electrónicos SII integrados',
  },
  {
    icon: Package,
    title: 'Inventario en tiempo real',
    desc: 'Stock multi-bodega sincronizado',
  },
  {
    icon: UsersRound,
    title: 'Equipo colaborativo',
    desc: 'Roles y permisos por usuario',
  },
];

const stats = [
  { value: '200+', label: 'empresas' },
  { value: '10k+', label: 'usuarios' },
  { value: '99,9%', label: 'disponibilidad' },
];

export default function AuthPanel() {
  return (
    <div className="relative hidden w-full flex-col p-4 lg:flex lg:min-h-screen lg:w-1/2">
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-cloud shadow-xl">
        {/* Grid pattern + glows */}
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-snow via-cloud to-periwinkle/30" />
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-monday-violet/10 rounded-full blur-[128px]" />
        <div className="absolute -bottom-40 -right-24 w-[380px] h-[380px] bg-mint/20 rounded-full blur-[128px]" />

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-snow/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-mist shadow-sm" style={{ background: 'conic-gradient(from 270deg, #8181ff 15%, #33dbdb 40%, #33d58e 55%, #ffd633 65%, #fc527d 85%, #8181ff 100%)' }}>
              <div className="w-9 h-9 bg-snow rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-monday-violet" />
              </div>
            </div>
            <span className="text-2xl font-bold text-ink tracking-tight">Yellow ERP</span>
          </div>

          {/* Highlights */}
          <div className="mt-14 space-y-5">
            {highlights.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-monday-violet/10 rounded-xl flex items-center justify-center border border-monday-violet/15 flex-shrink-0">
                    <Icon className="w-5 h-5 text-monday-violet" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="text-sm text-slate-text mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mini dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 rounded-2xl bg-snow/90 backdrop-blur border border-mist overflow-hidden shadow-card"
          >
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-mist">
              <div className="w-2.5 h-2.5 rounded-full bg-[#e24444]/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff8940]/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-forest/70" />
              <div className="ml-4 flex-1 h-6 rounded-md bg-cloud flex items-center px-3">
                <span className="text-[10px] text-iron">app.yellow-erp.cl/dashboard</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 p-4">
              <div className="rounded-xl bg-cloud border border-mist p-3">
                <p className="text-[9px] text-iron uppercase tracking-wider">Ventas hoy</p>
                <p className="text-lg font-bold text-ink mt-1">$2,4M</p>
                <p className="text-[10px] text-forest mt-0.5">+18,2%</p>
              </div>
              <div className="rounded-xl bg-cloud border border-mist p-3">
                <p className="text-[9px] text-iron uppercase tracking-wider">Facturas</p>
                <p className="text-lg font-bold text-ink mt-1">128</p>
                <p className="text-[10px] text-forest mt-0.5">+9</p>
              </div>
              <div className="rounded-xl bg-cloud border border-mist p-3">
                <p className="text-[9px] text-iron uppercase tracking-wider">Stock</p>
                <p className="text-lg font-bold text-ink mt-1">4.312</p>
                <p className="text-[10px] text-monday-violet mt-0.5">Óptimo</p>
              </div>
            </div>
            {/* Bar chart */}
            <div className="px-4 pb-4">
              <div className="flex items-end gap-1.5 h-16">
                {[35, 55, 42, 70, 58, 85, 64, 92, 74, 100, 82, 95].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-md ${i >= 7 ? 'bg-monday-violet' : 'bg-mist'}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bottom stats + trust */}
          <div className="mt-auto pt-10">
            <div className="flex items-center gap-6 border-t border-mist pt-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-lg font-bold text-ink">{s.value}</p>
                  <p className="text-[11px] text-slate-text">{s.label}</p>
                </div>
              ))}
              <div className="ml-auto flex items-center gap-2 text-iron">
                <ShieldCheck className="w-4 h-4 text-forest" />
                <span className="text-[11px]">Datos seguros</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

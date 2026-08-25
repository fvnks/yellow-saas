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
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[24px] bg-background shadow-xl">
        {/* Grid pattern + glows */}
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-blue-600/20 rounded-full blur-[128px]" />
        <div className="absolute -bottom-40 -right-24 w-[380px] h-[380px] bg-primary/20 rounded-full blur-[128px]" />

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-card/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/15">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Yellow ERP</span>
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
                  <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center border border-blue-400/20 flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
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
            className="mt-12 rounded-xl bg-primary/80 backdrop-blur border border-border overflow-hidden shadow-2xl"
          >
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              <div className="ml-4 flex-1 h-6 rounded-md bg-card/80 flex items-center px-3">
                <span className="text-[10px] text-muted-foreground">app.yellow-erp.cl/dashboard</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 p-4">
              <div className="rounded-xl bg-card/60 border border-border/60 p-3">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Ventas hoy</p>
                <p className="text-lg font-bold text-white mt-1">$2,4M</p>
                <p className="text-[10px] text-emerald-400 mt-0.5">+18,2%</p>
              </div>
              <div className="rounded-xl bg-card/60 border border-border/60 p-3">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Facturas</p>
                <p className="text-lg font-bold text-white mt-1">128</p>
                <p className="text-[10px] text-emerald-400 mt-0.5">+9</p>
              </div>
              <div className="rounded-xl bg-card/60 border border-border/60 p-3">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Stock</p>
                <p className="text-lg font-bold text-white mt-1">4.312</p>
                <p className="text-[10px] text-blue-400 mt-0.5">Óptimo</p>
              </div>
            </div>
            {/* Bar chart */}
            <div className="px-4 pb-4">
              <div className="flex items-end gap-1.5 h-16">
                {[35, 55, 42, 70, 58, 85, 64, 92, 74, 100, 82, 95].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-md ${i >= 7 ? 'bg-blue-500' : 'bg-muted'}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bottom stats + trust */}
          <div className="mt-auto pt-10">
            <div className="flex items-center gap-6 border-t border-border pt-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-lg font-bold text-white">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
              <div className="ml-auto flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px]">Datos seguros</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

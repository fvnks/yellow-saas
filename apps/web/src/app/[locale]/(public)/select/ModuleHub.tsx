'use client';

import { motion } from 'motion/react';
import { ArrowRight, Lock } from 'lucide-react';

interface ModuleOption {
  id: string;
  title: string;
  subtitle: string;
  description: string[];
  icon: any;
  href: string;
  moduleName: string;
}

interface Props {
  modules: ModuleOption[];
  activatedModules: Set<string>;
  isSuperAdmin: boolean;
  handleModuleClick: (mod: ModuleOption) => void;
}

export function ModuleHub({ modules, activatedModules, isSuperAdmin, handleModuleClick }: Props) {
  const isModuleActivated = (mod: ModuleOption) => {
    if (mod.id === 'mi-cuenta' || mod.id === 'ayuda') return true;
    if (isSuperAdmin) return true;
    return activatedModules.has(mod.moduleName);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {modules.map((mod, i) => {
        const Icon = mod.icon;
        const activated = isModuleActivated(mod);
        return (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.03 * i }}
            className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-200"
          >
            <button
              onClick={() => handleModuleClick(mod)}
              className="absolute inset-0 w-full h-full cursor-pointer"
              aria-label={`Abrir ${mod.title}`}
            />
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                <Icon className="w-6 h-6 text-slate-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight">{mod.title}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    {mod.subtitle}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-[1.5] text-slate-600 line-clamp-2">
                  {mod.description.join(' · ')}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${activated ? 'text-emerald-700' : 'text-amber-700'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${activated ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                    {activated ? 'Activo' : 'Requiere activación'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-500 group-hover:text-slate-900 transition-colors">
                    {activated ? 'Abrir' : 'Activar'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
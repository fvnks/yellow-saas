'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Ticket, Search, LifeBuoy, BookOpen, MessageSquare } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function AyudaPage() {
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/support/faq')
      .then(res => res.json())
      .then(data => {
        if (data.success) setFaqItems(data.data || []);
      })
      .catch(err => console.error('Failed to load FAQ:', err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Todos', ...Array.from(new Set(faqItems.map(i => i.category)))];

  const filtered = faqItems.filter(item => {
    const matchCategory = category === 'Todos' || item.category === category;
    const matchSearch = search === '' ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#232323]">Centro de Ayuda</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Soporte 24/7
            </span>
          </div>
          <p className="text-sm text-[#718EBF] mt-1">Encuentra respuestas rápidas, documentación oficial y atención directa con nuestro equipo</p>
        </div>
        <Link href="/ayuda/tickets"
          className="bg-[#1814F3] hover:bg-[#1612D3] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-150 active:scale-[0.98] shadow-sm">
          <Ticket className="w-4 h-4" />
          Crear Ticket de Soporte
        </Link>
      </div>

      {/* Hero Search Box */}
      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-3">
            <LifeBuoy className="w-7 h-7 text-[#1814F3]" />
          </div>
          <h2 className="text-lg font-bold text-[#232323]">¿En qué podemos ayudarte hoy?</h2>
          <p className="text-sm text-[#718EBF] mt-1 max-w-lg">Explora la base de conocimiento de Yellow ERP o consulta con un especialista</p>
          <div className="relative w-full max-w-lg mt-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718EBF]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por tema, módulo, DTE, SII, facturas..."
              className="w-full bg-white border border-[#E6EFF5] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#232323] placeholder-[#718EBF] focus:outline-none focus:ring-2 focus:ring-[#1814F3]/20 focus:border-[#1814F3] transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                category === cat
                  ? 'bg-[#1814F3] text-white shadow-sm'
                  : 'bg-[#F5F7FA] text-[#718EBF] hover:bg-[#E6EFF5] hover:text-[#232323]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="bg-white border border-[#E6EFF5] rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-[#E6EFF5]">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="px-6 py-5">
                <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-[#8BA3CB] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#232323]">No se encontraron preguntas</p>
            <p className="text-xs text-[#718EBF] mt-1">Prueba ajustando la búsqueda o crea una solicitud a soporte</p>
            <Link href="/ayuda/tickets"
              className="inline-flex items-center gap-2 mt-4 bg-[#1814F3] hover:bg-[#1612D3] text-white px-4 py-2 rounded-xl text-xs font-medium transition-all duration-150 active:scale-[0.98]">
              <MessageSquare className="w-4 h-4" />
              Crear Ticket
            </Link>
          </div>
        ) : (
          filtered.map((item, index) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id || index} className="border-b border-[#E6EFF5] last:border-b-0">
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${
                    isOpen ? 'bg-[#F5F7FA]' : 'hover:bg-[#F5F7FA]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border transition-colors ${
                      isOpen ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {item.category}
                    </span>
                    <span className={`text-sm font-semibold transition-colors ${isOpen ? 'text-[#1814F3]' : 'text-[#232323]'}`}>{item.question}</span>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className={`w-4 h-4 ${isOpen ? 'text-[#1814F3]' : 'text-[#718EBF]'}`} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 pl-16">
                        <p className="text-sm text-[#232323] leading-relaxed">{item.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

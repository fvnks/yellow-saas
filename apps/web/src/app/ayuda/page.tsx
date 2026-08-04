'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Ticket, Search, LifeBuoy, BookOpen, MessageSquare } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FaqItem[] = [
  {
    category: 'Cuenta',
    question: '¿Cómo puedo recuperar mi contraseña?',
    answer: 'En la pantalla de inicio de sesión haz clic en "¿Olvidaste tu contraseña?" e ingresa tu correo. Recibirás un enlace para restablecerla. Si no recibes el correo, revisa tu bandeja de spam o contacta con soporte.',
  },
  {
    category: 'Cuenta',
    question: '¿Cómo agrego o elimino usuarios en mi empresa?',
    answer: 'Ve al módulo ERP → Configuración → Usuarios. Allí podrás invitar nuevos usuarios con roles específicos o desactivar usuarios existentes. Los roles controlan qué módulos y acciones puede ver cada usuario.',
  },
  {
    category: 'Módulos',
    question: '¿Cómo activo un módulo adicional?',
    answer: 'Desde "Mi Cuenta" → "Módulos Adicionales" verás el catálogo de módulos disponibles. Actívalos y quedarán disponibles en el selector de módulos. Algunos módulos requieren contacto con soporte para su configuración inicial.',
  },
  {
    category: 'Módulos',
    question: 'No encuentro un módulo en mi selector de módulos',
    answer: 'El selector muestra solo los módulos activos para tu plan. Verifica en "Mi Cuenta" → "Módulos Adicionales" que el módulo esté activo. Si sigue sin aparecer, cierra sesión y vuelve a entrar.',
  },
  {
    category: 'Inventario',
    question: '¿Cómo ajusto el stock de un producto?',
    answer: 'En el módulo ERP → Inventario → "Ajustes de Stock" puedes crear un ajuste manual indicando el motivo y el nuevo stock. Los ajustes quedan registrados en el historial para auditoría.',
  },
  {
    category: 'Inventario',
    question: '¿Qué significa stock negativo?',
    answer: 'Un stock negativo indica que se registraron más salidas que entradas del producto. Revisa los movimientos del producto y realiza un ajuste de stock con la cantidad correcta.',
  },
  {
    category: 'Ventas',
    question: '¿Cómo emito una boleta o factura?',
    answer: 'En el módulo ERP → Ventas → "Nuevo Documento" selecciona el tipo de documento (boleta o factura), agrega el cliente y los productos. Completa los datos de pago y guarda el documento.',
  },
  {
    category: 'Ventas',
    question: '¿Puedo anular o corregir una venta ya emitida?',
    answer: 'Sí. Desde el listado de ventas, abre el documento y usa la opción de anulación o nota de crédito. El sistema mantiene un registro de las correcciones para fines contables.',
  },
  {
    category: 'Reportes',
    question: '¿Cómo descargo un reporte?',
    answer: 'La mayoría de los listados tienen un botón de exportación (CSV o PDF). Abre el módulo correspondiente, aplica tus filtros y usa el botón de exportar para descargar la información.',
  },
  {
    category: 'Soporte',
    question: '¿Cómo contacto con soporte?',
    answer: 'Crea un ticket desde "Mis Tickets" en este mismo módulo de Ayuda. Describe el problema con el mayor detalle posible: qué módulo usabas, qué acción realizabas y qué error viste. Nuestro equipo te atenderá a la brevedad.',
  },
];

const categories = ['Todos', 'Cuenta', 'Módulos', 'Inventario', 'Ventas', 'Reportes', 'Soporte'];

export default function AyudaPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filtered = faqItems.filter(item => {
    const matchCategory = category === 'Todos' || item.category === category;
    const matchSearch = search === '' ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Centro de Ayuda</h1>
          <p className="text-sm text-slate-500 mt-1">Encuentra respuestas a tus preguntas frecuentes</p>
        </div>
        <Link href="/ayuda/tickets"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Ticket className="w-4 h-4" />
          Crear Ticket
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <LifeBuoy className="w-7 h-7 text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">¿En qué podemos ayudarte?</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-lg">Busca entre nuestras preguntas frecuentes o crea un ticket de soporte</p>
          <div className="relative w-full max-w-lg mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar una pregunta..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No se encontraron resultados</p>
            <p className="text-xs text-slate-400 mt-1">Prueba con otra búsqueda o crea un ticket de soporte</p>
            <Link href="/ayuda/tickets"
              className="inline-flex items-center gap-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <MessageSquare className="w-4 h-4" />
              Crear Ticket
            </Link>
          </div>
        ) : (
          filtered.map((item, index) => (
            <div key={index} className="border-b border-slate-100 last:border-b-0">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    {item.category}
                  </span>
                  <span className="text-sm font-medium text-slate-900">{item.question}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 pl-16">
                  <p className="text-sm text-slate-600 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <>
      {/* ====== HERO ====== */}
      <section className="relative bg-surface-dark overflow-hidden min-h-[85vh] flex items-center">
        {/* Gradient overlays */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-surface-dark via-slate-800 to-surface-dark" />
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-brand/10 via-amber-500/5 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-brand/15 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Hero image — right side with rounded frame */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 h-full hidden lg:block">
          <div className="relative w-full h-full">
            <Image
              src="/screenshots/dashboard-wide.png"
              alt="Yellow ERP — Dashboard de ventas y finanzas en tiempo real"
              fill
              className="object-cover opacity-90 rounded-xl shadow-2xl"
              priority
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-surface-dark/80 via-transparent to-transparent" />
            {/* Decorative accent */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/10 rounded-full rotate-12" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-brand/20 rounded-full rotate-30" />
          </div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-0 w-full lg:w-1/2">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 mb-8">
              <span className="text-label font-medium text-brand hover:text-brand-hover transition-colors">
                Nuevo — Yellow ERP v2.0
              </span>
            </div>

            <h1 className="text-display font-bold text-white leading-tight tracking-tight">
              Finanzas{' '}
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                que crecen
              </span>
            </h1>

            <p className="mt-6 text-xl text-slate-300 font-normal leading-relaxed max-w-lg">
              El ERP chileno que emite facturas al SII mientras vendes.
              Inventario, ventas, compras, contabilidad y nómina — todo en uno.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex items-center gap-4 flex-wrap">
              <Link
                href="/dashboard"
                className="group px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500
                           text-surface-dark font-bold rounded-xl shadow-xl shadow-brand/25
                           hover:shadow-2xl hover:shadow-brand/40 hover:scale-[1.02]
                           active:scale-[0.98] transition-all duration-200
                           focus:outline-none focus:ring-2 focus:ring-[rgba(245,197,24,0.3)] focus:ring-offset-2 focus:ring-offset-surface-dark"
              >
                Empieza gratis
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="#demo"
                className="px-8 py-4 text-white font-medium rounded-xl
                           border border-slate-600 hover:border-slate-400
                           hover:bg-slate-800/50 transition-all duration-200
                           focus:outline-none focus:ring-2 focus:ring-[rgba(100,116,139,0.3)] focus:ring-offset-2 focus:ring-offset-surface-dark"
              >
                Ver demo
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex items-center gap-6 text-slate-400 text-label font-medium">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                SII online
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                UF / AFP / ISAPRE
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                Facturación electrónica
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ====== MODULES PREVIEW ====== */}
      <section className="bg-surface-muted py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-h2 font-bold text-ink text-center mb-12">
            Todo lo que tu negocio necesita
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Ventas', desc: 'Cotizaciones, pedidos y facturación electrónica al SII' },
              { title: 'Bodega', desc: 'Inventario en tiempo real, stock mínimo y reservas' },
              { title: 'Compras', desc: 'Órdenes de compra, proveedores y presupuestos' },
              { title: 'Contabilidad', desc: 'Libros contables, balance general y estado de resultados' },
              { title: 'Nómina', desc: 'Liquidación de sueldos con AFP, ISAPRE y UF' },
              { title: 'Cobranza', desc: 'Control de cuentas por cobrar y seguimiento' },
            ].map((mod) => (
              <div
                key={mod.title}
                className="bg-surface-card rounded-2xl p-6 shadow-card hover:shadow-card-hover
                           border border-surface-border transition-shadow duration-200"
              >
                <h3 className="text-h3 font-semibold text-ink mb-2">{mod.title}</h3>
                <p className="text-body font-medium text-ink-muted">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== PRICING ====== */}
      <section id="demo" className="bg-surface-card py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-h2 font-bold text-ink mb-4">Planes simples, sin sorpresas</h2>
            <p className="text-body font-medium text-ink-muted">
              Comienza gratis y escala cuando tu negocio crezca
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$0',
                period: 'mes',
                cta: 'Comenzar',
                features: ['Hasta 3 usuarios', 'Inventario básico', 'Facturación SII', 'Soporte email'],
              },
              {
                name: 'Pro',
                price: '$23.920',
                period: 'mes',
                cta: 'Empezar prueba',
                highlighted: true,
                features: ['Usuarios ilimitados', 'Inventario avanzado', 'Facturación + compras', 'Nómina incluida', 'Soporte prioritario'],
              },
              {
                name: 'Enterprise',
                price: 'Contacto',
                period: '',
                cta: 'Hablar con ventas',
                features: ['Personalizado', 'API completa', 'Onboarding dedicado', 'SLA 99.9%', 'Account manager'],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`
                  relative rounded-2xl p-8 shadow-xl hover:shadow-2xl
                  transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]
                  ${plan.highlighted
                    ? 'bg-gradient-to-b from-brand to-brand-hover border-2 border-brand/40'
                    : 'bg-surface-card border border-surface-border'}
                `}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-surface-dark text-brand text-label font-bold rounded-full">
                    Más popular
                  </div>
                )}
                <h3 className={`text-h3 font-bold ${plan.highlighted ? 'text-white' : 'text-ink'}`}>
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-ink'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-body font-medium ${plan.highlighted ? 'text-brand/80' : 'text-ink-muted'}`}>
                      /{plan.period}
                    </span>
                  )}
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className={`text-body font-medium flex items-start gap-2 ${
                      plan.highlighted ? 'text-white/90' : 'text-ink-muted'
                    }`}>
                      <span className={plan.highlighted ? 'text-white' : 'text-emerald-500'}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`
                  mt-8 w-full py-3.5 px-6 rounded-xl font-bold text-body
                  transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${plan.highlighted
                    ? 'bg-white text-brand hover:bg-brand/5 focus:ring-white'
                    : 'bg-surface-dark text-white hover:bg-slate-800 focus:ring-surface-dark'}
                `}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="bg-surface-dark border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-label font-medium text-slate-400">Yellow ERP</span>
            <span className="text-label text-slate-600">—</span>
            <span className="text-label text-slate-500">El ERP chileno</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-label font-medium text-slate-400 hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="#" className="text-label font-medium text-slate-400 hover:text-white transition-colors">
              Contacto
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
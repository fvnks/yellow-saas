import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  return (
    <>
      {/* ====== HERO ====== */}
      <section className="relative bg-snow overflow-hidden min-h-[100dvh] flex items-center pt-24 pb-24">
        {/* Gradient accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-brand/10 via-amber-500/5 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-brand/15 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Hero image - right side with rounded frame */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 h-full hidden lg:block">
          <div className="relative w-full h-full">
            <Image
              src="/screenshots/dashboard-wide.png"
              alt="Yellow ERP - Dashboard de ventas y finanzas en tiempo real"
              fill
              className="object-cover opacity-90 rounded-xl shadow-2xl"
              priority
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-snow/80 via-transparent to-transparent" />
          </div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full lg:w-1/2">
          <div className="max-w-2xl">
            {/* Badge */}
            <Badge className="bg-brand/10 border border-brand/20 text-brand mb-6 px-4 py-1.5">
              Nuevo: Yellow ERP v2.0
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Finanzas que crecen
            </h1>

            <p className="mt-6 text-xl text-slate-text font-normal leading-relaxed max-w-lg">
              El ERP chileno que emite facturas al SII mientras vendes. Inventario, ventas, compras, contabilidad y nomina en una sola plataforma.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex items-center gap-4 flex-wrap">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-surface-dark font-bold shadow-xl shadow-brand/25
                           hover:shadow-2xl hover:shadow-brand/40 hover:scale-[1.02]
                           active:scale-[0.98] transition-all duration-200
                           focus:outline-none focus:ring-2 focus:ring-[rgba(245,197,24,0.3)] focus:ring-offset-2 focus:ring-offset-snow"
              >
                <Link href="/dashboard">
                  Empieza gratis
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-slate-300 hover:border-slate-400 hover:bg-slate-100/50 text-ink
                           transition-all duration-200
                           focus:outline-none focus:ring-2 focus:ring-[rgba(245,197,24,0.3)] focus:ring-offset-2 focus:ring-offset-snow"
              >
                <Link href="#demo">Ver demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ====== TRUST STRIP ====== */}
      <section className="bg-surface-muted/50 border-y border-surface-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-500">
            <Badge variant="success" className="gap-2 px-4 py-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              SII online
            </Badge>
            <Badge variant="success" className="gap-2 px-4 py-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              UF / AFP / ISAPRE
            </Badge>
            <Badge variant="success" className="gap-2 px-4 py-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              Facturacion electronica
            </Badge>
          </div>
        </div>
      </section>

      {/* ====== MODULES PREVIEW ====== */}
      <section className="bg-surface-muted py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">Todo lo que tu negocio necesita</h2>
            <p className="text-lg text-ink-muted max-w-2xl mx-auto">
              Seis modulos integrados para gestionar tu PYME sin cambiar de herramienta
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Ventas', desc: 'Cotizaciones, pedidos y facturacion electronica al SII' },
              { title: 'Bodega', desc: 'Inventario en tiempo real, stock minimo y reservas' },
              { title: 'Compras', desc: 'Ordenes de compra, proveedores y presupuestos' },
              { title: 'Contabilidad', desc: 'Libros contables, balance general y estado de resultados' },
              { title: 'Nomina', desc: 'Liquidacion de sueldos con AFP, ISAPRE y UF' },
              { title: 'Cobranza', desc: 'Control de cuentas por cobrar y seguimiento' },
            ].map((mod) => (
              <Card key={mod.title} className="hover:shadow-card-hover transition-shadow duration-200 border-surface-border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-ink mb-2">{mod.title}</h3>
                  <p className="text-base font-medium text-ink-muted">{mod.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ====== PRICING ====== */}
      <section id="demo" className="bg-surface-card py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">Planes simples, sin sorpresas</h2>
            <p className="text-lg text-ink-muted">
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
                features: ['Hasta 3 usuarios', 'Inventario basico', 'Facturacion SII', 'Soporte email'],
              },
              {
                name: 'Pro',
                price: '$23.920',
                period: 'mes',
                cta: 'Empezar prueba',
                highlighted: true,
                features: ['Usuarios ilimitados', 'Inventario avanzado', 'Facturacion + compras', 'Nomina incluida', 'Soporte prioritario'],
              },
              {
                name: 'Enterprise',
                price: 'Contacto',
                period: '',
                cta: 'Hablar con ventas',
                features: ['Personalizado', 'API completa', 'Onboarding dedicado', 'SLA 99.9%', 'Account manager'],
              },
            ].map((plan) => (
              <Card
                key={plan.name}
                className={`
                  relative p-8 shadow-xl hover:shadow-2xl
                  transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]
                  ${plan.highlighted
                    ? 'bg-gradient-to-b from-brand to-brand-hover border-2 border-brand/40'
                    : 'bg-surface-card border border-surface-border'}
                `}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-surface-dark text-brand text-sm font-bold rounded-full">
                    Mas popular
                  </div>
                )}
                <h3 className={`text-xl font-bold ${plan.highlighted ? 'text-white' : 'text-ink'}`}>
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-ink'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-base font-medium ${plan.highlighted ? 'text-brand/80' : 'text-ink-muted'}`}>
                      /{plan.period}
                    </span>
                  )}
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className={`text-base font-medium flex items-start gap-2 ${
                      plan.highlighted ? 'text-white/90' : 'text-ink-muted'
                    }`}>
                      <span className={plan.highlighted ? 'text-white' : 'text-emerald-500'}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`
                    mt-8 w-full py-3.5 px-6 rounded-xl font-bold text-base
                    transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${plan.highlighted
                      ? 'bg-white text-surface-dark hover:bg-slate-100 focus:ring-white'
                      : 'bg-surface-dark text-white hover:bg-slate-800 focus:ring-surface-dark'}
                  `}
                >
                  <Link href={plan.highlighted ? '/register' : '#'}>{plan.cta}</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="bg-surface-dark border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-400">Yellow ERP</span>
            <span className="text-sm text-slate-600">-</span>
            <span className="text-sm text-slate-500">El ERP chileno</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Contacto
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
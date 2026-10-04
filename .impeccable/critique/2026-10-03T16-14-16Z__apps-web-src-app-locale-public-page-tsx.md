---
target: apps/web/src/app/[locale]/(public)/page.tsx
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 4
target_identity: "file:D:\\proyectos\\yellow-saas\\apps\\web\\src\\app\\[locale]\\(public)\\page.tsx"
target_fingerprint: "sha256:a22ff62333eb9362b500e656b23f8390c5265c3fae3abe27ce76843c257eefcb"
target_path: "D:\\proyectos\\yellow-saas\\apps\\web\\src\\app\\[locale]\\(public)\\page.tsx"
timestamp: 2026-10-03T16-14-16Z
slug: apps-web-src-app-locale-public-page-tsx
---
# Crítica de diseño — Landing Yellow ERP

**Target:** `apps/web/src/app/[locale]/(public)/page.tsx`
**Método:** degradado (A: sub-agente `ses_efd7d1630ffeo6k8arBE3qcYme` · B: contexto padre)
**Fecha:** 2026-10-03

Assessment A corrió aislado pero sin browser (sesión aislada), así que es revisión por código. Assessment B corrió en el contexto padre: el sub-agente no pudo resolver la ruta del target ni acceder al browser; el detector CLI y la visualización se hicieron aquí.

## Hallazgo clave antes de la crítica

Producción (`yellow-erp.cl`) sigue sirviendo el código viejo. Verificado en vivo: sin `<main>`, sin skip link, 4 elementos con `text-iron` en el footer, y "Contactar a Ventas" → `/register`. Los 11 commits están en `main` pero no están desplegados.

## Design Health Score

| # | Heurística | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | El pipeline DTE comunica estado bien; el formulario no deshabilita los campos durante el envío |
| 2 | Match System / Real World | 4 | DTE, SII, AFP, ISAPRE, UF, RUT, IVA, Previred. CLP con "+ IVA" |
| 3 | User Control and Freedom | 2 | El pipeline auto-avanza cada 3,2 s sin pausa ni reinicio |
| 4 | Consistency and Standards | 3 | Montos rotos (".000 CLP") y subtítulo de módulos con error factual |
| 5 | Error Prevention | 2 | Solo validación HTML5; placeholders a 3,0:1; sin estado de carga en campos |
| 6 | Recognition Rather Than Recall | 3 | Buenos iconos y badges; el auto-avance obliga a recordar el paso anterior |
| 7 | Flexibility and Efficiency | n/a | Superficie Persuade — no aplica. Max: 32 |
| 8 | Aesthetic and Minimalist Design | 3 | Limpio y consistente; pero los contadores del hero duplican la sección Stats |
| 9 | Error Recovery | 2 | Error genérico en banner rojo, sin indicación por campo ni ruta de recuperación |
| 10 | Help and Documentation | n/a | Superficie Persuade — no aplica. Max: 32 |
| **Total** | | **22/32** | **Aceptable (20–27)** |

## Design Specificity

**Autorada para este producto — no intercambiable por categoría.** El `InteractiveDTEPipeline` simula el flujo real SII (Borrador → Firma Digital → Validación SII → DTE Aceptado) con RUT `76.432.190-K`, IVA 19% y Timbre Electrónico. `ComplianceCard` cita normativa real (Res. Exenta N°4/2023, DL 3.500, Art. 41 ter, Ley 21.442). Precios en CLP con "+ IVA". Footer con SII, UF Hoy, Previred, Dirección del Trabajo.

**Pero:** las grids de módulos (8) y features (6) son estructuralmente idénticas y genéricas; el CTA "Toma el control total de tu empresa hoy" es copy SaaS genérico; el formulario de contacto no tiene campos producto-específicos; y el logo del navbar usa un gradiente cónico arcoíris que agencia creativa, no ERP B2B.

**Detector (53 hallazgos):** `nested-cards` ×~30 (casi todos falsos positivos — tarjeta dentro de tarjeta es un patrón legítimo), `undersized-ui-text`/`tiny-text` ×~20 (texto funcional de 8–11 px), `low-contrast` ×3 (placeholders a 3,0:1), `line-length` ×4 (FAQ a ~93–100 chars/linea), `ai-color-palette` ×1 (el gradiente arcoíris del logo), `layout-transition`, `pulsing-dot`, `dark-glow`.

## Overall Impresión

El producto tiene un elemento genuinamente diferenciador (el pipeline DTE) y una sección de cumplimiento que cierra ventas. Pero el centro de ese elemento diferenciador está roto: los montos de la factura no tienen dígitos. Un dueño de PyME chilena que ve ".000 CLP" en la demo de facturación asume que el producto no sabe formatear moneda.

## What's Working

1. El pipeline DTE es el único elemento que muestra el producto funcionando. El flujo paso a paso con datos reales (RUT, IVA, Folio, Timbre) es algo que ninguna landing de la competencia podría replicar.
2. ComplianceCard con referencias legales reales es un diferenciador de confianza. Citar Res. Exenta N°4/2023 y DL 3.500 dice "conocemos la ley chilena" más que cualquier copy.
3. La transparencia de precios es excelente. CLP con "+ IVA", -20% anual visible, "Sin costos de implementación ni permanencia mínima".

## Priority Issues

### [P0] Los montos del pipeline DTE están rotos — ".000 CLP"
**Qué:** En `InteractiveDTEPipeline.tsx` líneas 100, 104, 108 los montos son `.000 CLP`, `.600 CLP`, `.600 CLP`. Faltan los dígitos iniciales y no suman (IVA 19% de .000 ≠ .600).
**Por qué importa:** Es el elemento más específico de la página, en el hero. Montos rotos en una demo de facturación destruyen la credibilidad al instante.
**Fix:** Montos realistas con formato CLP: Neto `$1.000.000`, IVA (19%) `$190.000`, Total `$1.190.000`.

### [P0] El subtítulo de módulos contiene una contradicción factual
**Qué:** `page.tsx:278` — "Ventas genera asientos contables, Contabilidad calcula nómina, Nómina actualiza inventario, Proyectos cierra el ciclo."
**Por qué importa:** Está al revés (la nómina alimenta la contabilidad, no al revés) y "Nómina actualiza inventario" no tiene sentido. Un dueño de PyME que conoce su negocio lo detecta y duda del producto.
**Fix:** "Ventas genera asientos contables, Nómina alimenta la contabilidad, Inventario actualiza costos, Proyectos cierra el ciclo."

### [P1] El pipeline DTE auto-avanza sin control del usuario
**Qué:** `setInterval` cada 3,2 s incondicional. Sin pausa, sin reinicio, sin manera de detenerlo para leer un paso.
**Por qué importa:** El usuario no puede controlar la demo más importante de la página. Viola la heurística #3 y frustra al evaluador deliberado.
**Fix:** Botón pausa/play en el header del pipeline; al pausar, avance manual por pasos; botón "Reiniciar".

### [P1] Los contadores de confianza del hero duplican la sección Stats
**Qué:** Hero: "2.4M+ DTEs", "99.9% Uptime SLA", "250+ Empresas activas". Stats: "250+ Empresas en Chile", "99.9% Disponibilidad SLA", "2.4M+ DTEs SII". Tres de cuatro son idénticos.
**Por qué importa:** El hero es el espacio más valioso. Repetir los mismos números 120 px abajo lo desperdicia y genera "¿ya leí esto?".
**Fix:** Quitar los contadores del hero; dejar Stats como fuente única. O diferenciarlos.

### [P1] Texto funcional de 8–11 px (20 instancias)
**Qué:** "Timbre Electrónico SII" a 8 px, pasos del pipeline a 9 px, "Folio: N° 41029" a 10 px, "-20%" a 10 px, "Recomendado" a 10 px.
**Por qué importa:** Por debajo del piso de 11 px. En pantallas de laptop se ve diminuto; en móvil es ilegible.
**Fix:** Subir a 11–12 px mínimo. El pipeline es el elemento estrella — su texto debe leerse.

### [P1] Placeholders del formulario a 3,0:1 de contraste
**Qué:** `placeholder-iron` (#8A8E9C) sobre `bg-cloud` (#F4F5F7) = 3,0:1. Necesita 4,5:1.
**Por qué importa:** El placeholder es la guía del campo. A 3:1 es casi invisible para visión reducida.
**Fix:** `placeholder-iron` → `placeholder-slate-text` (#4A4D58, 7,9:1).

### [P2] Logo del navbar con gradiente arcoíris
**Qué:** `bg-gradient-to-br from-[#FFA500] via-[#33dbdb] via-[#33d58e] via-[#F5C518] via-[#fc527d] to-[#FFA500]`.
**Por qué importa:** El detector lo marcó como `ai-color-palette`. Para un ERP financiero/compliance, proyecta juego, no confianza.
**Fix:** Sólido `bg-sunshine` con el rayo en `text-ink` (como ya hace el footer).

### [P2] Respuestas del FAQ demasiado largas (~93–100 chars/linea)
**Qué:** 4 respuestas superan los 80 chars por línea.
**Por qué importa:** Medida ideal 65–75 ch. Fatiga de lectura.
**Fix:** Recortar las 4 respuestas más largas.

### [P2] `focus:outline-none` en los botones de pasos del pipeline
**Qué:** Elimina el indicador de foco de teclado (WCAG 2.4.7).
**Fix:** Quitarlo o reemplazarlo por un `focus-visible` con anillo visible.

### [P2] La respuesta de "¿Puedo probarlo sin tarjeta?" es una barrera de conversión
**Qué:** "Contáctanos para acceder a todos los módulos del plan Professional."
**Por qué importa:** El usuario pregunta "¿puedo probarlo?" y la respuesta es "contáctanos". En una landing Persuade esto reemplaza un trial self-serve con una conversación de ventas.
**Fix:** Si existe trial, enlazarlo. Si no, reformular. (Decisión de producto, no de diseño.)

### [P2] "Agendar Demo" y el newsletter son enlaces `mailto:`
**Qué:** `mailto:hola@yellow-erp.cl` y `mailto:newsletter@yellow-erp.cl`.
**Por qué importa:** Abren el cliente de correo — un callejón sin salida para agendar.
**Fix:** Enlace a Calendly/Cal.com o página de agendamiento; formulario de suscripción real.

## Persona Red Flags

**Jordan (primerizo confundido):** ve el pipeline auto-avanzar y no entiende "Borrador" antes de que desaparezca; lee "Contabilidad calcula nómina" y piensa "¿estos entienden mi negocio?"; ve ".000 CLP" y se va.

**Riley (testeador deliberado):** el toggle de precios puede divergir entre estado interno y padre; el error de mensaje no indica qué campo; el enlace "Art. 41 ter" apunta a `https://www.hacienda.gov.ley/...` — `.gov.ley` no es un TLD válido, el enlace está roto; el "Timbre Electrónico SII" no es interactivo.

**Casey (móvil distraído):** los botones de pasos del pipeline miden 32 px (mínimo 44 px); el menú móvil puede recortar el CTA; el formulario no tiene `inputMode`/`enterkeyhint`.

## Minor Observations

- `ComplianceCard` "Condominio Ley 21.442" es irrelevante para PyMEs — hueco desperdiciado.
- "Comparado con ERP tradicional: -70% costo" sin fuente.
- "12k+ Usuarios diarios" es ambiguo (¿DAU o registrados?).
- El honeypot usa `className="hidden"` (`display:none`) — mejor `sr-only` o `position:absolute; left:-9999px`.
- Los campos del formulario siguen editables durante el envío (race condition).

## Questions to Consider

1. Si el pipeline DTE es la propuesta de valor central, ¿por qué auto-avanza sin control? Un evaluador deliberado quiere hacer clic a su ritmo. ¿Y si fuera manual con auto-play opcional?
2. ¿Por qué no hay trial self-serve? Todos los competidores (SAP, Oracle, Odoo, Defontana) ofrecen prueba gratis. Sin ella, la landing genera leads pero no conversiones.
3. ¿Las grids de módulos y features (8 + 6 tarjetas idénticas) podrían fusionarse en un mapa interactivo de módulos? Reforzaría la propuesta "ERP integrado" y reduciría la carga cognitiva.

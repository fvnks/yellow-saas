// Codemod: violeta de marca -> paleta amarilla sunshine (#F5C518)
// Uso: node scripts/tmp-palette-codemod.js [--dry]
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry');
const ROOTS = ['apps/web/src', 'packages/ui/src', 'src'];
const SKIP = ['globals.css', 'tailwind.config.js'];

// utility -> token destino (elige el tono correcto según rol)
const RULES = [
  // fondos / rellenos / degradados -> amarillo brillante
  { re: /\b(bg|from|via|to|shadow|fill|stroke|outline|accent|divide)-monday-violet\b/g, to: '$1-sunshine' },
  // bordes y anillos -> dorado oscuro (contraste 3.25:1 sobre blanco)
  { re: /\b(border(-[lrtbxy])?|ring(-offset)?)-monday-violet\b/g, to: '$1$2$3-sunshine-dark' },
  // texto y decoración -> dorado profundo (5.5:1 sobre blanco)
  { re: /\b(text|decoration)-monday-violet\b/g, to: '$1-sunshine-ink' },
];

const HEX = [
  [/#6161ff/gi, '#D4A017', 'violeta -> dorado (gráficos/marcadores)'],
  [/#5252e6/gi, '#B8860B', 'violeta hover -> dorado'],
  [/#8181ff/gi, '#FFA500', 'prism -> oro (gradiente logo)'],
  [/#7c3aed/gi, '#8A6100', 'púrpura -> dorado profundo'],
  [/#9333ea/gi, '#8A6100', 'púrpura -> dorado profundo'],
  [/#9450fd/gi, '#D4A017', 'ultra-violeta -> dorado'],
  [/#ccccff/gi, '#FFE08A', 'periwinkle -> crema'],
  [/#b8b8ff/gi, '#FFE9A3', 'lavender hex -> crema'],
];

const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx|ts|jsx|js|css)$/.test(e.name) && !SKIP.includes(e.name)) files.push(p);
  }
}
ROOTS.forEach(walk);

let totalClass = 0, totalHex = 0;
const changed = [];
const hexLog = [];
const restos = new Map(); // file -> lineas que aún mencionan monday-violet

for (const f of files) {
  const before = fs.readFileSync(f, 'utf8');
  let out = before;

  for (const { re, to } of RULES) {
    out = out.replace(re, (m, ...args) => {
      totalClass++;
      return to.replace(/\$(\d)/g, (_, d) => (args[+d - 1] ?? ''));
    });
  }

  const lines = out.split('\n');
  for (const [re, rep, why] of HEX) {
    out = out.replace(re, (m, offset) => {
      totalHex++;
      const line = out.slice(0, offset).split('\n').length;
      hexLog.push(`  ${f}:${line}  ${m} -> ${rep}  (${why})`);
      return rep;
    });
  }
  void lines;

  // restos en memoria (antes de escribir)
  const left = out.match(/^[^\n]*monday-violet[^\n]*$/gm);
  if (left) restos.set(f, left.slice(0, 4));

  if (out !== before) {
    changed.push(f);
    if (!DRY) fs.writeFileSync(f, out);
  }
}

console.log(`\nArchivos escaneados: ${files.length}`);
console.log(`Clases renombradas : ${totalClass}`);
console.log(`Hex reemplazados   : ${totalHex}`);
console.log(`Archivos modificados: ${changed.length}`);
console.log(`\n=== HEX por archivo ===`);
hexLog.forEach(l => console.log(l));
console.log(`\n=== Restos de "monday-violet" tras el codemod ===`);
let nRestos = 0;
for (const [f, lines] of restos) {
  lines.forEach(x => { nRestos++; console.log(`  ${f}: ${x.trim().slice(0, 130)}`); });
}
if (nRestos === 0) console.log('  (ninguno)');
console.log(DRY ? '\n[DRY RUN] no se escribió nada' : '\n[APLICADO]');

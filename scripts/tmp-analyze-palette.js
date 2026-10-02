// Análisis previo al re-mapeo violeta -> amarillo (uso puntual, se borra después)
const fs = require('fs');
const path = require('path');

const ROOTS = ['apps/web/src', 'packages/ui/src', 'src'];
const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx|ts|jsx|js|css)$/.test(e.name)) files.push(p);
  }
}
ROOTS.forEach(r => walk(r));

const buckets = {
  textOnDark: [],        // text-monday-violet con fondo oscuro cerca
  textOnLight: [],       // text-monday-violet sin fondo oscuro
  whiteOnViolet: [],     // bg ... text-white en el mismo className
  whiteChildOfViolet: [],// <tag bg-monday-violet ...> ... text-white
  dynamicClass: [],      // construccion dinamica bg-${...}
  purpleHex: {},         // hex por archivo
  otherVioletRefs: [],   // monday-violet fuera de className
};

const DARK = /bg-(ink|\[#[0-9a-fA-F]{6}\]|black|slate-9|gray-9)/;
const PURPLE_HEX = /#(6161ff|5252e6|8181ff|7c3aed|9333ea|9450fd|ccccff|b8b8ff)/i;

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const lines = src.split('\n');

  // 1) classNames con text-monday-violet: ¿hay fondo oscuro en el mismo className?
  lines.forEach((ln, i) => {
    const m = ln.match(/className=\{?[`"']([^`"']*)[`"']/g) || [];
    for (const cls of m) {
      if (!/text-monday-violet/.test(cls)) continue;
      (DARK.test(cls) ? buckets.textOnDark : buckets.textOnLight)
        .push(`${f}:${i + 1}  ${cls.slice(0, 150)}`);
    }
    if (/bg-monday-violet[^"'`]*text-white|text-white[^"'`]*bg-monday-violet/.test(ln))
      buckets.whiteOnViolet.push(`${f}:${i + 1}`);
    if (/bg-\$\{|text-\$\{|`bg-\{|`text-\{/.test(ln))
      buckets.dynamicClass.push(`${f}:${i + 1}  ${ln.trim().slice(0, 140)}`);
    const hexes = ln.match(/#(6161ff|5252e6|8181ff|7c3aed|9333ea|9450fd)/ig);
    if (hexes) buckets.purpleHex[f] = (buckets.purpleHex[f] || []).concat(hexes);
    if (/monday-violet/.test(ln) && !/className/.test(ln))
      buckets.otherVioletRefs.push(`${f}:${i + 1}  ${ln.trim().slice(0, 140)}`);
  });

  // 2) hijos con text-white bajo un ancestro bg-monday-violet (patrón multi-línea)
  const re = /<([A-Za-z][\w.]*)\b[^>]*className=\{?[`"']([^`"']*bg-monday-violet[^`"']*)[`"'][^>]*>/g;
  let m;
  while ((m = re.exec(src))) {
    const after = src.slice(m.index, m.index + 1500);
    if (/text-white/.test(after.split('</' + m[1] + '>')[0] || ''))
      buckets.whiteChildOfViolet.push(`${f}  <${m[1]}>  ${m[2].slice(0, 110)}`);
  }
}

const show = (title, arr, n = 12) => {
  console.log(`\n=== ${title} (${arr.length}) ===`);
  arr.slice(0, n).forEach(x => console.log('  ' + x));
};
show('text-monday-violet con FONDO OSCURO en el mismo className', buckets.textOnDark, 15);
show('text-monday-violet sin fondo oscuro (fondo claro)', buckets.textOnLight, 8);
show('bg + text-white en el MISMO className', buckets.whiteOnViolet, 10);
show('text-white en HIJO de bg-monday-violet', buckets.whiteChildOfViolet, 12);
show('clases DINÁMICAS con violeta', buckets.dynamicClass, 12);
show('monday-violet fuera de className', buckets.otherVioletRefs, 15);
console.log('\n=== HEX PÚRPURA POR ARCHIVO ===');
for (const [f, h] of Object.entries(buckets.purpleHex)) {
  const c = {};
  h.forEach(x => { const k = x.toLowerCase(); c[k] = (c[k] || 0) + 1; });
  console.log('  ' + f + ' -> ' + JSON.stringify(c));
}
console.log(`\nArchivos escaneados: ${files.length}`);

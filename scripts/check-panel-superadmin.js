// Diagnóstico: verifica que GET /api/super-admin/companies devuelva las empresas.
// Firma un JWT de prueba con el JWT_SECRET local (solo lectura, no modifica datos).
const fs = require('fs');
const path = require('path');
const { SignJWT } = require('jose');

const envPath = path.join(__dirname, '../apps/web/.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
}

const secret = new TextEncoder().encode(env.JWT_SECRET);

(async () => {
  const token = await new SignJWT({
    id: '5b2d26bf-46c6-4f4d-ac07-e502f06c3c52',
    email: 'superadmin@yellow.cl',
    name: 'Super Administrador',
    role_type: 'super_admin',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);

  const base = process.env.BASE_URL || 'http://localhost:3000';

  for (const p of ['/api/super-admin/companies', '/api/super-admin/metrics']) {
    try {
      const res = await fetch(base + p, { headers: { Authorization: 'Bearer ' + token } });
      const body = await res.text();
      let info = body.slice(0, 300);
      try {
        const j = JSON.parse(body);
        if (Array.isArray(j.data)) info = 'OK data[] length=' + j.data.length + '  names=' + j.data.map((d) => d.name).join(' | ');
        else info = 'OK keys=' + Object.keys(j).join(',') + '  ' + JSON.stringify(j.data || j).slice(0, 250);
      } catch {}
      console.log('GET ' + p + ' -> ' + res.status + '\n   ' + info + '\n');
    } catch (e) {
      console.log('GET ' + p + ' -> error ' + e.message + '\n');
    }
  }

  // Sin token: ¿qué ve un usuario no superadmin?
  const anon = await fetch(base + '/api/super-admin/companies');
  console.log('GET /api/super-admin/companies sin token -> ' + anon.status + ' ' + (await anon.text()).slice(0, 160));
})();

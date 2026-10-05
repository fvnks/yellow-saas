// Verificación end-to-end de POST /api/super-admin/companies (crea y borra una
// empresa de prueba). Firma un JWT con el JWT_SECRET local.
const fs = require('fs');
const path = require('path');
const { SignJWT } = require('jose');
const { Pool } = require('pg');

const envPath = path.join(__dirname, '../apps/web/.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
}

const SLUG = 'test-clasificacion-tmp';
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const pool = new Pool({ connectionString: env.DATABASE_URL, ssl: false, connectionTimeoutMillis: 15000 });

async function cleanup(slug) {
  const ids = (await pool.query(`SELECT id FROM companies WHERE slug = $1`, [slug])).rows.map((r) => r.id);
  if (ids.length === 0) return 0;
  await pool.query(
    `DELETE FROM user_roles WHERE role_id IN (SELECT id FROM roles WHERE company_id = ANY($1))`, [ids]);
  await pool.query(`DELETE FROM roles WHERE company_id = ANY($1)`, [ids]);
  await pool.query(`DELETE FROM module_activations WHERE company_id = ANY($1)`, [ids]);
  await pool.query(`DELETE FROM user_companies WHERE company_id = ANY($1)`, [ids]).catch(() => {});
  await pool.query(`DELETE FROM profiles WHERE company_id = ANY($1)`, [ids]);
  const r = await pool.query(`DELETE FROM companies WHERE id = ANY($1) RETURNING name`, [ids]);
  return r.rows.length;
}

(async () => {
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const token = await new SignJWT({
    id: '5b2d26bf-46c6-4f4d-ac07-e502f06c3c52',
    email: 'superadmin@yellow.cl',
    name: 'Super Administrador',
    role_type: 'super_admin',
  }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('1h').sign(secret);

  const auth = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token };

  try {
    console.log('--- 1. Validacion: company_type invalido ---');
    let res = await fetch(BASE + '/api/super-admin/companies', {
      method: 'POST', headers: auth,
      body: JSON.stringify({ name: 'X', slug: 'x-invalido-tmp', email: 'x@x.cl', password: '12345678', company_type: 'gimnasio' }),
    });
    console.log('   ' + res.status + ' ' + (await res.text()).slice(0, 160));

    console.log('\n--- 2. Crear colegio ---');
    res = await fetch(BASE + '/api/super-admin/companies', {
      method: 'POST', headers: auth,
      body: JSON.stringify({
        name: 'Colegio De Prueba', slug: SLUG, email: 'admin@prueba.cl', password: '12345678',
        plan: 'starter', company_type: 'colegio', modules: ['mi-cuenta', 'educacion'],
      }),
    });
    const created = await res.json();
    console.log('   ' + res.status + ' success=' + created.success +
      '  company_type=' + (created.data?.company?.company_type) + '  vertical=' + (created.data?.company?.vertical) +
      '  modules=' + JSON.stringify(created.data?.modules));
    if (!created.success) console.log('   detalle: ' + JSON.stringify(created.error));

    console.log('\n--- 3. GET lista (incluye campos nuevos) ---');
    res = await fetch(BASE + '/api/super-admin/companies', { headers: auth });
    const list = await res.json();
    const found = (list.data || []).find((c) => c.slug === SLUG);
    console.log('   ' + res.status + ' total=' + (list.data || []).length);
    if (found) console.log('   creado: ' + found.name + '  type=' + found.company_type + '  vertical=' + found.vertical + '  users=' + found.user_count);
    const colegios = (list.data || []).filter((c) => c.company_type === 'colegio');
    console.log('   colegios en la lista: ' + colegios.map((c) => c.name).join(', '));

    console.log('\n--- 4. Crear empresa con rubro restaurante ---');
    res = await fetch(BASE + '/api/super-admin/companies', {
      method: 'POST', headers: auth,
      body: JSON.stringify({
        name: 'Resto De Prueba', slug: 'test-resto-tmp', email: 'resto@prueba.cl', password: '12345678',
        company_type: 'empresa', vertical: 'restaurante', modules: ['mi-cuenta', 'restaurant'],
      }),
    });
    const resto = await res.json();
    console.log('   ' + res.status + ' type=' + (resto.data?.company?.company_type) + '  vertical=' + (resto.data?.company?.vertical));

    console.log('\n--- 5. Limpieza ---');
    const a = await cleanup('test-resto-tmp');
    const b = await cleanup(SLUG);
    console.log('   borradas: ' + [a, b].reduce((s, n) => s + n, 0));

    const restantes = await pool.query(`SELECT COUNT(*)::int AS n FROM companies`);
    console.log('   empresas restantes: ' + restantes.rows[0].n + ' (esperado 9)');
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await pool.end().catch(() => {});
    process.exit(0);
  }
})();

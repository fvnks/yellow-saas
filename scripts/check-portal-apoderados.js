// Diagnóstico del portal de apoderados: duplicados, emails y tipo de contraseña.
// Lee DATABASE_URL de apps/web/.env.local (nunca hardcodea credenciales).
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../apps/web/.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
  });
}

if (!process.env.DATABASE_URL) {
  console.error('FALTA DATABASE_URL en apps/web/.env.local');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false, connectionTimeoutMillis: 15000 });

(async () => {
  try {
    const counts = await pool.query(`
      SELECT (SELECT count(*) FROM educacion_apoderados) AS apoderados,
             (SELECT count(*) FROM educacion_estudiante_apoderado) AS vinculos,
             (SELECT count(*) FROM educacion_estudiantes) AS estudiantes
    `);
    console.log('conteos:', counts.rows[0]);

    const dupLinks = await pool.query(`
      SELECT estudiante_id, e.rut, e.nombres, e.apellido_paterno, count(*) AS total,
             array_agg(a.email) AS emails
      FROM educacion_estudiante_apoderado ea
      JOIN educacion_estudiantes e ON e.id = ea.estudiante_id
      JOIN educacion_apoderados a ON a.id = ea.apoderado_id
      GROUP BY estudiante_id, e.rut, e.nombres, e.apellido_paterno
      HAVING count(*) > 1
    `);
    console.log('\nestudiantes con MAS de un apoderado (bloquean el indice unico): ' + dupLinks.rows.length);
    dupLinks.rows.forEach((r) =>
      console.log('  ' + r.rut + ' ' + r.nombres + ' ' + r.apellido_paterno + ' -> ' + r.total + ' apoderados: ' + (r.emails || []).join(', '))
    );

    const dupEmails = await pool.query(`
      SELECT lower(email) AS email, count(*) AS total
      FROM educacion_apoderados
      WHERE email IS NOT NULL AND email <> ''
      GROUP BY lower(email) HAVING count(*) > 1
    `);
    console.log('\nemails de apoderado repetidos: ' + dupEmails.rows.length);
    dupEmails.rows.forEach((r) => console.log('  ' + r.email + ' x' + r.total));

    const sinPassword = await pool.query(
      `SELECT count(*) AS n FROM educacion_apoderados WHERE password IS NULL OR password = ''`
    );
    const bcrypt = await pool.query(
      `SELECT count(*) AS n FROM educacion_apoderados WHERE password LIKE '$2%'`
    );
    const total = await pool.query(`SELECT count(*) AS n FROM educacion_apoderados`);
    console.log('\ncontrasenas: total=' + total.rows[0].n +
      ' bcrypt=' + bcrypt.rows[0].n +
      ' sin_contrasena=' + sinPassword.rows[0].n +
      ' texto_plano=' + (Number(total.rows[0].n) - Number(bcrypt.rows[0].n) - Number(sinPassword.rows[0].n)));

    const sinVinculo = await pool.query(`
      SELECT count(*) AS n FROM educacion_apoderados a
      WHERE NOT EXISTS (SELECT 1 FROM educacion_estudiante_apoderado ea WHERE ea.apoderado_id = a.id)
    `);
    const alumnosSinApoderado = await pool.query(`
      SELECT count(*) AS n FROM educacion_estudiantes e
      WHERE NOT EXISTS (SELECT 1 FROM educacion_estudiante_apoderado ea WHERE ea.estudiante_id = e.id)
    `);
    console.log('\napoderados sin hijos: ' + sinVinculo.rows[0].n +
      '  |  estudiantes sin apoderado: ' + alumnosSinApoderado.rows[0].n);

    const muestra = await pool.query(`
      SELECT a.email, e.rut AS hijo_rut, e.fecha_nacimiento, ea.tipo
      FROM educacion_apoderados a
      LEFT JOIN educacion_estudiante_apoderado ea ON ea.apoderado_id = a.id
      LEFT JOIN educacion_estudiantes e ON e.id = ea.estudiante_id
      LIMIT 6
    `);
    console.log('\nmuestra:');
    muestra.rows.forEach((r) => console.log('  ' + r.email + ' -> hijo ' + (r.hijo_rut || '(sin hijo)') +
      (r.fecha_nacimiento ? ' nac=' + String(r.fecha_nacimiento).slice(0, 10) : '') + (r.tipo ? ' tipo=' + r.tipo : '')));

    const rut = await pool.query(`
      SELECT rut, fecha_nacimiento::text AS fn, nombres, apellido_paterno FROM educacion_estudiantes ORDER BY rut
    `);
    console.log('\nestudiantes (rut | fecha_nacimiento):');
    rut.rows.forEach((r) => console.log('  ' + String(r.rut).padEnd(14) + ' | ' +
      (r.fn ? r.fn.slice(0, 10) : '(sin fecha)') + ' | ' + r.nombres + ' ' + r.apellido_paterno));

    const rutApo = await pool.query(`SELECT rut, email FROM educacion_apoderados ORDER BY rut LIMIT 12`);
    console.log('\napoderados (rut | email):');
    rutApo.rows.forEach((r) => console.log('  ' + String(r.rut).padEnd(14) + ' | ' + r.email));
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();

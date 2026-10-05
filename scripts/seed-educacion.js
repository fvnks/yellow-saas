const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Carga DATABASE_URL desde apps/web/.env.local (patrón del resto del repo)
const envPath = path.join(__dirname, '../apps/web/.env.local');
if (fs.existsSync(envPath)) {
  const envVars = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) acc[match[1].trim()] = match[2].trim();
    return acc;
  }, {});
  if (envVars.DATABASE_URL) process.env.DATABASE_URL = envVars.DATABASE_URL;
}

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL no está definida (apps/web/.env.local).');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  connectionTimeoutMillis: 15000,
});

// Datos de ejemplo
const cursos = [
  { nombre: '1° Básico A', nivel: 'basica', jornada: 'completa', anio_lectivo: 2026, cupo_maximo: 30, sala: 'Sala 101' },
  { nombre: '1° Básico B', nivel: 'basica', jornada: 'completa', anio_lectivo: 2026, cupo_maximo: 30, sala: 'Sala 102' },
  { nombre: '2° Básico A', nivel: 'basica', jornada: 'completa', anio_lectivo: 2026, cupo_maximo: 30, sala: 'Sala 103' },
  { nombre: '3° Básico A', nivel: 'basica', jornada: 'completa', anio_lectivo: 2026, cupo_maximo: 30, sala: 'Sala 104' },
  { nombre: '4° Medio A', nivel: 'media', jornada: 'completa', anio_lectivo: 2026, cupo_maximo: 35, sala: 'Sala 201' },
  { nombre: '4° Medio B', nivel: 'media', jornada: 'completa', anio_lectivo: 2026, cupo_maximo: 35, sala: 'Sala 202' },
];

const profesores = [
  { rut: '12345678-9', nombres: 'María', apellido_paterno: 'González', apellido_materno: 'López', email: 'maria.gonzalez@colegio.cl', telefono: '+56 9 1234 5678', especialidad: 'Matemáticas', titulo: 'Profesora de Matemáticas', fecha_ingreso: '2020-03-01' },
  { rut: '23456789-0', nombres: 'Carlos', apellido_paterno: 'Rodríguez', apellido_materno: 'Pérez', email: 'carlos.rodriguez@colegio.cl', telefono: '+56 9 2345 6789', especialidad: 'Lenguaje', titulo: 'Profesor de Lenguaje', fecha_ingreso: '2019-03-01' },
  { rut: '34567890-1', nombres: 'Ana', apellido_paterno: 'Martínez', apellido_materno: 'Sánchez', email: 'ana.martinez@colegio.cl', telefono: '+56 9 3456 7890', especialidad: 'Ciencias', titulo: 'Profesora de Ciencias', fecha_ingreso: '2021-03-01' },
  { rut: '45678901-2', nombres: 'Pedro', apellido_paterno: 'López', apellido_materno: 'García', email: 'pedro.lopez@colegio.cl', telefono: '+56 9 4567 8901', especialidad: 'Historia', titulo: 'Profesor de Historia', fecha_ingreso: '2018-03-01' },
  { rut: '56789012-3', nombres: 'Laura', apellido_paterno: 'Fernández', apellido_materno: 'Ruiz', email: 'laura.fernandez@colegio.cl', telefono: '+56 9 5678 9012', especialidad: 'Inglés', titulo: 'Profesora de Inglés', fecha_ingreso: '2022-03-01' },
];

const asignaturas = [
  { codigo: 'MAT', nombre: 'Matemáticas', nivel: 'basica', horas_semanales: 6 },
  { codigo: 'LEN', nombre: 'Lenguaje', nivel: 'basica', horas_semanales: 6 },
  { codigo: 'CIE', nombre: 'Ciencias', nivel: 'basica', horas_semanales: 4 },
  { codigo: 'HIS', nombre: 'Historia', nivel: 'basica', horas_semanales: 3 },
  { codigo: 'ING', nombre: 'Inglés', nivel: 'basica', horas_semanales: 3 },
  { codigo: 'EDF', nombre: 'Educación Física', nivel: 'basica', horas_semanales: 2 },
  { codigo: 'ART', nombre: 'Artes', nivel: 'basica', horas_semanales: 2 },
  { codigo: 'MUS', nombre: 'Música', nivel: 'basica', horas_semanales: 2 },
];

const estudiantes = [
  { rut: '11111111-1', nombres: 'Juan', apellido_paterno: 'Pérez', apellido_materno: 'González', fecha_nacimiento: '2015-03-15', genero: 'masculino', direccion: 'Av. Principal 123', telefono: '+56 9 1111 1111', email: 'juan.perez@email.com', curso_id: 1 },
  { rut: '22222222-2', nombres: 'María', apellido_paterno: 'Rodríguez', apellido_materno: 'López', fecha_nacimiento: '2015-04-20', genero: 'femenino', direccion: 'Av. Secundaria 456', telefono: '+56 9 2222 2222', email: 'maria.rodriguez@email.com', curso_id: 1 },
  { rut: '33333333-3', nombres: 'Carlos', apellido_paterno: 'Martínez', apellido_materno: 'Pérez', fecha_nacimiento: '2015-05-10', genero: 'masculino', direccion: 'Av. Terciaria 789', telefono: '+56 9 3333 3333', email: 'carlos.martinez@email.com', curso_id: 2 },
  { rut: '44444444-4', nombres: 'Ana', apellido_paterno: 'López', apellido_materno: 'Sánchez', fecha_nacimiento: '2015-06-25', genero: 'femenino', direccion: 'Av. Cuaternaria 321', telefono: '+56 9 4444 4444', email: 'ana.lopez@email.com', curso_id: 2 },
  { rut: '55555555-5', nombres: 'Pedro', apellido_paterno: 'García', apellido_materno: 'Ruiz', fecha_nacimiento: '2014-07-30', genero: 'masculino', direccion: 'Av. Quinaria 654', telefono: '+56 9 5555 5555', email: 'pedro.garcia@email.com', curso_id: 3 },
  { rut: '66666666-6', nombres: 'Laura', apellido_paterno: 'Fernández', apellido_materno: 'Gómez', fecha_nacimiento: '2014-08-15', genero: 'femenino', direccion: 'Av. Senaria 987', telefono: '+56 9 6666 6666', email: 'laura.fernandez@email.com', curso_id: 3 },
  { rut: '77777777-7', nombres: 'Diego', apellido_paterno: 'Sánchez', apellido_materno: 'Martínez', fecha_nacimiento: '2013-09-05', genero: 'masculino', direccion: 'Av. Septenaria 147', telefono: '+56 9 7777 7777', email: 'diego.sanchez@email.com', curso_id: 4 },
  { rut: '88888888-8', nombres: 'Sofía', apellido_paterno: 'Ruiz', apellido_materno: 'López', fecha_nacimiento: '2013-10-12', genero: 'femenino', direccion: 'Av. Octenaria 258', telefono: '+56 9 8888 8888', email: 'sofia.ruiz@email.com', curso_id: 4 },
  { rut: '99999999-9', nombres: 'Matías', apellido_paterno: 'Gómez', apellido_materno: 'Pérez', fecha_nacimiento: '2012-11-18', genero: 'masculino', direccion: 'Av. Novenaria 369', telefono: '+56 9 9999 9999', email: 'matias.gomez@email.com', curso_id: 5 },
  { rut: '10101010-0', nombres: 'Valentina', apellido_paterno: 'Martínez', apellido_materno: 'González', fecha_nacimiento: '2012-12-22', genero: 'femenino', direccion: 'Av. Decenaria 741', telefono: '+56 9 1010 1010', email: 'valentina.martinez@email.com', curso_id: 5 },
];

const apoderados = [
  { rut: '11111111-1', nombres: 'Juan', apellido_paterno: 'Pérez', apellido_materno: 'González', telefono: '+56 9 1111 1111', email: 'juan.perez@email.com', direccion: 'Av. Principal 123', ocupacion: 'Ingeniero' },
  { rut: '22222222-2', nombres: 'María', apellido_paterno: 'Rodríguez', apellido_materno: 'López', telefono: '+56 9 2222 2222', email: 'maria.rodriguez@email.com', direccion: 'Av. Secundaria 456', ocupacion: 'Profesora' },
  { rut: '33333333-3', nombres: 'Carlos', apellido_paterno: 'Martínez', apellido_materno: 'Pérez', telefono: '+56 9 3333 3333', email: 'carlos.martinez@email.com', direccion: 'Av. Terciaria 789', ocupacion: 'Médico' },
  { rut: '44444444-4', nombres: 'Ana', apellido_paterno: 'López', apellido_materno: 'Sánchez', telefono: '+56 9 4444 4444', email: 'ana.lopez@email.com', direccion: 'Av. Cuaternaria 321', ocupacion: 'Abogada' },
  { rut: '55555555-5', nombres: 'Pedro', apellido_paterno: 'García', apellido_materno: 'Ruiz', telefono: '+56 9 5555 5555', email: 'pedro.garcia@email.com', direccion: 'Av. Quinaria 654', ocupacion: 'Comerciante' },
  { rut: '66666666-6', nombres: 'Laura', apellido_paterno: 'Fernández', apellido_materno: 'Gómez', telefono: '+56 9 6666 6666', email: 'laura.fernandez@email.com', direccion: 'Av. Senaria 987', ocupacion: 'Arquitecta' },
  { rut: '77777777-7', nombres: 'Diego', apellido_paterno: 'Sánchez', apellido_materno: 'Martínez', telefono: '+56 9 7777 7777', email: 'diego.sanchez@email.com', direccion: 'Av. Septenaria 147', ocupacion: 'Ingeniero' },
  { rut: '88888888-8', nombres: 'Sofía', apellido_paterno: 'Ruiz', apellido_materno: 'López', telefono: '+56 9 8888 8888', email: 'sofia.ruiz@email.com', direccion: 'Av. Octenaria 258', ocupacion: 'Diseñadora' },
  { rut: '99999999-9', nombres: 'Matías', apellido_paterno: 'Gómez', apellido_materno: 'Pérez', telefono: '+56 9 9999 9999', email: 'matias.gomez@email.com', direccion: 'Av. Novenaria 369', ocupacion: 'Contador' },
  { rut: '10101010-0', nombres: 'Valentina', apellido_paterno: 'Martínez', apellido_materno: 'González', telefono: '+56 9 1010 1010', email: 'valentina.martinez@email.com', direccion: 'Av. Decenaria 741', ocupacion: 'Periodista' },
];

async function seedEducacion() {
  let client;
  
  try {
    console.log('=== Seed de datos para el Módulo Educativo ===\n');
    console.log('Conectando a PostgreSQL...\n');
    
    client = await pool.connect();
    console.log('✓ Conexión exitosa!\n');
    
    // Obtener company_id (asumimos que existe al menos una empresa)
    const companyResult = await client.query('SELECT id FROM companies LIMIT 1');
    if (companyResult.rows.length === 0) {
      console.log('⚠️  No se encontraron empresas. Creando una empresa de ejemplo...');
      await client.query(`
        INSERT INTO companies (name, rut, email, phone, address, city, region, country, plan, is_active)
        VALUES ('Colegio San Andrés', '12345678-9', 'info@colegio.cl', '+56 2 2345 6789', 'Av. Principal 123', 'Santiago', 'Metropolitana', 'Chile', 'professional', true)
        RETURNING id
      `);
    }
    
    const companyId = companyResult.rows[0]?.id || (await client.query('SELECT id FROM companies LIMIT 1')).rows[0].id;
    console.log(`Usando company_id: ${companyId}\n`);
    
    // Insertar cursos
    console.log('Insertando cursos...');
    for (const curso of cursos) {
      await client.query(
        `INSERT INTO educacion_cursos (company_id, nombre, nivel, jornada, anio_lectivo, cupo_maximo, sala)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [companyId, curso.nombre, curso.nivel, curso.jornada, curso.anio_lectivo, curso.cupo_maximo, curso.sala]
      );
    }
    console.log(`  ✓ ${cursos.length} cursos insertados\n`);
    
    // Insertar profesores
    console.log('Insertando profesores...');
    for (const profesor of profesores) {
      await client.query(
        `INSERT INTO educacion_profesores (company_id, rut, nombres, apellido_paterno, apellido_materno, email, telefono, especialidad, titulo, fecha_ingreso)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (rut) DO NOTHING`,
        [companyId, profesor.rut, profesor.nombres, profesor.apellido_paterno, profesor.apellido_materno, profesor.email, profesor.telefono, profesor.especialidad, profesor.titulo, profesor.fecha_ingreso]
      );
    }
    console.log(`  ✓ ${profesores.length} profesores insertados\n`);
    
    // Insertar asignaturas
    console.log('Insertando asignaturas...');
    for (const asignatura of asignaturas) {
      await client.query(
        `INSERT INTO educacion_asignaturas (company_id, codigo, nombre, nivel, horas_semanales)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [companyId, asignatura.codigo, asignatura.nombre, asignatura.nivel, asignatura.horas_semanales]
      );
    }
    console.log(`  ✓ ${asignaturas.length} asignaturas insertadas\n`);
    
    // Obtener IDs de cursos para asignar a estudiantes
    const cursosResult = await client.query('SELECT id, nombre FROM educacion_cursos WHERE company_id = $1 ORDER BY nombre', [companyId]);
    const cursoIds = {};
    cursosResult.rows.forEach(row => {
      cursoIds[row.nombre] = row.id;
    });
    
    // Insertar estudiantes
    console.log('Insertando estudiantes...');
    for (const estudiante of estudiantes) {
      // Mapear índice de curso a nombre de curso
      const cursoNombres = ['1° Básico A', '1° Básico B', '2° Básico A', '3° Básico A', '4° Medio A', '4° Medio B'];
      const cursoNombre = cursoNombres[estudiante.curso_id - 1];
      const cursoId = cursoIds[cursoNombre];
      
      await client.query(
        `INSERT INTO educacion_estudiantes (company_id, rut, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, direccion, telefono, email, curso_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (rut) DO NOTHING`,
        [companyId, estudiante.rut, estudiante.nombres, estudiante.apellido_paterno, estudiante.apellido_materno, estudiante.fecha_nacimiento, estudiante.genero, estudiante.direccion, estudiante.telefono, estudiante.email, cursoId]
      );
    }
    console.log(`  ✓ ${estudiantes.length} estudiantes insertados\n`);
    
    // Insertar apoderados
    console.log('Insertando apoderados...');
    for (const apoderado of apoderados) {
      await client.query(
        `INSERT INTO educacion_apoderados (company_id, rut, nombres, apellido_paterno, apellido_materno, telefono, email, direccion, ocupacion)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (rut) DO NOTHING`,
        [companyId, apoderado.rut, apoderado.nombres, apoderado.apellido_paterno, apoderado.apellido_materno, apoderado.telefono, apoderado.email, apoderado.direccion, apoderado.ocupacion]
      );
    }
    console.log(`  ✓ ${apoderados.length} apoderados insertados\n`);
    
    // Insertar comunicados de ejemplo
    console.log('Insertando comunicados...');
    const comunicados = [
      { titulo: 'Reunión de Apoderados', contenido: 'Estimados apoderados, les informamos que el día viernes 15 de octubre se realizará la reunión de apoderados a las 18:00 hrs en la sala de clases.', tipo: 'general' },
      { titulo: 'Salida Pedagógica', contenido: 'Se informa que el día 20 de octubre los estudiantes realizarán una salida pedagógica al Museo Interactivo. Se requiere autorización de los apoderados.', tipo: 'general' },
      { titulo: 'Celebración del Día del Profesor', contenido: 'El próximo 16 de octubre celebraremos el Día del Profesor. Las actividades se realizarán durante la mañana.', tipo: 'general' },
    ];
    
    for (const comunicado of comunicados) {
      await client.query(
        `INSERT INTO educacion_comunicados (company_id, titulo, contenido, tipo)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [companyId, comunicado.titulo, comunicado.contenido, comunicado.tipo]
      );
    }
    console.log(`  ✓ ${comunicados.length} comunicados insertados\n`);
    
    // Insertar eventos de ejemplo
    console.log('Insertando eventos...');
    const eventos = [
      { titulo: 'Reunión de Apoderados', descripcion: 'Reunión mensual de apoderados', tipo: 'reunion', fecha_inicio: '2026-10-15 18:00:00', fecha_termino: '2026-10-15 20:00:00', ubicacion: 'Sala de clases' },
      { titulo: 'Salida Pedagógica', descripcion: 'Visita al Museo Interactivo', tipo: 'salida_pedagogica', fecha_inicio: '2026-10-20 09:00:00', fecha_termino: '2026-10-20 13:00:00', ubicacion: 'Museo Interactivo', requiere_autorizacion: true },
      { titulo: 'Celebración del Día del Profesor', descripcion: 'Actividades para celebrar el Día del Profesor', tipo: 'celebracion', fecha_inicio: '2026-10-16 10:00:00', fecha_termino: '2026-10-16 12:00:00', ubicacion: 'Patio central' },
    ];
    
    for (const evento of eventos) {
      await client.query(
        `INSERT INTO educacion_eventos (company_id, titulo, descripcion, tipo, fecha_inicio, fecha_termino, ubicacion, requiere_autorizacion)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [companyId, evento.titulo, evento.descripcion, evento.tipo, evento.fecha_inicio, evento.fecha_termino, evento.ubicacion, evento.requiere_autorizacion]
      );
    }
    console.log(`  ✓ ${eventos.length} eventos insertados\n`);
    
    // Verificar datos insertados
    console.log('Verificando datos insertados...\n');
    
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM educacion_cursos WHERE company_id = $1) as cursos,
        (SELECT COUNT(*) FROM educacion_profesores WHERE company_id = $1) as profesores,
        (SELECT COUNT(*) FROM educacion_asignaturas WHERE company_id = $1) as asignaturas,
        (SELECT COUNT(*) FROM educacion_estudiantes WHERE company_id = $1) as estudiantes,
        (SELECT COUNT(*) FROM educacion_apoderados WHERE company_id = $1) as apoderados,
        (SELECT COUNT(*) FROM educacion_comunicados WHERE company_id = $1) as comunicados,
        (SELECT COUNT(*) FROM educacion_eventos WHERE company_id = $1) as eventos
    `, [companyId]);
    
    const c = counts.rows[0];
    console.log('Datos insertados:');
    console.log(`  - Cursos: ${c.cursos}`);
    console.log(`  - Profesores: ${c.profesores}`);
    console.log(`  - Asignaturas: ${c.asignaturas}`);
    console.log(`  - Estudiantes: ${c.estudiantes}`);
    console.log(`  - Apoderados: ${c.apoderados}`);
    console.log(`  - Comunicados: ${c.comunicados}`);
    console.log(`  - Eventos: ${c.eventos}`);
    
    console.log('\n=== Seed Completado ===\n');
    
  } catch (error) {
    console.error('\n❌ Error durante el seed:', error.message);
    console.error('\nDetalles del error:');
    console.error('  Code:', error.code);
    console.error('  Detail:', error.detail);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

seedEducacion();

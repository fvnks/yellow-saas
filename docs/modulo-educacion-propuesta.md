# Propuesta: Módulo Educativo para Yellow ERP

## 1. Visión General

Módulo vertical para colegios, escuelas y jardines infantiles en Chile. Se integra con los módulos existentes (Ventas, Contabilidad, RRHH) y agrega funcionalidades específicas del sector educativo.

### Objetivo
Proporcionar una solución integral para la gestión administrativa, académica y financiera de instituciones educacionales chilenas, cumpliendo con los requisitos del Mineduc y SII.

---

## 2. Prioridades (MoSCoW)

### 🔴 MUST HAVE (Prioridad Crítica)

#### 2.1 Gestión de Estudiantes
- **Ficha del estudiante**: Datos personales, RUT, fecha nacimiento, dirección, contacto de emergencia
- **Apoderados**: Relación estudiante-apoderado, datos de contacto, autorizaciones
- **Matrículas**: Proceso de matrícula anual, traspaso entre cursos, bajas
- **Documentos**: Certificados de alumno regular, certificados de notas, constancias

#### 2.2 Gestión de Cursos y Profesores
- **Cursos**: Creación de cursos (básica, media, parvularia), asignación de profesores jefes
- **Profesores**: Ficha del docente, asignación de asignaturas y cursos
- **Asignaturas**: Catálogo de asignaturas por nivel, horas semanales
- **Horarios**: Generación de horarios por curso, asignación de salas

#### 2.3 Asistencia
- **Registro diario**: Asistencia por curso, por asignatura o día completo
- **Justificación**: Registro de justificaciones de inasistencia
- **Reportes**: Porcentaje de asistencia, alertas de inasistencia reiterada
- **Integración Mineduc**: Exportación de datos de asistencia para subvenciones

#### 2.4 Calificaciones y Evaluaciones
- **Libro de clases digital**: Registro de notas por asignatura y período
- **Períodos de evaluación**: Semestral o trimestral configurable
- **Tipos de evaluación**: Pruebas, trabajos, participaciones, etc.
- **Promedios**: Cálculo automático de promedios por asignatura y general
- **Anotaciones**: Registro de observaciones positivas/negativas

#### 2.5 Comunicación con Apoderados
- **Portal del apoderado**: Acceso web para ver notas, asistencia, comunicados
- **Comunicados**: Envío masivo de comunicados por curso o nivel
- **Notificaciones**: Alertas de inasistencia, notas bajas, eventos
- **Mensajería**: Comunicación bidireccional apoderado-colegio

#### 2.6 Facturación y Pagos
- **Pensiones**: Generación automática de pensiones mensuales
- **Convenios de pago**: Acuerdos de pago diferido o descuentos
- **DTE**: Emisión de boletas electrónicas (DTE 39) para pensiones y matrículas
- **Control de morosidad**: Alertas de pagos atrasados, reportes de deuda

### 🟡 SHOULD HAVE (Importante)

#### 2.7 Gestión Financiera Específica
- **Subvenciones**: Registro y control de subvenciones del Mineduc
- **Proyectos educativos**: Gestión de fondos para proyectos (PIE, SEP, etc.)
- **Presupuestos**: Control presupuestario por área
- **Aranceles**: Gestión de aranceles por nivel y curso

#### 2.8 Biblioteca
- **Catálogo**: Registro de libros y materiales
- **Préstamos**: Control de préstamo y devolución
- **Sanciones**: Multas por atraso o daño

#### 2.9 Admisión
- **Postulaciones**: Gestión de proceso de admisión
- **Entrevistas**: Registro de entrevistas con apoderados
- **Lista de espera**: Gestión de cupos disponibles
- **Documentación**: Control de documentos requeridos

#### 2.10 Eventos y Actividades
- **Calendario escolar**: Período de clases, vacaciones, feriados
- **Eventos**: Actividades extracurriculares, reuniones, celebraciones
- **Autorizaciones**: Control de salidas pedagógicas, paseos

### 🟢 COULD HAVE (Deseable)

#### 2.11 Transporte Escolar
- **Rutas**: Definición de rutas de transporte
- **Paraderos**: Registro de paraderos por ruta
- **Control**: Asistencia en transporte, comunicación con apoderados

#### 2.12 Casino/Comedor
- **Menús**: Planificación de menús semanales
- **Control de raciones**: Registro de raciones entregadas
- **Pagos**: Control de pagos de casino

#### 2.13 Psicología y Orientación
- **Ficha psicológica**: Seguimiento de casos
- **Intervenciones**: Registro de intervenciones individuales/grupales
- **Alertas**: Derivaciones a especialistas externos

#### 2.14 Alumni
- **Seguimiento**: Egresados, estudios superiores, trabajo
- **Red de contactos**: Comunidad de ex-alumnos
- **Estadísticas**: Seguimiento de inserción laboral/universitaria

### ⚪ WON'T HAVE (Por ahora)

- Gestión de infraestructura física (mantenimiento de edificios)
- E-learning / Plataforma de aprendizaje online (integración con terceros)
- Gestión de laboratorios especializados
- Sistema de votaciones para centros de alumnos

---

## 3. Arquitectura Técnica

### 3.1 Estructura de Carpetas (siguiendo patrones existentes)

```
apps/web/src/
├── app/
│   ├── api/
│   │   └── educacion/           # API Routes del módulo
│   │       ├── estudiantes/
│   │       ├── apoderados/
│   │       ├── cursos/
│   │       ├── profesores/
│   │       ├── asignaturas/
│   │       ├── asistencia/
│   │       ├── calificaciones/
│   │       ├── comunicados/
│   │       ├── pensiones/
│   │       ├── matriculas/
│   │       ├── eventos/
│   │       ├── biblioteca/
│   │       ├── admision/
│   │       ├── transporte/
│   │       ├── subvenciones/
│   │       └── reportes/
│   ├── educacion/               # UI del módulo
│   │   ├── estudiantes/
│   │   ├── apoderados/
│   │   ├── cursos/
│   │   ├── profesores/
│   │   ├── asistencia/
│   │   ├── calificaciones/
│   │   ├── comunicados/
│   │   ├── pensiones/
│   │   ├── matriculas/
│   │   ├── eventos/
│   │   ├── biblioteca/
│   │   ├── admision/
│   │   ├── transporte/
│   │   ├── subvenciones/
│   │   ├── reportes/
│   │   └── layout.tsx           # Layout con sidebar específico
│   └── portal-apoderado/        # Portal para apoderados
│       ├── [locale]/
│       │   ├── dashboard/
│       │   ├── notas/
│       │   ├── asistencia/
│       │   ├── comunicados/
│       │       ├── pagos/
│       │       └── perfil/
│       └── layout.tsx
├── components/
│   └── educacion/               # Componentes específicos
│       ├── StudentCard.tsx
│       ├── AttendanceGrid.tsx
│       ├── GradeBook.tsx
│       ├── ParentPortal.tsx
│       └── ...
├── lib/
│   └── educacion/               # Utilidades del módulo
│       ├── grade-calculator.ts
│       ├── attendance-export.ts
│       ├── dte-boleta.ts
│       └── ...
└── types/
    └── educacion.ts             # Tipos TypeScript

packages/db/supabase/migrations/
├── 0110_educacion_estudiantes.sql
├── 0111_educacion_apoderados.sql
├── 0112_educacion_cursos.sql
├── 0113_educacion_profesores.sql
├── 0114_educacion_asignaturas.sql
├── 0115_educacion_asistencia.sql
├── 0116_educacion_calificaciones.sql
├── 0117_educacion_comunicados.sql
├── 0118_educacion_pensiones.sql
├── 0119_educacion_matriculas.sql
├── 0120_educacion_eventos.sql
├── 0121_educacion_biblioteca.sql
├── 0122_educacion_admision.sql
├── 0123_educacion_transporte.sql
├── 0124_educacion_subvenciones.sql
└── 0125_educacion_anotaciones.sql
```

### 3.2 Modelo de Datos (Tablas Principales)

```sql
-- Estudiantes
CREATE TABLE educacion_estudiantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  rut VARCHAR(12) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  fecha_nacimiento DATE NOT NULL,
  genero VARCHAR(20),
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(255),
  curso_id UUID REFERENCES educacion_cursos(id),
  estado VARCHAR(20) DEFAULT 'activo', -- activo, retirado, suspendido
  fecha_ingreso DATE,
  fecha_retiro DATE,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Apoderados
CREATE TABLE educacion_apoderados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  rut VARCHAR(12) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(255),
  direccion TEXT,
  ocupacion VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Relación Estudiante-Apoderado
CREATE TABLE educacion_estudiante_apoderado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID NOT NULL REFERENCES educacion_estudiantes(id),
  apoderado_id UUID NOT NULL REFERENCES educacion_apoderados(id),
  tipo VARCHAR(50) NOT NULL, -- padre, madre, tutor, apoderado_suplente
  es_apoderado_principal BOOLEAN DEFAULT FALSE,
  autorizado_retiro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cursos
CREATE TABLE educacion_cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  nombre VARCHAR(100) NOT NULL, -- "1° Básico A", "4° Medio B"
  nivel VARCHAR(50) NOT NULL, -- parvularia, basica, media
  jornada VARCHAR(50), -- mañana, tarde, completa
  profesor_jefe_id UUID REFERENCES educacion_profesores(id),
  anio_lectivo INTEGER NOT NULL,
  cupo_maximo INTEGER,
  sala VARCHAR(50),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Profesores
CREATE TABLE educacion_profesores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  rut VARCHAR(12) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  email VARCHAR(255),
  telefono VARCHAR(20),
  especialidad VARCHAR(100),
  titulo VARCHAR(255),
  fecha_ingreso DATE,
  estado VARCHAR(20) DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Asignaturas
CREATE TABLE educacion_asignaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  codigo VARCHAR(20),
  nombre VARCHAR(100) NOT NULL,
  nivel VARCHAR(50),
  horas_semanales INTEGER,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Asignación de asignaturas a cursos
CREATE TABLE educacion_curso_asignatura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES educacion_cursos(id),
  asignatura_id UUID NOT NULL REFERENCES educacion_asignaturas(id),
  profesor_id UUID REFERENCES educacion_profesores(id),
  anio_lectivo INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Asistencia
CREATE TABLE educacion_asistencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  estudiante_id UUID NOT NULL REFERENCES educacion_estudiantes(id),
  curso_id UUID NOT NULL REFERENCES educacion_cursos(id),
  fecha DATE NOT NULL,
  estado VARCHAR(20) NOT NULL, -- presente, ausente, atrasado, justificado
  justificacion TEXT,
  justificado_por UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(estudiante_id, fecha)
);

-- Calificaciones
CREATE TABLE educacion_calificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  estudiante_id UUID NOT NULL REFERENCES educacion_estudiantes(id),
  curso_asignatura_id UUID NOT NULL REFERENCES educacion_curso_asignatura(id),
  periodo INTEGER NOT NULL, -- 1, 2, 3 (trimestres) o 1, 2 (semestres)
  anio_lectivo INTEGER NOT NULL,
  nota DECIMAL(3,1) NOT NULL,
  tipo_evaluacion VARCHAR(50), -- prueba, trabajo, participacion, examen
  descripcion TEXT,
  fecha_evaluacion DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(estudiante_id, curso_asignatura_id, periodo, tipo_evaluacion, descripcion)
);

-- Anotaciones (Libro de clases)
CREATE TABLE educacion_anotaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  estudiante_id UUID NOT NULL REFERENCES educacion_estudiantes(id),
  curso_id UUID NOT NULL REFERENCES educacion_cursos(id),
  fecha DATE NOT NULL,
  tipo VARCHAR(20) NOT NULL, -- positiva, negativa
  descripcion TEXT NOT NULL,
  registrada_por UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comunicados
CREATE TABLE educacion_comunicados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  titulo VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  tipo VARCHAR(50), -- general, por_curso, por_nivel
  curso_id UUID REFERENCES educacion_cursos(id),
  nivel VARCHAR(50),
  fecha_publicacion TIMESTAMP DEFAULT NOW(),
  publicado_por UUID REFERENCES users(id),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Matrículas
CREATE TABLE educacion_matriculas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  estudiante_id UUID NOT NULL REFERENCES educacion_estudiantes(id),
  curso_id UUID NOT NULL REFERENCES educacion_cursos(id),
  anio_lectivo INTEGER NOT NULL,
  fecha_matricula DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'vigente', -- vigente, cancelada, traspasada
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pensiones
CREATE TABLE educacion_pensiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  estudiante_id UUID NOT NULL REFERENCES educacion_estudiantes(id),
  mes INTEGER NOT NULL,
  anio INTEGER NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, pagada, vencida, anulada
  fecha_pago DATE,
  metodo_pago VARCHAR(50),
  dte_id UUID REFERENCES dtes(id), -- Integración con módulo DTE
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(estudiante_id, mes, anio)
);

-- Eventos
CREATE TABLE educacion_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50), -- reunion, celebracion, salida_pedagogica, otro
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_termino TIMESTAMP,
  curso_id UUID REFERENCES educacion_cursos(id),
  ubicacion VARCHAR(255),
  requiere_autorizacion BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Biblioteca
CREATE TABLE educacion_libros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  isbn VARCHAR(20),
  titulo VARCHAR(255) NOT NULL,
  autor VARCHAR(255),
  editorial VARCHAR(100),
  anio_publicacion INTEGER,
  cantidad_total INTEGER DEFAULT 1,
  cantidad_disponible INTEGER DEFAULT 1,
  ubicacion VARCHAR(100),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Préstamos de biblioteca
CREATE TABLE educacion_prestamos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  libro_id UUID NOT NULL REFERENCES educacion_libros(id),
  estudiante_id UUID REFERENCES educacion_estudiantes(id),
  profesor_id UUID REFERENCES educacion_profesores(id),
  fecha_prestamo DATE NOT NULL,
  fecha_devolucion_esperada DATE NOT NULL,
  fecha_devolucion_real DATE,
  estado VARCHAR(20) DEFAULT 'prestado', -- prestado, devuelto, atrasado, perdido
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Postulaciones (Admisión)
CREATE TABLE educacion_postulaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  estudiante_nombres VARCHAR(100) NOT NULL,
  estudiante_apellido_paterno VARCHAR(100) NOT NULL,
  estudiante_apellido_materno VARCHAR(100),
  estudiante_fecha_nacimiento DATE,
  apoderado_nombres VARCHAR(100),
  apoderado_apellido_paterno VARCHAR(100),
  apoderado_email VARCHAR(255),
  apoderado_telefono VARCHAR(20),
  nivel_postulacion VARCHAR(50),
  anio_postulacion INTEGER,
  estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, aceptada, rechazada, lista_espera
  fecha_postulacion DATE DEFAULT CURRENT_DATE,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transporte escolar
CREATE TABLE educacion_transporte_rutas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  nombre VARCHAR(100) NOT NULL,
  conductor VARCHAR(100),
  patente VARCHAR(20),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Paraderos
CREATE TABLE educacion_transporte_paraderos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruta_id UUID NOT NULL REFERENCES educacion_transporte_rutas(id),
  nombre VARCHAR(100) NOT NULL,
  direccion TEXT,
  hora_recogida TIME,
  orden INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Estudiantes en transporte
CREATE TABLE educacion_transporte_estudiantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID NOT NULL REFERENCES educacion_estudiantes(id),
  ruta_id UUID NOT NULL REFERENCES educacion_transporte_rutas(id),
  paradero_id UUID REFERENCES educacion_transporte_paraderos(id),
  anio_lectivo INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subvenciones
CREATE TABLE educacion_subvenciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  tipo VARCHAR(50) NOT NULL, -- subvencion_regular, PIE, SEP, otros
  anio INTEGER NOT NULL,
  monto DECIMAL(12,2),
  estado VARCHAR(20), -- solicitada, aprobada, recibida
  fecha_recepcion DATE,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3.3 Integraciones con Módulos Existentes

| Módulo Existente | Integración |
|-----------------|-------------|
| **Ventas/DTE** | Emisión de boletas electrónicas (DTE 39) para pensiones y matrículas |
| **Contabilidad** | Asientos contables automáticos por ingresos de pensiones |
| **RRHH (Nómina)** | Gestión de profesores y personal administrativo |
| **Portal Cliente** | Portal del apoderado (extensión del portal existente) |
| **Notificaciones** | Alertas automáticas a apoderados |
| **Banking (Fintoc)** | Conciliación de pagos de pensiones |

### 3.4 API Endpoints Principales

```
GET    /api/educacion/estudiantes
POST   /api/educacion/estudiantes
GET    /api/educacion/estudiantes/:id
PUT    /api/educacion/estudiantes/:id
DELETE /api/educacion/estudiantes/:id

GET    /api/educacion/estudiantes/:id/notas
GET    /api/educacion/estudiantes/:id/asistencia
GET    /api/educacion/estudiantes/:id/pensiones

GET    /api/educacion/cursos
POST   /api/educacion/cursos
GET    /api/educacion/cursos/:id/estudiantes
GET    /api/educacion/cursos/:id/asistencia
POST   /api/educacion/cursos/:id/asistencia  # Registro masivo

GET    /api/educacion/calificaciones
POST   /api/educacion/calificaciones
GET    /api/educacion/cursos/:id/calificaciones  # Libro de clases

GET    /api/educacion/comunicados
POST   /api/educacion/comunicados
POST   /api/educacion/comunicados/:id/enviar

GET    /api/educacion/pensiones
POST   /api/educacion/pensiones/generar  # Generación masiva mensual
POST   /api/educacion/pensiones/:id/pagar

GET    /api/educacion/reportes/asistencia
GET    /api/educacion/reportes/calificaciones
GET    /api/educacion/reportes/morosidad
GET    /api/educacion/reportes/mineduc  # Exportación formato Mineduc
```

---

## 4. Flujo de Trabajo Principal

### 4.1 Proceso Anual

```
1. Configuración Inicial
   ├── Crear año lectivo
   ├── Definir cursos y niveles
   ├── Asignar profesores jefes
   └── Configurar asignaturas por nivel

2. Admisión y Matrícula
   ├── Recibir postulaciones
   ├── Procesar admisiones
   ├── Matricular estudiantes
   └── Generar listas de curso

3. Gestión Diaria
   ├── Registro de asistencia
   ├── Anotaciones en libro de clases
   ├── Comunicados a apoderados
   └── Control de eventos

4. Evaluación
   ├── Ingreso de notas por período
   ├── Cálculo de promedios
   ├── Generación de certificados
   └── Informes a apoderados

5. Financiero
   ├── Generación mensual de pensiones
   ├── Emisión de DTE (boletas)
   ├── Control de pagos
   └── Reportes de morosidad

6. Cierre de Año
   ├── Promoción de estudiantes
   ├── Certificados de finalización de estudios
   ├── Archivo de registros
   └── Preparación siguiente año
```

### 4.2 Portal del Apoderado

```
Dashboard
├── Resumen del estudiante
│   ├── Promedio general
│   ├── Asistencia del mes
│   ├── Próximos eventos
│   └── Pendientes (autorizaciones, pagos)
├── Notas
│   ├── Por asignatura
│   ├── Por período
│   └── Histórico
├── Asistencia
│   ├── Por mes
│   ├── Justificaciones
│   └── Alertas
├── Comunicados
│   ├── Lista de comunicados
│   └── Detalle
├── Pagos
│   ├── Pendientes
│   ├── Historial
│   └── Descarga de boletas
└── Perfil
    ├── Datos del estudiante
    ├── Datos del apoderado
    └── Configuración de notificaciones
```

---

## 5. Consideraciones Legales (Chile)

### 5.1 Mineduc
- **Certificados**: El sistema debe generar certificados válidos para el Mineduc
- **Asistencia**: Los datos de asistencia deben ser exportables en formato compatible con el Mineduc para el cálculo de subvenciones
- **Libro de clases**: Debe cumplir con los requisitos del Mineduc para el registro de calificaciones y anotaciones

### 5.2 SII
- **Boletas electrónicas**: Las pensiones y matrículas deben emitirse como DTE 39 (boleta electrónica)
- **Libro de ventas**: Las pensiones deben registrarse en el libro de ventas del SII
- **Retenciones**: En caso de servicios educativos con retención, aplicar correctamente

### 5.3 Protección de Datos
- **Datos sensibles**: Los datos de menores de edad requieren protección especial
- **Consentimiento**: Se debe contar con consentimiento de apoderados para el tratamiento de datos
- **Acceso restringido**: Solo personal autorizado puede acceder a datos de estudiantes

---

## 6. Plan de Implementación Sugerido

### Fase 1: MVP (Mes 1-2)
- [ ] Gestión de estudiantes y apoderados
- [ ] Gestión de cursos y profesores
- [ ] Registro de asistencia básico
- [ ] Ingreso de calificaciones
- [ ] Portal del apoderado (solo lectura)

### Fase 2: Financiero (Mes 3-4)
- [ ] Generación de pensiones
- [ ] Integración DTE (boletas)
- [ ] Control de pagos
- [ ] Reportes de morosidad

### Fase 3: Comunicación (Mes 5)
- [ ] Comunicados masivos
- [ ] Notificaciones automáticas
- [ ] Portal del apoderado completo

### Fase 4: Avanzado (Mes 6+)
- [ ] Admisión de postulaciones
- [ ] Biblioteca
- [ ] Transporte escolar
- [ ] Reportes Mineduc
- [ ] Subvenciones

---

## 7. Diferenciadores Competitivos

1. **Integración nativa con SII**: Emisión automática de DTE para pensiones
2. **Multi-tenant**: Un solo colegio o una red de colegios
3. **Portal del apoderado incluido**: Sin costos adicionales
4. **Cumplimiento Mineduc**: Reportes y certificados listos para el ministerio
5. **Escalable**: Desde jardines infantiles hasta colegios grandes
6. **Integración con ERP**: Finanzas, RRHH y ventas en un solo sistema

---

## 8. Estimación de Esfuerzo

| Componente | Horas estimadas |
|-----------|----------------|
| Base de datos y migraciones | 40 hrs |
| API Backend | 120 hrs |
| UI Frontend | 160 hrs |
| Portal Apoderado | 80 hrs |
| Integración DTE | 20 hrs |
| Integración Notificaciones | 16 hrs |
| Reportes y exportaciones | 40 hrs |
| Testing | 60 hrs |
| **Total** | **~536 hrs** |

---

## 9. Próximos Pasos

1. **Validar prioridades** con usuarios reales (colegios)
2. **Definir MVP** con el equipo de producto
3. **Crear wireframes** de las pantallas principales
4. **Diseñar modelo de datos** final
5. **Planificar sprints** de implementación

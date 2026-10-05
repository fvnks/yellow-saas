-- ============================================
-- MÓDULO EDUCATIVO: BIBLIOTECA
-- ============================================

CREATE TABLE IF NOT EXISTS educacion_libros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  isbn VARCHAR(20),
  titulo VARCHAR(255) NOT NULL,
  autor VARCHAR(255),
  editorial VARCHAR(100),
  anio_publicacion INTEGER,
  cantidad_total INTEGER DEFAULT 1,
  cantidad_disponible INTEGER DEFAULT 1,
  ubicacion VARCHAR(100),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS educacion_prestamos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  libro_id UUID NOT NULL REFERENCES educacion_libros(id) ON DELETE CASCADE,
  estudiante_id UUID REFERENCES educacion_estudiantes(id),
  profesor_id UUID REFERENCES educacion_profesores(id),
  fecha_prestamo DATE NOT NULL,
  fecha_devolucion_esperada DATE NOT NULL,
  fecha_devolucion_real DATE,
  estado VARCHAR(20) DEFAULT 'prestado' CHECK (estado IN ('prestado', 'devuelto', 'atrasado', 'perdido')),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_educacion_libros_company ON educacion_libros(company_id);
CREATE INDEX IF NOT EXISTS idx_educacion_libros_titulo ON educacion_libros(titulo);
CREATE INDEX IF NOT EXISTS idx_educacion_libros_isbn ON educacion_libros(isbn);
CREATE INDEX IF NOT EXISTS idx_educacion_prestamos_company ON educacion_prestamos(company_id);
CREATE INDEX IF NOT EXISTS idx_educacion_prestamos_libro ON educacion_prestamos(libro_id);
CREATE INDEX IF NOT EXISTS idx_educacion_prestamos_estudiante ON educacion_prestamos(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_educacion_prestamos_estado ON educacion_prestamos(estado);

-- RLS
ALTER TABLE educacion_libros ENABLE ROW LEVEL SECURITY;
ALTER TABLE educacion_prestamos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educacion_libros_company_isolation" ON educacion_libros
  USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "educacion_prestamos_company_isolation" ON educacion_prestamos
  USING (company_id = current_setting('app.current_company_id')::UUID);

-- Triggers
CREATE OR REPLACE FUNCTION update_educacion_libros_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_educacion_libros_updated_at
  BEFORE UPDATE ON educacion_libros
  FOR EACH ROW
  EXECUTE FUNCTION update_educacion_libros_updated_at();

CREATE OR REPLACE FUNCTION update_educacion_prestamos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_educacion_prestamos_updated_at
  BEFORE UPDATE ON educacion_prestamos
  FOR EACH ROW
  EXECUTE FUNCTION update_educacion_prestamos_updated_at();

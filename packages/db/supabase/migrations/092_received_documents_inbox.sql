-- Migration 092: Received Documents Inbox (Documentos Recibidos SII)
-- Bandeja de entrada de DTE recibidos para clientes chilenos
-- Soporta: factura (33), factura exenta (34), guía despacho (52), ND (56), NC (61)

-- =============================================
-- TABLA PRINCIPAL: Documentos Recibidos
-- =============================================
CREATE TABLE IF NOT EXISTS received_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Tipo y folio del DTE
    document_type VARCHAR(5) NOT NULL CHECK (document_type IN ('33','34','39','52','56','61','110','111','112')),
    folio BIGINT NOT NULL,

    -- Emisor
    emitter_rut VARCHAR(12) NOT NULL,
    emitter_name TEXT NOT NULL,
    emitter_trade_name TEXT,

    -- Receptor
    receiver_rut VARCHAR(12) NOT NULL,
    receiver_name TEXT NOT NULL,

    -- Fechas
    issue_date DATE NOT NULL,
    reception_date TIMESTAMPTZ DEFAULT now(),

    -- Montos (en pesos chilenos, sin decimales)
    net_amount BIGINT DEFAULT 0,
    exempt_amount BIGINT DEFAULT 0,
    vat_amount BIGINT DEFAULT 0,
    total_amount BIGINT DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'CLP',

    -- Estado y procesamiento
    status VARCHAR(20) DEFAULT 'received' CHECK (status IN ('received','valid','warning','rejected','duplicate','processing')),
    processing_errors JSONB DEFAULT '[]'::jsonb,
    validation_warnings JSONB DEFAULT '[]'::jsonb,

    -- Fuente del documento
    source VARCHAR(30) DEFAULT 'xml_upload' CHECK (source IN ('xml_upload','email','provider','sii_certification')),
    external_reference TEXT,

    -- Almacenamiento del XML
    xml_storage_key TEXT,
    raw_xml_sha256 VARCHAR(64),
    xml_size_bytes INTEGER,

    -- Referencia externa del SII (track_id si aplica)
    sii_track_id TEXT,

    -- Metadatos de importación
    imported_by UUID,
    import_batch_id UUID,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Unicidad por empresa + emisor + tipo + folio (impide duplicados)
    UNIQUE (company_id, emitter_rut, document_type, folio)
);

COMMENT ON TABLE received_documents IS 'Bandeja de documentos DTE recibidos por empresa';
COMMENT ON COLUMN received_documents.document_type IS 'Tipo DTE SII: 33=Factura, 34=Factura Exenta, 39=Boleta, 52=Guía Despacho, 56=Nota Débito, 61=Nota Crédito';

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_rd_company ON received_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_rd_company_status ON received_documents(company_id, status);
CREATE INDEX IF NOT EXISTS idx_rd_company_type ON received_documents(company_id, document_type);
CREATE INDEX IF NOT EXISTS idx_rd_company_emitter ON received_documents(company_id, emitter_rut);
CREATE INDEX IF NOT EXISTS idx_rd_company_date ON received_documents(company_id, issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_rd_sha256 ON received_documents(raw_xml_sha256);
CREATE INDEX IF NOT EXISTS idx_rd_company_batch ON received_documents(company_id, import_batch_id);

-- =============================================
-- TABLA: Líneas/Detalle de documentos recibidos
-- =============================================
CREATE TABLE IF NOT EXISTS received_document_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES received_documents(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    line_number INTEGER NOT NULL,
    product_code TEXT,
    product_name TEXT NOT NULL,
    quantity DECIMAL(14,4) DEFAULT 1,
    unit VARCHAR(10) DEFAULT 'UN',
    unit_price BIGINT DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount BIGINT DEFAULT 0,
    line_total BIGINT DEFAULT 0,
    is_exempt BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE received_document_items IS 'Detalle/ítems de documentos DTE recibidos';

CREATE INDEX IF NOT EXISTS idx_rdi_document ON received_document_items(document_id);
CREATE INDEX IF NOT EXISTS idx_rdi_company ON received_document_items(company_id);

-- =============================================
-- TABLA: Referencias de documentos recibidos
-- (ej: NC que refiere a una factura)
-- =============================================
CREATE TABLE IF NOT EXISTS received_document_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES received_documents(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    reference_type VARCHAR(5) NOT NULL,
    reference_folio BIGINT,
    reference_date DATE,
    reference_code VARCHAR(5),
    reference_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE received_document_references IS 'Referencias cruzadas de documentos DTE recibidos (ej: NC refiere a factura)';

CREATE INDEX IF NOT EXISTS idx_rdr_document ON received_document_references(document_id);

-- =============================================
-- TABLA: Eventos de procesamiento (audit log)
-- =============================================
CREATE TABLE IF NOT EXISTS document_processing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES received_documents(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    stage VARCHAR(30) NOT NULL CHECK (stage IN ('upload','parse','validate','store','duplicate_check','complete','error')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success','warning','error','info')),
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE document_processing_events IS 'Log de eventos de procesamiento de documentos recibidos';

CREATE INDEX IF NOT EXISTS idx_dpe_document ON document_processing_events(document_id);
CREATE INDEX IF NOT EXISTS idx_dpe_company ON document_processing_events(company_id);

-- =============================================
-- RLS (Row Level Security)
-- =============================================
ALTER TABLE received_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY rd_company_policy ON received_documents
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

ALTER TABLE received_document_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY rdi_company_policy ON received_document_items
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

ALTER TABLE received_document_references ENABLE ROW LEVEL SECURITY;
CREATE POLICY rdr_company_policy ON received_document_references
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

ALTER TABLE document_processing_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY dpe_company_policy ON document_processing_events
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- =============================================
-- PERMISOS DEL MÓDULO
-- =============================================
INSERT INTO permissions (module, action, label, description) VALUES
  ('documentos_recibidos', 'read', 'Ver documentos recibidos', 'Puede ver la bandeja de documentos DTE recibidos'),
  ('documentos_recibidos', 'import', 'Importar documentos', 'Puede importar XML/ZIP de documentos recibidos'),
  ('documentos_recibidos', 'delete', 'Eliminar documentos recibidos', 'Puede eliminar documentos de la bandeja'),
  ('documentos_recibidos', 'export', 'Exportar documentos recibidos', 'Puede exportar el listado de documentos recibidos')
ON CONFLICT (module, action) DO NOTHING;

-- =============================================
-- CATÁLOGO DE MÓDULO
-- =============================================
INSERT INTO module_catalog (name, label, description, icon, route, is_active, sort_order) VALUES
  ('documentos_recibidos', 'Documentos Recibidos', 'Bandeja de entrada de DTE recibidos (facturas, guías, notas de crédito y débito)', 'FileDown', '/dashboard/received-documents', true, 18)
ON CONFLICT (name) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  route = EXCLUDED.route;

-- Monthly tax calculations table
CREATE TABLE IF NOT EXISTS monthly_tax_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    iva_collected BIGINT NOT NULL DEFAULT 0,
    iva_paid BIGINT NOT NULL DEFAULT 0,
    iva_payable BIGINT NOT NULL DEFAULT 0,
    gross_income BIGINT NOT NULL DEFAULT 0,
    igrh_rate DECIMAL(5,4) DEFAULT 0.08,
    igrh_payable BIGINT NOT NULL DEFAULT 0,
    calculated_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_monthly_tax_company ON monthly_tax_calculations(company_id, year DESC, month DESC);

COMMENT ON TABLE monthly_tax_calculations IS 'Cálculos mensuales de impuestos para Formulario 29 (IVA) e IGRH';

-- DTE submission queue
CREATE TABLE IF NOT EXISTS dte_submission_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('33', '46', '56', '55')),
    document_id UUID NOT NULL,
    xml_content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'retrying')),
    sii_response TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dte_queue_status ON dte_submission_queue(company_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_dte_queue_document ON dte_submission_queue(document_type, document_id);

COMMENT ON TABLE dte_submission_queue IS 'Cola de envío de DTEs al SII con manejo de reintentos';

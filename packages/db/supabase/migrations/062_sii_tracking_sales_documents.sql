-- 062_sii_tracking_sales_documents.sql
-- Agregar campos de seguimiento SII a documentos de venta

-- ============================================================
-- 1. invoices
-- ============================================================
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS sii_status TEXT DEFAULT 'pending' CHECK (sii_status IN ('pending', 'sent', 'accepted', 'rejected', 'cancelled')),
  ADD COLUMN IF NOT EXISTS sii_track_id TEXT,
  ADD COLUMN IF NOT EXISTS sii_xml TEXT,
  ADD COLUMN IF NOT EXISTS sii_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sii_response_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sii_error TEXT;

CREATE INDEX IF NOT EXISTS idx_invoices_sii_status ON invoices(sii_status);

-- ============================================================
-- 2. credit_notes
-- ============================================================
ALTER TABLE credit_notes
  ADD COLUMN IF NOT EXISTS sii_status TEXT DEFAULT 'pending' CHECK (sii_status IN ('pending', 'sent', 'accepted', 'rejected', 'cancelled')),
  ADD COLUMN IF NOT EXISTS sii_track_id TEXT,
  ADD COLUMN IF NOT EXISTS sii_xml TEXT,
  ADD COLUMN IF NOT EXISTS sii_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sii_response_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sii_error TEXT;

CREATE INDEX IF NOT EXISTS idx_credit_notes_sii_status ON credit_notes(sii_status);

-- ============================================================
-- 3. debit_notes
-- ============================================================
ALTER TABLE debit_notes
  ADD COLUMN IF NOT EXISTS sii_status TEXT DEFAULT 'pending' CHECK (sii_status IN ('pending', 'sent', 'accepted', 'rejected', 'cancelled')),
  ADD COLUMN IF NOT EXISTS sii_track_id TEXT,
  ADD COLUMN IF NOT EXISTS sii_xml TEXT,
  ADD COLUMN IF NOT EXISTS sii_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sii_response_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sii_error TEXT;

CREATE INDEX IF NOT EXISTS idx_debit_notes_sii_status ON debit_notes(sii_status);

-- ============================================================
-- 4. delivery_guides
-- ============================================================
ALTER TABLE delivery_guides
  ADD COLUMN IF NOT EXISTS sii_status TEXT DEFAULT 'pending' CHECK (sii_status IN ('pending', 'sent', 'accepted', 'rejected', 'cancelled')),
  ADD COLUMN IF NOT EXISTS sii_track_id TEXT,
  ADD COLUMN IF NOT EXISTS sii_xml TEXT,
  ADD COLUMN IF NOT EXISTS sii_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sii_response_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sii_error TEXT;

CREATE INDEX IF NOT EXISTS idx_delivery_guides_sii_status ON delivery_guides(sii_status);

-- ============================================================
-- Update existing records to have proper default
-- ============================================================
UPDATE invoices SET sii_status = 'pending' WHERE sii_status IS NULL;
UPDATE credit_notes SET sii_status = 'pending' WHERE sii_status IS NULL;
UPDATE debit_notes SET sii_status = 'pending' WHERE sii_status IS NULL;
UPDATE delivery_guides SET sii_status = 'pending' WHERE sii_status IS NULL;
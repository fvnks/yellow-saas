-- Migration 059: Company integrations table
-- Stores configuration for SII, payment providers, email, etc.

CREATE TABLE IF NOT EXISTS company_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  integration_id VARCHAR(50) NOT NULL,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, integration_id)
);

-- Index for fast lookups by company
CREATE INDEX IF NOT EXISTS idx_company_integrations_company_id ON company_integrations(company_id);

-- Add comment
COMMENT ON TABLE company_integrations IS 'Stores third-party integration configurations per company (SII, Stripe, Mach, SMTP, etc.)';
COMMENT ON COLUMN company_integrations.integration_id IS 'Integration identifier: sii, stripe, mach, email, etc.';
COMMENT ON COLUMN company_integrations.config IS 'JSON configuration object with API keys, secrets, and settings';

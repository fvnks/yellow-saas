-- 099: Bank Reconciliation tables for Yellow ERP
-- All tables use CREATE TABLE IF NOT EXISTS for safety

-- ============================================================
-- 1. RECONCILIATION SESSIONS (Sesiones de Conciliación Bancaria)
-- ============================================================

CREATE TABLE IF NOT EXISTS reconciliation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  account_id UUID NOT NULL,
  period VARCHAR(7) NOT NULL, -- 'YYYY-MM'
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  matched_count INT DEFAULT 0,
  variance NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_sessions_company ON reconciliation_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_sessions_account ON reconciliation_sessions(account_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_sessions_status ON reconciliation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_reconciliation_sessions_period ON reconciliation_sessions(period);

ALTER TABLE reconciliation_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reconciliation_sessions_company_isolation' AND tablename = 'reconciliation_sessions') THEN
    CREATE POLICY reconciliation_sessions_company_isolation ON reconciliation_sessions
      FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;
END $$;

-- ============================================================
-- 2. RECONCILIATION STATEMENT LINES (Líneas del Estado de Cuenta)
-- ============================================================

CREATE TABLE IF NOT EXISTS reconciliation_statement_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES reconciliation_sessions(id) ON DELETE CASCADE,
  account_id UUID NOT NULL,
  description VARCHAR(500),
  amount NUMERIC(12,2) NOT NULL,
  statement_date DATE,
  reference VARCHAR(100),
  is_matched BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_statement_lines_company ON reconciliation_statement_lines(company_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_statement_lines_session ON reconciliation_statement_lines(session_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_statement_lines_account ON reconciliation_statement_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_statement_lines_date ON reconciliation_statement_lines(statement_date);

ALTER TABLE reconciliation_statement_lines ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reconciliation_statement_lines_company_isolation' AND tablename = 'reconciliation_statement_lines') THEN
    CREATE POLICY reconciliation_statement_lines_company_isolation ON reconciliation_statement_lines
      FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;
END $$;

-- ============================================================
-- 3. RECONCILIATION MATCHES (Conciliaciones / Emparejamientos)
-- ============================================================

CREATE TABLE IF NOT EXISTS reconciliation_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES reconciliation_sessions(id) ON DELETE CASCADE,
  statement_line_id UUID REFERENCES reconciliation_statement_lines(id),
  journal_entry_id UUID,
  amount NUMERIC(12,2) NOT NULL,
  difference NUMERIC(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_matches_company ON reconciliation_matches(company_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_matches_session ON reconciliation_matches(session_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_matches_statement_line ON reconciliation_matches(statement_line_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_matches_journal_entry ON reconciliation_matches(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_matches_status ON reconciliation_matches(status);

ALTER TABLE reconciliation_matches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reconciliation_matches_company_isolation' AND tablename = 'reconciliation_matches') THEN
    CREATE POLICY reconciliation_matches_company_isolation ON reconciliation_matches
      FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;
END $$;

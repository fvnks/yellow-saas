-- Inventory audit trail
CREATE TABLE IF NOT EXISTS inventory_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  entity_name TEXT,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  changes JSONB,
  performed_by UUID,
  performed_by_name TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_audit_log_company ON inventory_audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_log_entity ON inventory_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_log_created ON inventory_audit_log(created_at);

ALTER TABLE inventory_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_audit_log_company_isolation" ON inventory_audit_log
  FOR ALL USING (company_id = current_company_id());

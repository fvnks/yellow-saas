-- Migration 055: user_companies table for multi-company support
-- Allows users to belong to multiple companies and switch between them

-- 1. Create user_companies join table
CREATE TABLE IF NOT EXISTS user_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON user_companies(company_id);

-- 3. Enable RLS
ALTER TABLE user_companies ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies
CREATE POLICY "Users can view their own company memberships"
  ON user_companies FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Company owners/admins can manage memberships"
  ON user_companies FOR ALL
  USING (
    company_id = current_company_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.company_id = user_companies.company_id
      AND profiles.role IN ('owner', 'admin')
    )
  );

-- 5. Migrate existing profiles.company_id data to user_companies
INSERT INTO user_companies (user_id, company_id, role, is_default)
SELECT id, company_id, role, true
FROM profiles
WHERE company_id IS NOT NULL
ON CONFLICT (user_id, company_id) DO NOTHING;

-- 6. Add companies array to auth response (view for quick lookup)
CREATE OR REPLACE VIEW user_companies_view AS
SELECT
  uc.user_id,
  uc.company_id,
  uc.role AS company_role,
  uc.is_default,
  c.name AS company_name,
  c.slug AS company_slug,
  c.logo_url AS company_logo,
  c.plan AS company_plan,
  c.status AS company_status
FROM user_companies uc
JOIN companies c ON c.id = uc.company_id;

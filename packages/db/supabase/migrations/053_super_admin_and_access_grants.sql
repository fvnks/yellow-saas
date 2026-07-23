-- Migration 053: Super Admin system + Company Access Grants
-- Adds platform-level admin role separate from multi-tenant model

-- ============================================================
-- 1. SUPER_ADMINS table (platform-level, no company_id)
-- ============================================================
CREATE TABLE IF NOT EXISTS super_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. COMPANY_ACCESS_GRANTS (consent-based access)
-- ============================================================
CREATE TABLE IF NOT EXISTS company_access_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    super_admin_id UUID NOT NULL REFERENCES super_admins(id) ON DELETE CASCADE,
    granted_by UUID NOT NULL REFERENCES profiles(id),
    access_level TEXT DEFAULT 'read' CHECK (access_level IN ('read', 'full')),
    reason TEXT,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, super_admin_id)
);

-- ============================================================
-- 3. Add role_type to profiles to distinguish user types
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'role_type'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role_type TEXT DEFAULT 'company' CHECK (role_type IN ('company', 'super_admin'));
    END IF;
END $$;

-- ============================================================
-- 4. ACCESS_AUDIT_LOG (track super admin access to companies)
-- ============================================================
CREATE TABLE IF NOT EXISTS access_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    super_admin_id UUID NOT NULL REFERENCES super_admins(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('login', 'access', 'modify', 'logout')),
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_company_access_grants_company ON company_access_grants(company_id);
CREATE INDEX IF NOT EXISTS idx_company_access_grants_super_admin ON company_access_grants(super_admin_id);
CREATE INDEX IF NOT EXISTS idx_company_access_grants_active ON company_access_grants(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_access_audit_log_super_admin ON access_audit_log(super_admin_id);
CREATE INDEX IF NOT EXISTS idx_access_audit_log_company ON access_audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role_type ON profiles(role_type);

-- ============================================================
-- 6. Insert default super admin (password: SuperAdmin123!)
--    bcrypt hash of 'SuperAdmin123!' — change in production
-- ============================================================
INSERT INTO super_admins (email, name, password_hash, is_active)
VALUES (
    'superadmin@yellow.cl',
    'Super Admin',
    '$2a$12$LJ3m4ys4Gz8DQz8e8Qz8xeYQz8e8Qz8xeYQz8e8Qz8xeYQz8e8Qz8',
    true
)
ON CONFLICT (email) DO NOTHING;

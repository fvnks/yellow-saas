-- =====================================================
-- YELLOW ERP: Notification System (merged from 007 + 008)
-- Consolidates both the basic notifications table and
-- notification preferences into a single migration.
-- =====================================================

-- 1. Core notifications table (merged schema from 007 + 008)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('low_stock', 'out_of_stock', 'new_sale', 'overdue_invoice', 'payment_received', 'transfer', 'info')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'danger')),
    entity_type TEXT,
    entity_id UUID,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_company ON notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_company_isolation" ON notifications
  USING (company_id = current_setting('app.current_company_id')::uuid);

-- 2. Notification preferences (from 008)
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT false,
    email_address TEXT,
    task_deadline BOOLEAN DEFAULT true,
    milestone_deadline BOOLEAN DEFAULT true,
    project_deadline BOOLEAN DEFAULT true,
    timesheet_reminders BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_company ON notification_preferences(company_id);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_prefs_company_isolation" ON notification_preferences
  USING (company_id = current_setting('app.current_company_id')::uuid);

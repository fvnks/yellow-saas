import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Drop and recreate to ensure schema is correct
    await query(`DROP TABLE IF EXISTS notification_preferences CASCADE`);
    await query(`DROP TABLE IF EXISTS notifications CASCADE`);

    await query(`CREATE TABLE notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      entity_type TEXT,
      entity_id UUID,
      project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now()
    )`);
    await query(`CREATE INDEX idx_notifications_company ON notifications(company_id)`);
    await query(`CREATE INDEX idx_notifications_user ON notifications(user_id)`);
    await query(`CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL`);
    await query(`ALTER TABLE notifications ENABLE ROW LEVEL SECURITY`);
    await query(`CREATE POLICY "notifications_company_isolation" ON notifications USING (company_id = current_setting('app.current_company_id')::uuid)`);

    await query(`CREATE TABLE notification_preferences (
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
      UNIQUE(company_id, user_id)
    )`);
    await query(`ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY`);
    await query(`CREATE POLICY "notif_prefs_company_isolation" ON notification_preferences USING (company_id = current_setting('app.current_company_id')::uuid)`);

    return successResponse({ message: 'Notifications tables created' });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

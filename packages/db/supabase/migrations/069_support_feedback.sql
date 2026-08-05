-- Support module enhancements:
-- 1. Track when the company last read a ticket (to notify of new replies)
-- 2. Global FAQ table managed by super-admins
-- 3. Satisfaction survey for resolved/closed tickets

ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS company_last_read_at TIMESTAMPTZ DEFAULT now();

CREATE TABLE IF NOT EXISTS support_faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'General',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (ticket_id)
);

CREATE INDEX IF NOT EXISTS idx_support_faq_active ON support_faq(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_ticket ON ticket_feedback(ticket_id);

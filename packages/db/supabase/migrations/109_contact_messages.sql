-- Migration 109: Mensajes del formulario de contacto público (landing y /contact)
-- Tabla sin company_id: es un mensaje de sitio público, no un registro multi-tenant.
-- El único acceso es por parte del servidor vía /api/contact, por lo que no se habilita RLS.

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  subject TEXT,
  company TEXT,
  source TEXT NOT NULL DEFAULT 'landing' CHECK (source IN ('landing', 'contact')),
  ip INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages (created_at DESC);

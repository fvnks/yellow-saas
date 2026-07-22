-- User project favorites
CREATE TABLE IF NOT EXISTS user_project_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_project_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_project ON user_project_favorites(project_id);

ALTER TABLE user_project_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_company_isolation" ON user_project_favorites
  FOR ALL USING (company_id = current_company_id());

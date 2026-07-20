-- 012_file_upload.sql
-- Add file_data column for storing uploaded files as base64

ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS file_data TEXT;
ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS mime_type TEXT;

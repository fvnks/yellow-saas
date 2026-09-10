-- 096: Fix auth.users FK references + prescription_items company_id + RLS
-- Railway doesn't have auth.users schema — replace with plain UUID columns

-- 1. Drop FK constraints referencing auth.users (safe to re-run with IF EXISTS)
ALTER TABLE veterinary_professionals DROP CONSTRAINT IF EXISTS veterinary_professionals_user_id_fkey;
ALTER TABLE veterinary_portal_tokens DROP CONSTRAINT IF EXISTS veterinary_portal_tokens_created_by_fkey;
ALTER TABLE veterinary_pharmacy_dispenses DROP CONSTRAINT IF EXISTS veterinary_pharmacy_dispenses_dispensed_by_fkey;
ALTER TABLE project_notifications DROP CONSTRAINT IF EXISTS project_notifications_user_id_fkey;
ALTER TABLE project_members DROP CONSTRAINT IF EXISTS project_members_user_id_fkey;
ALTER TABLE project_audit_log DROP CONSTRAINT IF EXISTS project_audit_log_user_id_fkey;
ALTER TABLE task_comments DROP CONSTRAINT IF EXISTS task_comments_user_id_fkey;
ALTER TABLE auto_talleres_work_orders DROP CONSTRAINT IF EXISTS auto_talleres_work_orders_service_writer_id_fkey;
ALTER TABLE auto_talleres_services DROP CONSTRAINT IF EXISTS auto_talleres_services_user_id_fkey;
ALTER TABLE auto_talleres_parts_requests DROP CONSTRAINT IF EXISTS auto_talleres_parts_requests_requested_by_fkey;
ALTER TABLE auto_talleres_work_order_history DROP CONSTRAINT IF EXISTS auto_talleres_work_order_history_changed_by_fkey;

-- 2. Add company_id to veterinary_prescription_items for multi-tenant isolation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'veterinary_prescription_items' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE veterinary_prescription_items
      ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

    -- Backfill from parent prescription
    UPDATE veterinary_prescription_items pi
      SET company_id = pr.company_id
      FROM veterinary_prescriptions pr
      WHERE pi.prescription_id = pr.id AND pi.company_id IS NULL;

    ALTER TABLE veterinary_prescription_items
      ALTER COLUMN company_id SET NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_vet_prescription_items_company
      ON veterinary_prescription_items(company_id);
  END IF;
END $$;

-- 3. RLS policy for prescription_items (was enabled but had no policy)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'vet_prescription_items_company_isolation'
      AND tablename = 'veterinary_prescription_items'
  ) THEN
    CREATE POLICY vet_prescription_items_company_isolation ON veterinary_prescription_items
      FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;
END $$;

-- 097: Imaging studies table + index

CREATE TABLE IF NOT EXISTS veterinary_imaging_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES veterinary_patients(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES veterinary_clients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES veterinary_professionals(id) ON DELETE SET NULL,
  study_number VARCHAR(30) NOT NULL,
  study_type VARCHAR(30) NOT NULL CHECK (study_type IN (
    'radiografia','ecografia','tomografia','resonancia',
    'endoscopia','electrocardiograma','otro'
  )),
  study_date DATE DEFAULT CURRENT_DATE,
  region VARCHAR(100),
  findings TEXT,
  conclusion TEXT,
  image_count INT DEFAULT 0,
  modality VARCHAR(50),
  status VARCHAR(20) DEFAULT 'en_proceso' CHECK (status IN ('en_proceso','informado','disponible')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_vet_imaging_company ON veterinary_imaging_studies(company_id);
CREATE INDEX idx_vet_imaging_patient ON veterinary_imaging_studies(patient_id);
CREATE UNIQUE INDEX idx_vet_imaging_number ON veterinary_imaging_studies(company_id, study_number);

ALTER TABLE veterinary_imaging_studies ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'vet_imaging_company_isolation'
      AND tablename = 'veterinary_imaging_studies'
  ) THEN
    CREATE POLICY vet_imaging_company_isolation ON veterinary_imaging_studies
      FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;
END $$;

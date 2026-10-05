-- 124_company_type_vertical.sql
-- Clasifica a las empresas: ¿colegio o empresa? y, si es empresa, su rubro
-- según los módulos de Yellow (restaurante, veterinaria, talleres, condominio...).
-- Permite filtrar en el panel de superadmin: "ver los colegios".

ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_type TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS vertical TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'companies_company_type_check') THEN
    ALTER TABLE companies ADD CONSTRAINT companies_company_type_check
      CHECK (company_type IS NULL OR company_type IN ('colegio', 'empresa'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'companies_vertical_check') THEN
    ALTER TABLE companies ADD CONSTRAINT companies_vertical_check
      CHECK (vertical IS NULL OR vertical IN (
        'educacion', 'restaurante', 'veterinaria', 'talleres', 'condominio', 'general'
      ));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_companies_company_type ON companies (company_type);

-- Backfill: infiere el tipo desde los módulos ya activados (solo las filas sin clasificar,
-- por lo que volver a ejecutar la migración no pisa clasificaciones hechas a mano).
UPDATE companies c
   SET company_type = CASE WHEN v.has_educacion THEN 'colegio' ELSE 'empresa' END,
       vertical = CASE
         WHEN v.has_educacion  THEN 'educacion'
         WHEN v.has_restaurant THEN 'restaurante'
         WHEN v.has_veterinaria THEN 'veterinaria'
         WHEN v.has_autotalleres THEN 'talleres'
         WHEN v.has_condominiums THEN 'condominio'
         ELSE 'general'
       END
  FROM (
        SELECT c2.id,
               EXISTS (SELECT 1 FROM module_activations ma
                        WHERE ma.company_id = c2.id AND ma.status = 'active'
                          AND ma.module_name = 'educacion')      AS has_educacion,
               EXISTS (SELECT 1 FROM module_activations ma
                        WHERE ma.company_id = c2.id AND ma.status = 'active'
                          AND ma.module_name = 'restaurant')     AS has_restaurant,
               EXISTS (SELECT 1 FROM module_activations ma
                        WHERE ma.company_id = c2.id AND ma.status = 'active'
                          AND ma.module_name = 'veterinaria')    AS has_veterinaria,
               EXISTS (SELECT 1 FROM module_activations ma
                        WHERE ma.company_id = c2.id AND ma.status = 'active'
                          AND ma.module_name = 'auto-talleres')  AS has_autotalleres,
               EXISTS (SELECT 1 FROM module_activations ma
                        WHERE ma.company_id = c2.id AND ma.status = 'active'
                          AND ma.module_name = 'condominiums')   AS has_condominiums
          FROM companies c2
       ) v
 WHERE v.id = c.id
   AND c.company_type IS NULL;

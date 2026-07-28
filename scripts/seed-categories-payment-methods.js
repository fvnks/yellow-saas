const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../apps/web/.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = envContent.split('\n').reduce((acc, line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) acc[match[1].trim()] = match[2].trim();
    return acc;
  }, {});
  if (envVars.DATABASE_URL) process.env.DATABASE_URL = envVars.DATABASE_URL;
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const DEFAULT_CATEGORIES = [
  { name: 'Materias Primas', description: 'Materiales base para producción' },
  { name: 'Suministros de Oficina', description: 'Artículos de oficina y papelería' },
  { name: 'Equipos y Maquinaria', description: 'Equipamiento y maquinaria industrial' },
  { name: 'Servicios', description: 'Servicios externos contratados' },
  { name: 'Mantención', description: 'Reparación y mantención de equipos' },
  { name: 'Tecnología', description: 'Hardware, software y licencias' },
  { name: 'Transporte', description: 'Logística y transporte de mercadería' },
  { name: 'Alimentos', description: 'Alimentos y bebidas' },
  { name: 'Indumentaria', description: 'Ropa y equipamiento de trabajo' },
  { name: 'Otros', description: 'Otras categorías no clasificadas' },
];

const DEFAULT_PAYMENT_METHODS = [
  { name: 'Contado', description: 'Pago de contado al momento de la compra' },
  { name: 'Crédito 30 días', description: 'Pago a 30 días de la fecha de factura' },
  { name: 'Crédito 60 días', description: 'Pago a 60 días de la fecha de factura' },
  { name: 'Crédito 90 días', description: 'Pago a 90 días de la fecha de factura' },
  { name: 'Transferencia Bancaria', description: 'Transferencia directa a cuenta bancaria' },
  { name: 'Tarjeta de Crédito', description: 'Pago con tarjeta de crédito' },
  { name: 'Tarjeta de Débito', description: 'Pago con tarjeta de débito' },
  { name: 'Cheque', description: 'Pago con cheque nominativo' },
  { name: 'Letra de Cambio', description: 'Pago mediante letra de cambio' },
];

async function seed() {
  const { rows: companies } = await pool.query('SELECT id FROM companies');
  console.log(`Found ${companies.length} companies`);

  for (const company of companies) {
    const cid = company.id;

    // Seed purchase categories
    for (const cat of DEFAULT_CATEGORIES) {
      await pool.query(
        `INSERT INTO purchase_categories (company_id, name, description, is_default)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (company_id, name) DO NOTHING`,
        [cid, cat.name, cat.description]
      ).catch(() => {});
    }

    // Seed payment methods
    for (const pm of DEFAULT_PAYMENT_METHODS) {
      await pool.query(
        `INSERT INTO payment_methods (company_id, name, description, is_default)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (company_id, name) DO NOTHING`,
        [cid, pm.name, pm.description]
      ).catch(() => {});
    }

    console.log(`✓ Seeded categories and payment methods for company ${cid}`);
  }

  await pool.end();
  console.log('Done.');
}

seed();

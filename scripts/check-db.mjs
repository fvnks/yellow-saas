import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const r1 = await pool.query('SELECT * FROM formulas');
  console.log('Formulas:', r1.rows);
  
  const r2 = await pool.query('SELECT * FROM recipe_products');
  console.log('Recipe Products:', r2.rows);
  
  const r3 = await pool.query('SELECT * FROM formula_ingredients');
  console.log('Formula Ingredients:', r3.rows);
  
  await pool.end();
}

check().catch(console.error);
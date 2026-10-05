import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

const ssl =
  process.env.DATABASE_SSL === 'false'
    ? false
    : process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const client = await pool.connect();
  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}

export async function transaction<T>(fn: (client: PoolClient) => Promise<T>, companyId?: string): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (companyId) {
      // `SET LOCAL x = $1` no acepta parámetros en PostgreSQL (syntax error),
      // así que se usa set_config(), que sí recibe placeholders y respeta el
      // ámbito de la transacción.
      await client.query('SELECT set_config($1, $2, true)', [
        'app.current_company_id',
        companyId,
      ]);
    }
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export { pool };

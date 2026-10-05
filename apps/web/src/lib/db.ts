/**
 * Cliente de base de datos del módulo educativo.
 *
 * Envuelve el pool compartido de la aplicación (`@/api/lib/db`) exponiendo
 * la interfaz `getDb()` que consumen las rutas de `/api/educacion` y
 * `/api/portal-apoderado`.
 */
import { query as rawQuery, pool, transaction } from '@/api/lib/db';
import type { QueryResult, QueryResultRow } from 'pg';

export interface DbClient {
  query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>>;
}

/**
 * Devuelve un cliente para ejecutar consultas. Usa el mismo pool de
 * conexiones que el resto de la aplicación.
 */
export async function getDb(): Promise<DbClient> {
  return {
    query<T extends QueryResultRow = any>(text: string, params?: any[]) {
      return rawQuery<T>(text, params);
    },
  };
}

export { pool, transaction };

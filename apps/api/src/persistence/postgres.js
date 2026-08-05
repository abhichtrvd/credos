export const createPostgresPool = async ({ databaseUrl }) => {
  const { Pool } = await import('pg');
  return new Pool({ connectionString: databaseUrl, max: 15, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 5_000 });
};

export class PostgresRepository {
  constructor(pool) { this.pool = pool; }
  async transaction(companyId, work) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // RLS policies read this transaction-local setting; it cannot leak across pooled connections.
      await client.query("SELECT set_config('credos.company_id', $1, true)", [companyId]);
      const result = await work(client);
      await client.query('COMMIT'); return result;
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  }
  async systemTransaction(work) {
    const client = await this.pool.connect();
    try { await client.query('BEGIN'); const result = await work(client); await client.query('COMMIT'); return result; } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  }
  async close() { await this.pool.end(); }
}

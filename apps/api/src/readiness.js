export const createReadinessCheck = ({ databaseUrl }) => async () => {
  if (!databaseUrl) return { ok: true, dependencies: { database: 'not-configured' } };
  let client;
  try {
    const { Client } = await import('pg'); client = new Client({ connectionString: databaseUrl, connectionTimeoutMillis: 3000 });
    await client.connect(); await client.query('SELECT 1');
    return { ok: true, dependencies: { database: 'ready' } };
  } catch {
    return { ok: false, dependencies: { database: 'unavailable' } };
  } finally { await client?.end().catch(() => {}); }
};

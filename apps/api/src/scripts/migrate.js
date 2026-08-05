import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import { loadConfig } from '../config.js';

const config = loadConfig();
if (!config.databaseUrl) throw new Error('DATABASE_URL is required to run migrations');
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');
const client = new Client({ connectionString: config.databaseUrl });
await client.connect();
try {
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(9137401)');
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
  const applied = new Set((await client.query('SELECT name FROM schema_migrations')).rows.map((row) => row.name));
  for (const name of (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort()) {
    if (applied.has(name)) continue;
    await client.query(await readFile(join(migrationsDir, name), 'utf8'));
    await client.query('INSERT INTO schema_migrations(name) VALUES ($1)', [name]);
    console.log(`Applied ${name}`);
  }
  await client.query('COMMIT');
} catch (error) { await client.query('ROLLBACK'); throw error; } finally { await client.end(); }

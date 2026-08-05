import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/config.js';
import { createReadinessCheck } from '../src/readiness.js';
test('production config requires database and a real signing secret', () => { assert.throws(() => loadConfig({ NODE_ENV: 'production' }), /DATABASE_URL/); assert.throws(() => loadConfig({ NODE_ENV: 'production', DATABASE_URL: 'postgres://localhost/db' }), /JWT_SECRET/); });
test('development readiness allows an intentionally unconfigured database', async () => { assert.deepEqual(await createReadinessCheck({ databaseUrl: null })(), { ok: true, dependencies: { database: 'not-configured' } }); });

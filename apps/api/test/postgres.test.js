import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresRepository } from '../src/persistence/postgres.js';

test('tenant transaction sets RLS context and always releases its connection', async () => {
  const calls = []; let released = false;
  const client = { query: async (sql, params) => { calls.push([sql, params]); }, release: () => { released = true; } };
  const repo = new PostgresRepository({ connect: async () => client });
  const result = await repo.transaction('company-1', async () => 'complete');
  assert.equal(result, 'complete'); assert.equal(released, true);
  assert.deepEqual(calls.map(([sql]) => sql), ['BEGIN', "SELECT set_config('credos.company_id', $1, true)", 'COMMIT']);
  assert.equal(calls[1][1][0], 'company-1');
});
test('tenant transaction rolls back on a failed command', async () => {
  const calls = []; const client = { query: async (sql) => { calls.push(sql); }, release: () => {} };
  const repo = new PostgresRepository({ connect: async () => client });
  await assert.rejects(repo.transaction('company-1', async () => { throw new Error('failed'); }), /failed/);
  assert.deepEqual(calls, ['BEGIN', "SELECT set_config('credos.company_id', $1, true)", 'ROLLBACK']);
});

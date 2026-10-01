import test from 'node:test';
import assert from 'node:assert/strict';
import { ReceivablesRepositories } from '../src/persistence/receivables-repositories.js';
test('customer repository stores money as minor-unit integer parameters', async () => {
  let captured; const repositories = new ReceivablesRepositories({ transaction: async (_company, work) => work({ query: async (sql, values) => { captured = [sql, values]; return { rows: [{ id: 'c', company_id: 'co', name: 'Aster', email: null, phone: null, credit_limit: 12500, status: 'active', created_at: new Date('2026-01-01') }] }; } }) });
  const saved = await repositories.createCustomer('co', { name: 'Aster', creditLimit: 12500 }); assert.equal(saved.creditLimit, 12500); assert.equal(captured[1][4], 12500);
});
test('repository rejects invalid invoice amounts before opening a transaction', async () => { const repositories = new ReceivablesRepositories({ transaction: async () => { throw new Error('should not run'); } }); await assert.rejects(repositories.issueInvoice('co', { customerId: 'c', number: 'I-1', total: -1, dueDate: '2026-09-01' }), /non-negative/); });

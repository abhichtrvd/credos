import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.js';

const start = async () => {
  const server = createServer(); await new Promise((resolve) => server.listen(0, resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
};
const request = (url, path, options = {}) => fetch(`${url}${path}`, { ...options, headers: { 'content-type': 'application/json', ...options.headers } });
test('authenticated customer, invoice, payment, and dashboard flow', async (t) => {
  const { server, url } = await start(); t.after(() => server.close());
  const login = await request(url, '/v1/auth/login', { method: 'POST', body: JSON.stringify({ email: 'admin@credos.local', password: 'ChangeMe123!' }) });
  assert.equal(login.status, 200); const { token } = await login.json(); const headers = { authorization: `Bearer ${token}` };
  const customer = await request(url, '/v1/customers', { method: 'POST', headers, body: JSON.stringify({ name: 'Aster Industries', creditLimit: 500000 }) });
  assert.equal(customer.status, 201); const createdCustomer = await customer.json();
  const invoice = await request(url, '/v1/invoices', { method: 'POST', headers, body: JSON.stringify({ customerId: createdCustomer.id, number: 'INV-1001', total: 120000, dueDate: '2026-09-01' }) });
  const createdInvoice = await invoice.json();
  const payment = await request(url, '/v1/payments', { method: 'POST', headers, body: JSON.stringify({ invoiceId: createdInvoice.id, amount: 20000 }) });
  assert.equal(payment.status, 201);
  const dashboard = await request(url, '/v1/dashboard', { headers });
  assert.deepEqual(await dashboard.json(), { customers: 1, invoices: 1, receivable: 100000, collected: 20000, overdue: 0 });
});
test('business routes reject unauthenticated calls', async (t) => { const { server, url } = await start(); t.after(() => server.close()); const response = await request(url, '/v1/dashboard'); assert.equal(response.status, 401); });
test('module catalog is available to authenticated users', async (t) => { const { server, url } = await start(); t.after(() => server.close()); const login = await request(url, '/v1/auth/login', { method: 'POST', body: JSON.stringify({ email: 'admin@credos.local', password: 'ChangeMe123!' }) }); const { token } = await login.json(); const response = await request(url, '/v1/platform/modules', { headers: { authorization: `Bearer ${token}` } }); const modules = await response.json(); assert.equal(response.status, 200); assert.equal(modules.find((item) => item.id === 'collections').status, 'active'); assert.equal(modules.find((item) => item.id === 'risk').status, 'scaffolded'); });

import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { CredosService } from './domain.js';
import { moduleCatalog } from './modules/catalog.js';
import { loadConfig } from './config.js';
import { createReadinessCheck } from './readiness.js';

const json = (response, status, body) => { response.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': '*' }); response.end(JSON.stringify(body)); };
const body = async (request) => { let data = ''; for await (const chunk of request) data += chunk; return data ? JSON.parse(data) : {}; };
export const createServer = ({ service } = {}) => {
  const config = loadConfig(); const app = service || new CredosService({ secret: config.jwtSecret }); const ready = createReadinessCheck(config);
  if (app.users.size === 0) app.seedAdmin();
  const actor = (request) => app.actor((request.headers.authorization || '').replace(/^Bearer\s+/i, ''));
  const route = async (request, response) => {
  if (request.method === 'OPTIONS') return json(response, 204, {});
  const path = new URL(request.url, 'http://localhost').pathname;
  if (request.method === 'GET' && path === '/health') return json(response, 200, { status: 'ok' });
  if (request.method === 'GET' && path === '/ready') { const result = await ready(); return json(response, result.ok ? 200 : 503, result); }
  if (request.method === 'POST' && path === '/v1/auth/login') { const input = await body(request); return json(response, 200, app.authenticate(input.email, input.password)); }
  const user = actor(request); const input = request.method === 'GET' ? {} : await body(request);
  if (request.method === 'GET' && path === '/v1/company') return json(response, 200, app.companies.get(user.companyId));
  if (request.method === 'PATCH' && path === '/v1/company') return json(response, 200, app.updateCompany(user, input));
  if (request.method === 'POST' && path === '/v1/users') return json(response, 201, app.createUser(user, input));
  if (request.method === 'POST' && path === '/v1/customers') return json(response, 201, app.createCustomer(user.companyId, input));
  if (request.method === 'GET' && path === '/v1/customers') return json(response, 200, app.listCustomers(user.companyId));
  if (request.method === 'POST' && path === '/v1/invoices') return json(response, 201, app.issueInvoice(user.companyId, input));
  if (request.method === 'GET' && path === '/v1/invoices') return json(response, 200, app.listInvoices(user.companyId));
  const cancellation = path.match(/^\/v1\/invoices\/([^/]+)\/cancel$/);
  if (request.method === 'POST' && cancellation) return json(response, 200, app.cancelInvoice(user, cancellation[1]));
  if (request.method === 'POST' && path === '/v1/payments') return json(response, 201, app.recordPayment(user.companyId, input));
  if (request.method === 'GET' && path === '/v1/payments') return json(response, 200, app.listPayments(user.companyId));
  if (request.method === 'POST' && path === '/v1/collections') return json(response, 201, app.openCollectionCase(user, input));
  if (request.method === 'GET' && path === '/v1/collections') return json(response, 200, app.listCollectionCases(user.companyId));
  const promiseRoute = path.match(/^\/v1\/collections\/([^/]+)\/promises$/);
  if (request.method === 'POST' && promiseRoute) return json(response, 201, app.recordPromise(user, promiseRoute[1], input));
  if (request.method === 'GET' && path === '/v1/dashboard') return json(response, 200, app.dashboard(user.companyId));
  if (request.method === 'GET' && path === '/v1/platform/modules') return json(response, 200, moduleCatalog);
  return json(response, 404, { error: 'route not found' });
  };
  return http.createServer((request, response) => route(request, response).catch((error) => json(response, error.message.includes('token') ? 401 : error.message.includes('permission') ? 403 : 400, { error: error.message })));
};
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) { const config = loadConfig(); createServer().listen(config.port, () => console.log(`CredOS API listening on ${config.port}`)); }

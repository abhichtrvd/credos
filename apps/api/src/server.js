import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { CredosService } from './domain.js';

const json = (response, status, body) => { response.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': '*' }); response.end(JSON.stringify(body)); };
const body = async (request) => { let data = ''; for await (const chunk of request) data += chunk; return data ? JSON.parse(data) : {}; };
export const createServer = ({ service } = {}) => {
  const app = service || new CredosService({ secret: process.env.JWT_SECRET || 'local-development-secret' });
  if (app.users.size === 0) app.seedAdmin();
  const actor = (request) => app.actor((request.headers.authorization || '').replace(/^Bearer\s+/i, ''));
  const route = async (request, response) => {
  if (request.method === 'OPTIONS') return json(response, 204, {});
  const path = new URL(request.url, 'http://localhost').pathname;
  if (request.method === 'GET' && path === '/health') return json(response, 200, { status: 'ok' });
  if (request.method === 'POST' && path === '/v1/auth/login') { const input = await body(request); return json(response, 200, app.authenticate(input.email, input.password)); }
  const user = actor(request); const input = request.method === 'GET' ? {} : await body(request);
  if (request.method === 'GET' && path === '/v1/company') return json(response, 200, app.companies.get(user.companyId));
  if (request.method === 'POST' && path === '/v1/users') return json(response, 201, app.createUser(user, input));
  if (request.method === 'POST' && path === '/v1/customers') return json(response, 201, app.createCustomer(user.companyId, input));
  if (request.method === 'GET' && path === '/v1/customers') return json(response, 200, app.listCustomers(user.companyId));
  if (request.method === 'POST' && path === '/v1/invoices') return json(response, 201, app.issueInvoice(user.companyId, input));
  if (request.method === 'GET' && path === '/v1/invoices') return json(response, 200, app.listInvoices(user.companyId));
  if (request.method === 'POST' && path === '/v1/payments') return json(response, 201, app.recordPayment(user.companyId, input));
  if (request.method === 'GET' && path === '/v1/dashboard') return json(response, 200, app.dashboard(user.companyId));
  return json(response, 404, { error: 'route not found' });
  };
  return http.createServer((request, response) => route(request, response).catch((error) => json(response, error.message.includes('token') ? 401 : 400, { error: error.message })));
};
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) createServer().listen(process.env.PORT || 3000, () => console.log('CredOS API listening'));

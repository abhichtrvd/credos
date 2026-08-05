import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export const money = (value) => {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('amount must be a non-negative integer in minor units');
  return value;
};

export class CredosService {
  constructor({ secret = 'local-development-secret', now = () => new Date() } = {}) {
    this.secret = secret;
    this.now = now;
    this.companies = new Map(); this.users = new Map(); this.customers = new Map();
    this.invoices = new Map(); this.payments = new Map(); this.allocations = new Map();
  }
  seedAdmin({ email = 'admin@credos.local', password = 'ChangeMe123!', name = 'CredOS Admin' } = {}) {
    const company = this.createCompany({ name: 'CredOS Demo' });
    const user = { id: randomUUID(), companyId: company.id, email: email.toLowerCase(), name, passwordHash: hashPassword(password), role: 'owner' };
    this.users.set(user.id, user); return { company, user };
  }
  createCompany({ name, currency = 'INR' }) {
    if (!name?.trim()) throw new Error('company name is required');
    const company = { id: randomUUID(), name: name.trim(), currency, createdAt: this.now().toISOString() };
    this.companies.set(company.id, company); return company;
  }
  authenticate(email, password) {
    const user = [...this.users.values()].find((item) => item.email === String(email).toLowerCase());
    if (!user || !verifyPassword(password, user.passwordHash)) throw new Error('invalid email or password');
    return { token: sign({ sub: user.id, companyId: user.companyId, role: user.role }, this.secret), user: publicUser(user) };
  }
  actor(token) { const claims = verify(token, this.secret); const user = this.users.get(claims.sub); if (!user) throw new Error('user not found'); return user; }
  createCustomer(companyId, input) {
    if (!input.name?.trim()) throw new Error('customer name is required');
    const customer = { id: randomUUID(), companyId, name: input.name.trim(), email: input.email || null, phone: input.phone || null, creditLimit: money(input.creditLimit ?? 0), status: 'active', createdAt: this.now().toISOString() };
    this.customers.set(customer.id, customer); return customer;
  }
  listCustomers(companyId) { return [...this.customers.values()].filter((item) => item.companyId === companyId); }
  issueInvoice(companyId, input) {
    const customer = this.customers.get(input.customerId);
    if (!customer || customer.companyId !== companyId) throw new Error('customer not found');
    const total = money(input.total);
    if (!input.dueDate || Number.isNaN(Date.parse(input.dueDate))) throw new Error('valid dueDate is required');
    const invoice = { id: randomUUID(), companyId, customerId: customer.id, number: input.number?.trim() || `INV-${Date.now()}`, total, dueDate: input.dueDate, issuedAt: this.now().toISOString(), status: 'open' };
    this.invoices.set(invoice.id, invoice); return this.invoiceView(invoice);
  }
  invoiceView(invoice) { const paid = [...this.allocations.values()].filter((a) => a.invoiceId === invoice.id).reduce((sum, a) => sum + a.amount, 0); return { ...invoice, paid, outstanding: invoice.total - paid, status: paid === invoice.total ? 'paid' : invoice.status }; }
  listInvoices(companyId) { return [...this.invoices.values()].filter((item) => item.companyId === companyId).map((item) => this.invoiceView(item)); }
  recordPayment(companyId, input) {
    const invoice = this.invoices.get(input.invoiceId); if (!invoice || invoice.companyId !== companyId) throw new Error('invoice not found');
    const amount = money(input.amount); const view = this.invoiceView(invoice);
    if (amount === 0 || amount > view.outstanding) throw new Error('payment must be greater than zero and no more than outstanding');
    const payment = { id: randomUUID(), companyId, customerId: invoice.customerId, amount, method: input.method || 'bank_transfer', receivedAt: input.receivedAt || this.now().toISOString() };
    this.payments.set(payment.id, payment); this.allocations.set(randomUUID(), { id: randomUUID(), paymentId: payment.id, invoiceId: invoice.id, amount }); return { payment, invoice: this.invoiceView(invoice) };
  }
  dashboard(companyId) { const invoices = this.listInvoices(companyId); const customers = this.listCustomers(companyId); return { customers: customers.length, invoices: invoices.length, receivable: invoices.reduce((sum, i) => sum + i.outstanding, 0), collected: invoices.reduce((sum, i) => sum + i.paid, 0), overdue: invoices.filter((i) => i.outstanding > 0 && new Date(i.dueDate) < this.now()).reduce((sum, i) => sum + i.outstanding, 0) }; }
}

const hashPassword = (password) => createHash('sha256').update(String(password)).digest('hex');
const verifyPassword = (password, expected) => timingSafeEqual(Buffer.from(hashPassword(password)), Buffer.from(expected));
const publicUser = ({ passwordHash, ...user }) => user;
const enc = (data) => Buffer.from(JSON.stringify(data)).toString('base64url');
const sign = (payload, secret) => { const body = enc({ ...payload, exp: Math.floor(Date.now() / 1000) + 3600 }); return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`; };
const verify = (token, secret) => { const [body, signature] = String(token).split('.'); const expected = createHmac('sha256', secret).update(body).digest('base64url'); if (!body || !signature || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error('invalid token'); const data = JSON.parse(Buffer.from(body, 'base64url')); if (data.exp < Date.now() / 1000) throw new Error('expired token'); return data; };

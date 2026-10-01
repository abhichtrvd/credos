import { money } from '../domain.js';

const customer = (row) => ({ id: row.id, companyId: row.company_id, name: row.name, email: row.email, phone: row.phone, creditLimit: Number(row.credit_limit), status: row.status, createdAt: row.created_at.toISOString() });
const invoice = (row) => ({ id: row.id, companyId: row.company_id, customerId: row.customer_id, number: row.number, total: Number(row.total), paid: Number(row.paid || 0), outstanding: Number(row.outstanding || 0), dueDate: row.due_date.toISOString().slice(0, 10), issuedAt: row.issued_at.toISOString(), status: row.status });
const payment = (row) => ({ id: row.id, companyId: row.company_id, customerId: row.customer_id, amount: Number(row.amount), method: row.method, receivedAt: row.received_at.toISOString() });

export class ReceivablesRepositories {
  constructor(repository) { this.repository = repository; }
  async createCustomer(companyId, input) {
    if (!input.name?.trim()) throw new Error('customer name is required');
    return this.repository.transaction(companyId, async (client) => customer((await client.query('INSERT INTO customers(company_id, name, email, phone, credit_limit) VALUES ($1, $2, $3, $4, $5) RETURNING *', [companyId, input.name.trim(), input.email || null, input.phone || null, money(input.creditLimit ?? 0)])).rows[0]));
  }
  async listCustomers(companyId) { return this.repository.transaction(companyId, async (client) => (await client.query('SELECT * FROM customers WHERE company_id = $1 ORDER BY created_at DESC', [companyId])).rows.map(customer)); }
  async issueInvoice(companyId, input) {
    const total = money(input.total); if (!input.dueDate || Number.isNaN(Date.parse(input.dueDate))) throw new Error('valid dueDate is required'); if (!input.number?.trim()) throw new Error('invoice number is required');
    return this.repository.transaction(companyId, async (client) => {
      const customerResult = await client.query('SELECT * FROM customers WHERE id = $1 AND company_id = $2 FOR UPDATE', [input.customerId, companyId]); if (!customerResult.rowCount) throw new Error('customer not found');
      const exposure = await client.query("SELECT COALESCE(SUM(i.total - COALESCE(p.paid, 0)), 0) AS outstanding FROM invoices i LEFT JOIN (SELECT invoice_id, SUM(amount) AS paid FROM payment_allocations GROUP BY invoice_id) p ON p.invoice_id = i.id WHERE i.company_id = $1 AND i.customer_id = $2 AND i.status <> 'cancelled'", [companyId, input.customerId]);
      if (Number(customerResult.rows[0].credit_limit) > 0 && Number(exposure.rows[0].outstanding) + total > Number(customerResult.rows[0].credit_limit)) throw new Error('invoice exceeds customer credit limit');
      try { const inserted = await client.query('INSERT INTO invoices(company_id, customer_id, number, total, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *, 0::bigint AS paid, total AS outstanding', [companyId, input.customerId, input.number.trim(), total, input.dueDate]); return invoice(inserted.rows[0]); } catch (error) { if (error.code === '23505') throw new Error('invoice number already exists'); throw error; }
    });
  }
  async listInvoices(companyId) { return this.repository.transaction(companyId, async (client) => (await client.query("SELECT i.*, COALESCE(p.paid, 0) AS paid, CASE WHEN i.status = 'cancelled' THEN 0 ELSE i.total - COALESCE(p.paid, 0) END AS outstanding FROM invoices i LEFT JOIN (SELECT invoice_id, SUM(amount) AS paid FROM payment_allocations GROUP BY invoice_id) p ON p.invoice_id = i.id WHERE i.company_id = $1 ORDER BY i.issued_at DESC", [companyId])).rows.map(invoice)); }
  async recordPayment(companyId, input) {
    const amount = money(input.amount); if (!amount) throw new Error('payment must be greater than zero and no more than outstanding');
    return this.repository.transaction(companyId, async (client) => {
      const invoiceResult = await client.query("SELECT i.*, COALESCE(p.paid, 0) AS paid FROM invoices i LEFT JOIN (SELECT invoice_id, SUM(amount) AS paid FROM payment_allocations GROUP BY invoice_id) p ON p.invoice_id = i.id WHERE i.id = $1 AND i.company_id = $2 FOR UPDATE", [input.invoiceId, companyId]); if (!invoiceResult.rowCount) throw new Error('invoice not found');
      const source = invoiceResult.rows[0]; const outstanding = source.status === 'cancelled' ? 0 : Number(source.total) - Number(source.paid); if (amount > outstanding) throw new Error('payment must be greater than zero and no more than outstanding');
      const created = await client.query('INSERT INTO payments(company_id, customer_id, amount, method, received_at) VALUES ($1, $2, $3, $4, $5) RETURNING *', [companyId, source.customer_id, amount, input.method || 'bank_transfer', input.receivedAt || new Date().toISOString()]);
      await client.query('INSERT INTO payment_allocations(payment_id, invoice_id, amount) VALUES ($1, $2, $3)', [created.rows[0].id, source.id, amount]);
      return { payment: payment(created.rows[0]), invoice: invoice({ ...source, paid: Number(source.paid) + amount, outstanding: outstanding - amount }) };
    });
  }
}

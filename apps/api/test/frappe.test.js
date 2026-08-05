import test from 'node:test';
import assert from 'node:assert/strict';
import { frappeInvoiceToCredos, credosPaymentToFrappe } from '../src/integrations/frappe.js';
test('maps ERPNext money values at the integration boundary', () => { assert.deepEqual(frappeInvoiceToCredos({ name: 'SINV-001', grand_total: '124.50', due_date: '2026-09-01' }, 'customer-1'), { customerId: 'customer-1', number: 'SINV-001', total: 12450, dueDate: '2026-09-01' }); assert.equal(credosPaymentToFrappe({ id: 'pay-1', amount: 5000, receivedAt: '2026-08-05T00:00:00.000Z', method: 'upi' }).paid_amount, 50); });

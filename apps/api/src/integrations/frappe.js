// Pure mapping functions keep ERPNext transport code away from CredOS domain rules.
export const frappeInvoiceToCredos = (invoice, customerId) => ({
  customerId,
  number: invoice.name,
  total: Math.round(Number(invoice.grand_total) * 100),
  dueDate: invoice.due_date
});
export const credosPaymentToFrappe = (payment) => ({
  reference_no: payment.id,
  paid_amount: payment.amount / 100,
  posting_date: payment.receivedAt.slice(0, 10),
  mode_of_payment: payment.method
});

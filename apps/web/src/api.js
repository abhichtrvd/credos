const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const createClient = (token) => {
  const request = async (path, options = {}) => { const response = await fetch(`${baseUrl}${path}`, { ...options, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...options.headers } }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Request failed'); return data; };
  return {
    login: (email, password) => request('/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    dashboard: () => request('/v1/dashboard'), customers: () => request('/v1/customers'), invoices: () => request('/v1/invoices'),
    createCustomer: (input) => request('/v1/customers', { method: 'POST', body: JSON.stringify(input) }),
    createInvoice: (input) => request('/v1/invoices', { method: 'POST', body: JSON.stringify(input) }),
    recordPayment: (input) => request('/v1/payments', { method: 'POST', body: JSON.stringify(input) })
  };
};

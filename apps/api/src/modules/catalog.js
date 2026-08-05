export const moduleCatalog = [
  { id: 'identity', name: 'Identity & access', status: 'active', capabilities: ['users', 'roles', 'sessions', 'audit'] },
  { id: 'companies', name: 'Companies', status: 'active', capabilities: ['tenant-profile', 'currency', 'settings'] },
  { id: 'customers', name: 'Customers & credit', status: 'active', capabilities: ['customer-profile', 'credit-limits', 'exposure'] },
  { id: 'receivables', name: 'Receivables', status: 'active', capabilities: ['invoices', 'payments', 'allocations'] },
  { id: 'collections', name: 'Collections', status: 'active', capabilities: ['cases', 'assignment', 'promises-to-pay'] },
  { id: 'communications', name: 'Communications', status: 'scaffolded', capabilities: ['templates', 'email', 'sms', 'whatsapp'] },
  { id: 'risk', name: 'Risk intelligence', status: 'scaffolded', capabilities: ['scores', 'policies', 'explanations'] },
  { id: 'trust', name: 'Trust network', status: 'scaffolded', capabilities: ['disputes', 'consent', 'reputation'] },
  { id: 'reporting', name: 'Reporting', status: 'scaffolded', capabilities: ['aging', 'collections-performance', 'exports'] },
  { id: 'integrations', name: 'Integrations', status: 'scaffolded', capabilities: ['erpnext', 'webhooks', 'api-keys'] }
];

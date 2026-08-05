-- Application connections must use a non-owner role. The repository sets credos.company_id per transaction.
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY companies_tenant_isolation ON companies
  USING (id = NULLIF(current_setting('credos.company_id', true), '')::uuid)
  WITH CHECK (id = NULLIF(current_setting('credos.company_id', true), '')::uuid);

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['users', 'customers', 'invoices', 'payments', 'audit_events', 'collection_cases', 'promises_to_pay', 'outbox_events', 'communication_templates', 'communication_deliveries', 'risk_policies', 'risk_score_runs', 'trust_consents', 'disputes', 'integration_connections', 'report_exports']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('CREATE POLICY %I ON %I USING (company_id = NULLIF(current_setting(''credos.company_id'', true), '''')::uuid) WITH CHECK (company_id = NULLIF(current_setting(''credos.company_id'', true), '''')::uuid)', table_name || '_tenant_isolation', table_name);
  END LOOP;
END $$;

ALTER TABLE payment_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY payment_allocations_tenant_isolation ON payment_allocations
  USING (EXISTS (SELECT 1 FROM payments WHERE payments.id = payment_allocations.payment_id AND payments.company_id = NULLIF(current_setting('credos.company_id', true), '')::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM payments WHERE payments.id = payment_allocations.payment_id AND payments.company_id = NULLIF(current_setting('credos.company_id', true), '')::uuid));

ALTER TABLE integration_sync_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY integration_sync_mappings_tenant_isolation ON integration_sync_mappings
  USING (EXISTS (SELECT 1 FROM integration_connections WHERE integration_connections.id = integration_sync_mappings.connection_id AND integration_connections.company_id = NULLIF(current_setting('credos.company_id', true), '')::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM integration_connections WHERE integration_connections.id = integration_sync_mappings.connection_id AND integration_connections.company_id = NULLIF(current_setting('credos.company_id', true), '')::uuid));

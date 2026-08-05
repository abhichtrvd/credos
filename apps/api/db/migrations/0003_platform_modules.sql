-- Shared reliable-event boundary. Publishers write here in the same transaction as domain changes.
CREATE TABLE outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id),
  topic text NOT NULL, aggregate_type text NOT NULL, aggregate_id uuid NOT NULL, payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz, attempts integer NOT NULL DEFAULT 0
);
CREATE INDEX outbox_events_unpublished_idx ON outbox_events(occurred_at) WHERE published_at IS NULL;

CREATE TABLE communication_templates (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id), channel text NOT NULL CHECK (channel IN ('email','sms','whatsapp')), name text NOT NULL, body text NOT NULL, status text NOT NULL DEFAULT 'draft', UNIQUE(company_id, channel, name));
CREATE TABLE communication_deliveries (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id), template_id uuid REFERENCES communication_templates(id), customer_id uuid REFERENCES customers(id), channel text NOT NULL, status text NOT NULL DEFAULT 'queued', provider_message_id text, requested_at timestamptz NOT NULL DEFAULT now(), delivered_at timestamptz);

CREATE TABLE risk_policies (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id), name text NOT NULL, version integer NOT NULL, definition jsonb NOT NULL, status text NOT NULL DEFAULT 'draft', UNIQUE(company_id, name, version));
CREATE TABLE risk_score_runs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id), customer_id uuid NOT NULL REFERENCES customers(id), policy_id uuid REFERENCES risk_policies(id), score numeric(5,2), factors jsonb NOT NULL DEFAULT '[]', created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE trust_consents (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id), customer_id uuid NOT NULL REFERENCES customers(id), purpose text NOT NULL, granted_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz);
CREATE TABLE disputes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id), customer_id uuid NOT NULL REFERENCES customers(id), invoice_id uuid REFERENCES invoices(id), reason text NOT NULL, status text NOT NULL DEFAULT 'open', opened_at timestamptz NOT NULL DEFAULT now(), resolved_at timestamptz);

CREATE TABLE integration_connections (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id), provider text NOT NULL, encrypted_config jsonb NOT NULL DEFAULT '{}', status text NOT NULL DEFAULT 'disabled', created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(company_id, provider));
CREATE TABLE integration_sync_mappings (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), connection_id uuid NOT NULL REFERENCES integration_connections(id), external_type text NOT NULL, external_id text NOT NULL, credos_type text NOT NULL, credos_id uuid NOT NULL, synced_at timestamptz NOT NULL DEFAULT now(), UNIQUE(connection_id, external_type, external_id));
CREATE TABLE report_exports (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id), report_type text NOT NULL, filters jsonb NOT NULL DEFAULT '{}', status text NOT NULL DEFAULT 'queued', object_key text, requested_by uuid NOT NULL REFERENCES users(id), requested_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz);

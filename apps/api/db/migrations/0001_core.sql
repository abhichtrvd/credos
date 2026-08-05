-- CredOS core schema. Apply via the deployment migration runner, never manually in production.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) > 0),
  currency char(3) NOT NULL DEFAULT 'INR',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id),
  email citext NOT NULL, name text NOT NULL, password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner','manager','operator','viewer')), created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, email)
);
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id), name text NOT NULL,
  email text, phone text, credit_limit bigint NOT NULL DEFAULT 0 CHECK (credit_limit >= 0), status text NOT NULL DEFAULT 'active', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id), customer_id uuid NOT NULL REFERENCES customers(id),
  number text NOT NULL, total bigint NOT NULL CHECK (total >= 0), due_date date NOT NULL, issued_at timestamptz NOT NULL DEFAULT now(), status text NOT NULL DEFAULT 'open', UNIQUE(company_id, number)
);
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id), customer_id uuid NOT NULL REFERENCES customers(id), amount bigint NOT NULL CHECK (amount > 0), method text NOT NULL, received_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE payment_allocations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), payment_id uuid NOT NULL REFERENCES payments(id), invoice_id uuid NOT NULL REFERENCES invoices(id), amount bigint NOT NULL CHECK (amount > 0), UNIQUE(payment_id, invoice_id));
CREATE TABLE audit_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id), actor_id uuid REFERENCES users(id), action text NOT NULL, entity_type text NOT NULL, entity_id uuid NOT NULL, occurred_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX invoices_company_due_idx ON invoices(company_id, due_date);
CREATE INDEX audit_events_company_occurred_idx ON audit_events(company_id, occurred_at DESC);

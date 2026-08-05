CREATE TABLE collection_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id), invoice_id uuid NOT NULL REFERENCES invoices(id),
  customer_id uuid NOT NULL REFERENCES customers(id), assigned_to uuid NOT NULL REFERENCES users(id), status text NOT NULL CHECK (status IN ('open','closed')),
  opened_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX collection_cases_one_open_invoice_idx ON collection_cases(invoice_id) WHERE status = 'open';
CREATE TABLE promises_to_pay (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES companies(id), collection_case_id uuid NOT NULL REFERENCES collection_cases(id),
  amount bigint NOT NULL CHECK (amount > 0), due_date date NOT NULL, status text NOT NULL CHECK (status IN ('open','kept','broken','cancelled')),
  created_by uuid NOT NULL REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX collection_cases_company_assignee_idx ON collection_cases(company_id, assigned_to) WHERE status = 'open';

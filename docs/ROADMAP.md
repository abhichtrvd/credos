# CredOS roadmap

## Sprint 0 — Foundation (completed in this baseline)

- Monorepo, local Docker stack, CI, standards, and architectural guardrails.
- React, Flutter, and Frappe application scaffolds.

## Sprint 1 — Core receivables

- [x] Executable API domain for authentication, company, customer, invoice, payment, and dashboard.
- [x] Unit tests for payment and invoice invariants.
- [ ] PostgreSQL schema, migrations, and repository adapter.
- [ ] Role/permission matrix, audit log, password reset, and refresh sessions.
- [ ] Responsive production screens and end-to-end tests.

## Sprint 2 — Collections

Promises-to-pay, assignment queues, automated reminders, collection activity timeline, and WhatsApp/email/SMS connectors.

The case, assignment, and promise domain is implemented locally. Communications provider delivery, collection activity, and reminder jobs are scaffolded next.

## Sprint 3 — Intelligence

Credit policy configuration, payment prediction, explainable risk scores, and a governed collections copilot.

## Sprint 4 — Trust and enterprise

Disputes, consented data sharing, ERP connectors, public API/SDK, multi-region operations, and compliance controls.

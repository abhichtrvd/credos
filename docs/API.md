# API reference — Sprint 1

All application routes are prefixed with `/v1`. Except login and health, pass `Authorization: Bearer <access-token>`. Amounts are integers in the company's smallest currency unit.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/auth/login` | Exchange email/password for a one-hour access token |
| `GET` | `/v1/company` | Get the authenticated company |
| `POST` | `/v1/users` | Owner-only user provisioning |
| `GET, POST` | `/v1/customers` | List or create company customers |
| `GET, POST` | `/v1/invoices` | List or issue invoices |
| `POST` | `/v1/payments` | Record a payment against one invoice |
| `GET` | `/v1/dashboard` | Get receivables and collections aggregates |

The development seed account is `admin@credos.local` / `ChangeMe123!`. It exists solely for the local development adapter; do not ship it or the development token secret.

`POST /v1/users` accepts `name`, `email`, `password`, and one of `owner`, `manager`, `operator`, or `viewer` as `role`. Authorization follows a deny-by-default role hierarchy. Persistent deployment uses the PostgreSQL migration under `apps/api/db/migrations`.

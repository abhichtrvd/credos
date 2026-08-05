# API reference — Sprint 1

All application routes are prefixed with `/v1`. Except login and health, pass `Authorization: Bearer <access-token>`. Amounts are integers in the company's smallest currency unit.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/auth/login` | Exchange email/password for a one-hour access token |
| `GET` | `/v1/company` | Get the authenticated company |
| `PATCH` | `/v1/company` | Owner-only company name/currency update |
| `POST` | `/v1/users` | Owner-only user provisioning |
| `GET, POST` | `/v1/customers` | List or create company customers |
| `GET, POST` | `/v1/invoices` | List or issue invoices |
| `POST` | `/v1/invoices/:id/cancel` | Manager-or-owner cancellation of an unpaid invoice |
| `POST` | `/v1/payments` | Record a payment against one invoice |
| `GET` | `/v1/payments` | List company payment history |
| `GET, POST` | `/v1/collections` | List open/closed collection cases or open one for an overdue invoice |
| `POST` | `/v1/collections/:id/promises` | Record a promise-to-pay against an open case |
| `GET` | `/v1/dashboard` | Get receivables and collections aggregates |

The development seed account is `admin@credos.local` / `ChangeMe123!`. It exists solely for the local development adapter; do not ship it or the development token secret.

`POST /v1/users` accepts `name`, `email`, `password`, and one of `owner`, `manager`, `operator`, or `viewer` as `role`. Authorization follows a deny-by-default role hierarchy. Persistent deployment uses the PostgreSQL migration under `apps/api/db/migrations`.

Invoice numbers are unique within a company. When a customer has a positive `creditLimit`, new invoices are rejected if their unpaid balance plus the new invoice exceeds that limit. A credit limit of `0` means no limit has been configured.

Only managers and owners can open an overdue-invoice collection case. Collectors (`operator` or above) can record a promise-to-pay; its amount may not exceed the current invoice balance.

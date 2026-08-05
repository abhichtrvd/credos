# CredOS

CredOS is a multi-tenant credit operations platform for customer credit, invoices, collections, payments, and risk-aware decisioning.

## Repository map

| Path | Purpose |
| --- | --- |
| `apps/api` | Tenant-aware REST API and core business modules |
| `apps/web` | React operations console |
| `apps/mobile` | Flutter field-collections application |
| `apps/frappe/credos` | ERPNext/Frappe integration app |
| `docs` | Product, architecture, operational, and delivery documentation |

## Quick start

1. Copy `.env.example` to `.env`.
2. Run `docker compose up --build` for PostgreSQL, Redis, the API, and web app.
3. Or install pnpm and run `pnpm install && pnpm dev` for local web/API development.

The API starts on `http://localhost:3000`; the web app starts on `http://localhost:5173`.

## Sprint 1 API

The initial API is deliberately dependency-light so its business rules are executable on a fresh checkout. It provides versioned endpoints for authentication, companies, customers, invoices, payments, and dashboard metrics. In-memory storage is a development adapter; replace it with the PostgreSQL repository before any production deployment.

See [architecture](docs/ARCHITECTURE.md), [roadmap](docs/ROADMAP.md), and [contributing guidance](docs/CODING_STANDARDS.md).

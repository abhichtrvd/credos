# Local development

Copy `.env.example` to `.env`, then use `docker compose up --build`. The API container runs migrations before starting and is ready only after PostgreSQL answers a query.

For a host-run API, install dependencies in `apps/api`, set `DATABASE_URL`, run `npm run migrate`, then `npm run dev`. The in-memory application adapter remains available for fast unit tests; the next implementation floor replaces it with the PostgreSQL repository.

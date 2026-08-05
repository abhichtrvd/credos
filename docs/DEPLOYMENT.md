# Deployment skeleton

## Environments

`local` uses Docker Compose. `staging` and `production` must each have isolated PostgreSQL, Redis, secrets, object storage, monitoring, and outbound-provider credentials.

## Release gates

1. Apply tested migrations in a backwards-compatible release.
2. Run API unit/integration tests, frontend build, mobile tests, dependency audit, and smoke checks.
3. Deploy application containers with immutable image digests.
4. Verify health, error rate, job queues, database connections, and critical dashboard flows before promotion.

Never use the development seed account, in-memory adapter, or default token secret outside local development.

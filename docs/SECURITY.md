# Security baseline

- Tenant ID comes from the authenticated server-side actor; clients never select an authorization tenant.
- Passwords use a salted memory-hard derivation. Production deployments must use Argon2id with configured parameters and refresh-session rotation.
- Store secrets in a managed secret store, rotate signing and integration credentials, and never log bearer tokens or PII.
- Enforce PostgreSQL row-level security using the transaction-scoped company context. Audit access to customer, financial, and trust data.
- Encrypt in transit and at rest; minimise personal data and define data retention/deletion procedures before onboarding customers.
- Add rate limits, CSRF protection where cookies are used, dependency scanning, SAST, SBOM generation, backups, and incident response runbooks before launch.

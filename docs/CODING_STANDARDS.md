# Coding standards

- Keep modules small, typed, and domain-oriented. Do not expose persistence entities directly from HTTP handlers.
- Authenticate before authorizing; authorization is tenant-scoped and deny-by-default.
- Store money in minor units (integer paise/cents), never floating point.
- Validate all external input and return problem-shaped errors without internal details.
- Require tests for financial invariants and tenant-boundary behavior.
- Never commit credentials, production data, or secrets. Add migrations for every persistent schema change.
- Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.

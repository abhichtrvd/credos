# API module boundaries

Each module owns its commands, query projections, permissions, migrations, events, and tests. Cross-module writes use explicit application services and an outbox event; no module reads another module's persistence tables directly.

| Module | First production implementation |
| --- | --- |
| identity | Users, roles, sessions, audit events |
| companies | Tenant configuration and operational preferences |
| customers | Customer profile, credit exposure, credit policy evaluation |
| receivables | Invoice, payment, allocation, write-off lifecycle |
| collections | Cases, activities, promises, assignments, reminders |
| communications | Template approval, delivery attempts, provider callbacks |
| risk | Feature snapshots, versioned scores, human-readable factors |
| trust | Consent, disputes, shared-obligation records, reputation events |
| reporting | Immutable reporting views, scheduled exports |
| integrations | ERP sync mappings, API credentials, webhook deliveries |

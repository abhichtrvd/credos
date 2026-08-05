# Event and job skeleton

Transactional domain commands enqueue a small `outbox_events` record. A separate worker claims unpublished rows, delivers webhooks/communications/report jobs with idempotency keys, and marks each event published only after success. Consumers must tolerate duplicate deliveries.

Initial topics: `invoice.issued`, `payment.recorded`, `collection.case.opened`, `collection.promise.recorded`, `risk.score.created`, and `trust.dispute.opened`.

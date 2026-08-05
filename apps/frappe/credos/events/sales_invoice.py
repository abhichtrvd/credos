import frappe

def on_submit(doc, method=None):
    """Queue a sync event; workers deliver it with an idempotency key."""
    frappe.enqueue("credos.events.publish_invoice", queue="short", invoice_name=doc.name, enqueue_after_commit=True)

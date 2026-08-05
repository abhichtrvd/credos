import frappe

def publish_invoice(invoice_name):
    """Integration-worker entrypoint. Configure the CredOS API client before enabling in a site."""
    invoice = frappe.get_doc("Sales Invoice", invoice_name)
    frappe.logger("credos").info({"event": "sales_invoice_submitted", "invoice": invoice.name})

import frappe

@frappe.whitelist()
def healthcheck():
    """Connector health endpoint; requires an authenticated Frappe session."""
    return {"status": "ok", "service": "credos-erpnext-connector"}

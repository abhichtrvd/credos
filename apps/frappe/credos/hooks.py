app_name = "credos"
app_title = "CredOS"
app_publisher = "CredOS"
app_description = "ERPNext connector for CredOS"
app_email = "engineering@credos.local"
app_license = "AGPL-3.0"
doctype_js = {"Sales Invoice": "public/js/sales_invoice.js"}
doc_events = {"Sales Invoice": {"on_submit": "credos.events.sales_invoice.on_submit"}}

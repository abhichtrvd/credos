frappe.ui.form.on('Sales Invoice', {
  refresh(frm) {
    if (frm.doc.docstatus === 1) frm.add_custom_button(__('View CredOS Sync'), () => frappe.msgprint(__('CredOS sync is queued after submission.')));
  }
});

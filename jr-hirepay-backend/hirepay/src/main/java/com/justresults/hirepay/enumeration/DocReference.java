package com.justresults.hirepay.enumeration;

/**
 * Canonical document “slots” in the flow. These keys drive uploads,
 * generation, and checklists in UI and services.
 */
public enum DocReference {
    // Get Hired
    UMBRELLA_AGREEMENT,
    AGREEMENT_MODIFICATION,
    TAX_FORM_W9,
    TAX_FORM_W8BEN,
    PAYMENT_AUTH_FORM,
    TASK_ORDER,
    TASK_ORDER_MODIFICATION,

    // Get Paid
    INVOICE,
    DELIVERABLES_PROOF
}

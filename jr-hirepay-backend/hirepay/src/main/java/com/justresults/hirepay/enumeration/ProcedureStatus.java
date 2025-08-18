package com.justresults.hirepay.enumeration;

/**
 * Keep states granular enough for UI gating and BO/BBO tasks.
 * We can extend later if needed.
 */
public enum ProcedureStatus {
    DRAFT,                    // created, before any signatures/forms
    AGREEMENT_SENT,           // umbrella agreement generated/sent
    AGREEMENT_SIGNED,         // signed umbrella received
    PAYMENT_TAX_SUBMITTED,    // payment authorization + tax form uploaded
    PAYMENT_TAX_APPROVED,     // BO reviewed/approved those
    TASK_ORDER_GENERATED,     // TO created from scope
    TASK_ORDER_SIGNED,        // signed TO received
    COMPLETED,                // archived + back-office filing done
    REJECTED                  // any step failed/rejected
}

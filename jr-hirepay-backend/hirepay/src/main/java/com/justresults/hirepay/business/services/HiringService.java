package com.justresults.hirepay.business.services;

import com.justresults.hirepay.domain.Procedure;
import com.justresults.hirepay.domain.ProcedureDocument;
import com.justresults.hirepay.enumeration.DocReference;

public interface HiringService {

    Procedure createHiringProcedure(String consultantEmail, String consultantName);

    Procedure getByUuid(String uuid);

    // record a document (controller will handle file upload and pass a storage location)
    ProcedureDocument addDocument(String uuid, DocReference ref, String location, String actorEmail);

    // workflow transitions
    Procedure markAgreementSigned(String uuid);

    Procedure markPaymentTaxSubmitted(String uuid);

    Procedure approvePaymentTax(String uuid, boolean approved, String notes);

    Procedure markTaskOrderGenerated(String uuid);

    Procedure markTaskOrderSigned(String uuid);

    /**
     * Accept the Task Order with detailed tracking information.
     * This method validates the current state and records acceptance details.
     */
    Procedure acceptTaskOrder(String uuid, String acceptedBy, String acceptedFrom);

    Procedure archive(String uuid);
}

package com.justresults.hirepay.business.services;

import com.justresults.hirepay.domain.ProcedureDocument;

public interface TaskOrderService {
    
    /**
     * Generate a Task Order PDF for the given procedure and return the document record.
     * This will:
     * 1. Create a Task Order PDF from the template with procedure data
     * 2. Store the PDF file
     * 3. Create a ProcedureDocument record
     * 4. Update the procedure status to TASK_ORDER_GENERATED
     * 
     * @param procedureUuid The UUID of the procedure
     * @param actorEmail The email of the person generating the Task Order
     * @return The created ProcedureDocument
     */
    ProcedureDocument generateTaskOrder(String procedureUuid, String actorEmail);
}

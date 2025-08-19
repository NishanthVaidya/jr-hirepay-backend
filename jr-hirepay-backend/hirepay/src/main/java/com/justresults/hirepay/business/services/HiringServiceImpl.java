package com.justresults.hirepay.business.services;

import com.justresults.hirepay.domain.Procedure;
import com.justresults.hirepay.domain.ProcedureDocument;
import com.justresults.hirepay.enumeration.DocReference;
import com.justresults.hirepay.enumeration.ProcedureStatus;
import com.justresults.hirepay.enumeration.ProductType;
import com.justresults.hirepay.repository.ProcedureDocumentRepository;
import com.justresults.hirepay.repository.ProcedureRepository;
import com.justresults.hirepay.util.InvalidStateException;
import com.justresults.hirepay.util.NotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class HiringServiceImpl implements HiringService {

    private final ProcedureRepository procedureRepo;
    private final ProcedureDocumentRepository docRepo;

    public HiringServiceImpl(ProcedureRepository procedureRepo, ProcedureDocumentRepository docRepo) {
        this.procedureRepo = procedureRepo;
        this.docRepo = docRepo;
    }

    @Override
    public Procedure createHiringProcedure(String consultantEmail, String consultantName) {
        Procedure p = new Procedure();
        p.setProduct(ProductType.HIRING);
        p.setConsultantEmail(consultantEmail);
        p.setConsultantName(consultantName);
        p.setStatus(ProcedureStatus.DRAFT);
        return procedureRepo.save(p);
    }

    @Override
    public Procedure getByUuid(String uuid) {
        return procedureRepo.findByUuid(uuid)
                .orElseThrow(() -> new NotFoundException("Procedure not found: " + uuid));
    }

    @Override
    public ProcedureDocument addDocument(String uuid, DocReference ref, String location, String actorEmail) {
        Procedure proc = getByUuid(uuid);

        // compute next version (latest + 1)
        int nextVersion = 1;
        List<ProcedureDocument> existing = docRepo.findByProcedureAndDocReferenceOrderByVersionDesc(proc, ref);
        if (!existing.isEmpty()) {
            nextVersion = existing.get(0).getVersion() + 1;
        }

        ProcedureDocument doc = new ProcedureDocument();
        doc.setProcedure(proc);
        doc.setDocReference(ref);
        doc.setLocation(location);
        doc.setActorEmail(actorEmail);
        doc.setVersion(nextVersion);

        return docRepo.save(doc);
    }

    @Override
    public Procedure markAgreementSigned(String uuid) {
        Procedure p = getByUuid(uuid);
        if (!(p.getStatus() == ProcedureStatus.DRAFT || p.getStatus() == ProcedureStatus.AGREEMENT_SENT)) {
            throw new InvalidStateException("Agreement can only be signed from DRAFT or AGREEMENT_SENT.");
        }
        p.setStatus(ProcedureStatus.AGREEMENT_SUBMITTED);
        return procedureRepo.save(p);
    }

    @Override
    public Procedure markPaymentTaxSubmitted(String uuid) {
        Procedure p = getByUuid(uuid);
        if (p.getStatus() != ProcedureStatus.AGREEMENT_SUBMITTED) {
            throw new InvalidStateException("Payment/Tax submission requires AGREEMENT_SUBMITTED.");
        }
        p.setStatus(ProcedureStatus.PAYMENT_TAX_SUBMITTED);
        return procedureRepo.save(p);
    }

    @Override
    public Procedure approvePaymentTax(String uuid, boolean approved, String notes) {
        Procedure p = getByUuid(uuid);
        if (p.getStatus() != ProcedureStatus.PAYMENT_TAX_SUBMITTED) {
            throw new InvalidStateException("Approval requires PAYMENT_TAX_SUBMITTED.");
        }
        p.setStatus(approved ? ProcedureStatus.PAYMENT_TAX_APPROVED : ProcedureStatus.REJECTED);
        // You could persist notes in a future Review entity; skipping for now
        return procedureRepo.save(p);
    }

    @Override
    public Procedure markTaskOrderGenerated(String uuid) {
        Procedure p = getByUuid(uuid);
        if (p.getStatus() != ProcedureStatus.PAYMENT_TAX_APPROVED) {
            throw new InvalidStateException("Task Order generation requires PAYMENT_TAX_APPROVED.");
        }
        p.setStatus(ProcedureStatus.TASK_ORDER_GENERATED);
        return procedureRepo.save(p);
    }

    @Override
    public Procedure markTaskOrderSigned(String uuid) {
        Procedure p = getByUuid(uuid);
        if (p.getStatus() != ProcedureStatus.TASK_ORDER_GENERATED) {
            throw new InvalidStateException("Signed TO requires TASK_ORDER_GENERATED.");
        }
        p.setStatus(ProcedureStatus.TASK_ORDER_SUBMITTED);
        return procedureRepo.save(p);
    }

    @Override
    public Procedure acceptTaskOrder(String uuid, String acceptedBy, String acceptedFrom) {
        Procedure p = getByUuid(uuid);
        if (p.getStatus() != ProcedureStatus.TASK_ORDER_GENERATED) {
            throw new InvalidStateException("Task Order can only be accepted from TASK_ORDER_GENERATED status. Current status: " + p.getStatus());
        }
        
        // Record acceptance details
        p.setTaskOrderAcceptedBy(acceptedBy);
        p.setTaskOrderAcceptedAt(Instant.now());
        p.setTaskOrderAcceptedFrom(acceptedFrom);
        p.setStatus(ProcedureStatus.TASK_ORDER_SUBMITTED);
        
        return procedureRepo.save(p);
    }

    @Override
    public Procedure archive(String uuid) {
        Procedure p = getByUuid(uuid);
        if (p.getStatus() != ProcedureStatus.TASK_ORDER_SUBMITTED) {
            throw new InvalidStateException("Archive requires TASK_ORDER_SUBMITTED.");
        }
        p.setStatus(ProcedureStatus.COMPLETED);
        return procedureRepo.save(p);
    }
}

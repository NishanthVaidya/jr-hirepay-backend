package com.justresults.hirepay.controller;

import com.justresults.hirepay.business.services.HiringService;
import com.justresults.hirepay.business.services.TaskOrderService;
import com.justresults.hirepay.domain.Procedure;
import com.justresults.hirepay.domain.ProcedureDocument;
import com.justresults.hirepay.dto.HiringRequests.CreateProcedureRequest;
import com.justresults.hirepay.dto.HiringRequests.AddDocumentRequest;
import com.justresults.hirepay.dto.HiringRequests.ApprovePaymentTaxRequest;
import com.justresults.hirepay.dto.HiringRequests.AcceptTaskOrderRequest;
import com.justresults.hirepay.enumeration.DocReference;
import com.justresults.hirepay.util.DocumentStorageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/hiring")
public class HiringController {

    private final HiringService hiringService;
    private final DocumentStorageService documentStorageService;
    private final TaskOrderService taskOrderService;

    public HiringController(HiringService hiringService, DocumentStorageService documentStorageService, TaskOrderService taskOrderService) {
        this.hiringService = hiringService;
        this.documentStorageService = documentStorageService;
        this.taskOrderService = taskOrderService;
    }

    // Create a new hiring procedure (DRAFT)
    @PostMapping
    public ResponseEntity<Procedure> create(@Valid @RequestBody CreateProcedureRequest req) {
        Procedure p = hiringService.createHiringProcedure(req.getConsultantEmail(), req.getConsultantName());
        return ResponseEntity.ok(p);
    }

    // Get by UUID
    @GetMapping("/{uuid}")
    public ResponseEntity<Procedure> get(@PathVariable String uuid) {
        return ResponseEntity.ok(hiringService.getByUuid(uuid));
    }

    // Add a document (agreement, tax, payment auth, task order, etc.)
    @PostMapping("/{uuid}/documents")
    public ResponseEntity<ProcedureDocument> addDocument(@PathVariable String uuid,
                                                         @Valid @RequestBody AddDocumentRequest req) {
        ProcedureDocument doc = hiringService.addDocument(uuid, req.getDocReference(), req.getLocation(), req.getActorEmail());
        return ResponseEntity.ok(doc);
    }

    // Upload a document file
    @PostMapping("/{uuid}/documents/upload")
    public ResponseEntity<ProcedureDocument> uploadDocument(@PathVariable String uuid,
                                                           @RequestParam("type") DocReference docReference,
                                                           @RequestParam("file") MultipartFile file,
                                                           @RequestParam("actorEmail") String actorEmail) throws IOException {
        String location = documentStorageService.store(uuid, file);
        ProcedureDocument doc = hiringService.addDocument(uuid, docReference, location, actorEmail);
        return ResponseEntity.ok(doc);
    }

    // Transitions

    // After signed umbrella uploaded
    @PostMapping("/{uuid}/agreement/signed")
    public ResponseEntity<Procedure> agreementSigned(@PathVariable String uuid) {
        return ResponseEntity.ok(hiringService.markAgreementSigned(uuid));
    }

    // After tax form + payment authorization uploaded
    @PostMapping("/{uuid}/payment-tax/submitted")
    public ResponseEntity<Procedure> paymentTaxSubmitted(@PathVariable String uuid) {
        return ResponseEntity.ok(hiringService.markPaymentTaxSubmitted(uuid));
    }

    // BO review of tax/payment
    @PostMapping("/{uuid}/payment-tax/review")
    public ResponseEntity<Procedure> approvePaymentTax(@PathVariable String uuid,
                                                       @RequestBody ApprovePaymentTaxRequest req) {
        return ResponseEntity.ok(hiringService.approvePaymentTax(uuid, req.isApproved(), req.getNotes()));
    }

    // Generate Task Order PDF
    @PostMapping("/{uuid}/task-order/generate")
    public ResponseEntity<ProcedureDocument> generateTaskOrder(@PathVariable String uuid,
                                                             @RequestParam("actorEmail") String actorEmail) {
        return ResponseEntity.ok(taskOrderService.generateTaskOrder(uuid, actorEmail));
    }

    // BO generated task order
    @PostMapping("/{uuid}/task-order/generated")
    public ResponseEntity<Procedure> taskOrderGenerated(@PathVariable String uuid) {
        return ResponseEntity.ok(hiringService.markTaskOrderGenerated(uuid));
    }

    // Accept Task Order (with detailed tracking)
    @PostMapping("/{uuid}/task-order/accept")
    public ResponseEntity<Procedure> acceptTaskOrder(@PathVariable String uuid,
                                                   @Valid @RequestBody AcceptTaskOrderRequest req) {
        return ResponseEntity.ok(hiringService.acceptTaskOrder(uuid, req.getAcceptedBy(), req.getAcceptedFrom()));
    }

    // FO uploaded signed task order
    @PostMapping("/{uuid}/task-order/signed")
    public ResponseEntity<Procedure> taskOrderSigned(@PathVariable String uuid) {
        return ResponseEntity.ok(hiringService.markTaskOrderSigned(uuid));
    }

    // BBO archive and complete
    @PostMapping("/{uuid}/archive")
    public ResponseEntity<Procedure> archive(@PathVariable String uuid) {
        return ResponseEntity.ok(hiringService.archive(uuid));
    }
}

package com.justresults.hirepay.business.services;

import com.justresults.hirepay.domain.Procedure;
import com.justresults.hirepay.domain.ProcedureDocument;
import com.justresults.hirepay.enumeration.DocReference;
import com.justresults.hirepay.enumeration.ProcedureStatus;
import com.justresults.hirepay.repository.ProcedureDocumentRepository;
import com.justresults.hirepay.repository.ProcedureRepository;
import com.justresults.hirepay.util.DocumentStorageService;
import com.justresults.hirepay.util.NotFoundException;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class TaskOrderServiceImpl implements TaskOrderService {

    private final TemplateEngine templateEngine;
    private final DocumentStorageService documentStorageService;
    private final ProcedureRepository procedureRepository;
    private final ProcedureDocumentRepository documentRepository;

    public TaskOrderServiceImpl(TemplateEngine templateEngine, 
                              DocumentStorageService documentStorageService,
                              ProcedureRepository procedureRepository,
                              ProcedureDocumentRepository documentRepository) {
        this.templateEngine = templateEngine;
        this.documentStorageService = documentStorageService;
        this.procedureRepository = procedureRepository;
        this.documentRepository = documentRepository;
    }

    @Override
    public ProcedureDocument generateTaskOrder(String procedureUuid, String actorEmail) {
        // Get the procedure
        Procedure procedure = procedureRepository.findByUuid(procedureUuid)
                .orElseThrow(() -> new NotFoundException("Procedure not found: " + procedureUuid));

        // Verify the procedure is in the correct state
        if (procedure.getStatus() != ProcedureStatus.PAYMENT_TAX_APPROVED) {
            throw new IllegalStateException("Task Order can only be generated from PAYMENT_TAX_APPROVED status. Current status: " + procedure.getStatus());
        }

        try {
            // Generate PDF content
            byte[] pdfBytes = generatePdfContent(procedure);

            // Store the PDF file
            String fileLocation = documentStorageService.store(procedureUuid, pdfBytes, "task-order.pdf");

            // Create the document record
            ProcedureDocument document = new ProcedureDocument();
            document.setProcedure(procedure);
            document.setDocReference(DocReference.TASK_ORDER);
            document.setLocation(fileLocation);
            document.setActorEmail(actorEmail);
            document.setVersion(1); // First version

            // Save the document
            ProcedureDocument savedDocument = documentRepository.save(document);

            // Update procedure status to TASK_ORDER_GENERATED
            procedure.setStatus(ProcedureStatus.TASK_ORDER_GENERATED);
            procedureRepository.save(procedure);

            return savedDocument;

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Task Order PDF", e);
        }
    }

    private byte[] generatePdfContent(Procedure procedure) throws IOException {
        // Prepare template context with procedure data
        Context context = new Context();
        Map<String, Object> variables = new HashMap<>();
        
        variables.put("procedureUuid", procedure.getUuid());
        variables.put("consultantName", procedure.getConsultantName());
        variables.put("consultantEmail", procedure.getConsultantEmail());
        
        // For now, use default values - these could come from a separate TaskOrder entity later
        variables.put("roleTitle", "Consultant");
        variables.put("startDate", LocalDateTime.now().plusDays(7).format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        variables.put("rate", "$100/hr");
        variables.put("currency", "USD");
        variables.put("clientProject", "Client Project");
        variables.put("scopeSummary", "Consulting services as outlined in the agreement");
        variables.put("notes", "Standard consulting terms apply");
        variables.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        
        context.setVariables(variables);

        // Render the HTML template
        String htmlContent = templateEngine.process("task-order", context);

        // Convert HTML to PDF
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        PdfRendererBuilder builder = new PdfRendererBuilder();
        builder.withUri("data:application/pdf;base64,");
        builder.toStream(outputStream);
        builder.withHtmlContent(htmlContent, "/");
        builder.run();

        return outputStream.toByteArray();
    }
}

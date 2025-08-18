package com.justresults.hirepay.domain;

import com.justresults.hirepay.enumeration.DocReference;
import com.justresults.hirepay.enumeration.DocumentStatus;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
    name = "procedure_documents",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_proc_docref_version",
                          columnNames = {"procedure_id", "doc_reference", "version"})
    }
)
public class ProcedureDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many docs per procedure (e.g., re-uploads, modifications)
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "procedure_id")
    private Procedure procedure;

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_reference", nullable = false, length = 64)
    private DocReference docReference;

    // Where we stored it (S3/GCS/local). Keep simple for now: a URL or path.
    @Column(nullable = false, length = 512)
    private String location;

    // Optional: who uploaded/generated it
    @Column(length = 128)
    private String actorEmail;

    // Allow multiple versions (e.g., re-signed, corrected)
    @Column(nullable = false)
    private int version = 1;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Document status for workflow tracking
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private DocumentStatus status = DocumentStatus.DRAFT;

    // Optional notes for the document
    @Column(columnDefinition = "text")
    private String notes;

    // Optional: lightweight JSON metadata (content type, file size, etc.)
    @Lob
    @Column(columnDefinition = "text")
    private String metadataJson;

    // getters/setters
    public Long getId() { return id; }

    public Procedure getProcedure() { return procedure; }
    public void setProcedure(Procedure procedure) { this.procedure = procedure; }

    public DocReference getDocReference() { return docReference; }
    public void setDocReference(DocReference docReference) { this.docReference = docReference; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getActorEmail() { return actorEmail; }
    public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }

    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public DocumentStatus getStatus() { return status; }
    public void setStatus(DocumentStatus status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getMetadataJson() { return metadataJson; }
    public void setMetadataJson(String metadataJson) { this.metadataJson = metadataJson; }
}

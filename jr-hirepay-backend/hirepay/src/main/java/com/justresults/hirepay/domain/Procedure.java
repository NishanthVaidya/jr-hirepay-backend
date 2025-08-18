package com.justresults.hirepay.domain;

import com.justresults.hirepay.enumeration.ProductType;
import com.justresults.hirepay.enumeration.ProcedureStatus;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "procedures")
public class Procedure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private String uuid = UUID.randomUUID().toString();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ProductType product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ProcedureStatus status = ProcedureStatus.DRAFT;

    // Optional: who the consultant is (email/name). We’ll model a full party later.
    @Column(length = 128)
    private String consultantEmail;

    @Column(length = 128)
    private String consultantName;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    // Task Order acceptance tracking
    @Column(length = 128)
    private String taskOrderAcceptedBy;

    @Column
    private Instant taskOrderAcceptedAt;

    @Column(length = 256)
    private String taskOrderAcceptedFrom; // IP address, user agent, etc.

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    // getters/setters
    public Long getId() { return id; }
    public String getUuid() { return uuid; }

    public ProductType getProduct() { return product; }
    public void setProduct(ProductType product) { this.product = product; }

    public ProcedureStatus getStatus() { return status; }
    public void setStatus(ProcedureStatus status) { this.status = status; }

    public String getConsultantEmail() { return consultantEmail; }
    public void setConsultantEmail(String consultantEmail) { this.consultantEmail = consultantEmail; }

    public String getConsultantName() { return consultantName; }
    public void setConsultantName(String consultantName) { this.consultantName = consultantName; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public String getTaskOrderAcceptedBy() { return taskOrderAcceptedBy; }
    public void setTaskOrderAcceptedBy(String taskOrderAcceptedBy) { this.taskOrderAcceptedBy = taskOrderAcceptedBy; }

    public Instant getTaskOrderAcceptedAt() { return taskOrderAcceptedAt; }
    public void setTaskOrderAcceptedAt(Instant taskOrderAcceptedAt) { this.taskOrderAcceptedAt = taskOrderAcceptedAt; }

    public String getTaskOrderAcceptedFrom() { return taskOrderAcceptedFrom; }
    public void setTaskOrderAcceptedFrom(String taskOrderAcceptedFrom) { this.taskOrderAcceptedFrom = taskOrderAcceptedFrom; }
}

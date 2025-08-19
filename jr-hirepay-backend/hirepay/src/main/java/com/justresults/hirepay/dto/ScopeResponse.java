package com.justresults.hirepay.dto;

import com.justresults.hirepay.enumeration.ScopeStatus;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScopeResponse {
    private Long id;
    private String title;
    private String description;
    private ScopeStatus status;
    private UserInfo assignedTo;
    private UserInfo assignedBy;
    private UserInfo reviewedBy;
    private String template;
    private String objectives;
    private String deliverables;
    private String timeline;
    private String requirements;
    private String constraints;
    private String reviewNotes;
    private OffsetDateTime dueDate;
    private OffsetDateTime reviewedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}


package com.justresults.hirepay.dto;

import lombok.*;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateScopeRequest {
    private String title;
    private String description;
    private Long assignedToUserId;
    private String template;
    private String objectives;
    private String deliverables;
    private String timeline;
    private String requirements;
    private String constraints;
    private OffsetDateTime dueDate;
}


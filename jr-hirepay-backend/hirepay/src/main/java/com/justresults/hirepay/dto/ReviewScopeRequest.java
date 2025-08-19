package com.justresults.hirepay.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewScopeRequest {
    private boolean approved;
    private boolean requestChanges;
    private String reviewNotes;
}


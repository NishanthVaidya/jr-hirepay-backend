package com.justresults.hirepay.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScopeStats {
    private long totalScopes;
    private long draftScopes;
    private long inProgressScopes;
    private long underReviewScopes;
    private long approvedScopes;
    private long rejectedScopes;
    private long completedScopes;
}


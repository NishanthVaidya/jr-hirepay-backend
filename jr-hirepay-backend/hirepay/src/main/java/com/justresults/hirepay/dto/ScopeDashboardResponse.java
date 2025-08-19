package com.justresults.hirepay.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScopeDashboardResponse {
    private List<ScopeResponse> allScopes;
    private List<ScopeResponse> pendingReviews;
    private List<ScopeResponse> myAssignedScopes;
    private ScopeStats stats;
}


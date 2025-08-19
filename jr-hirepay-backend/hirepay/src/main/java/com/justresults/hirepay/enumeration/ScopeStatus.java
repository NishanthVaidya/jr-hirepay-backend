package com.justresults.hirepay.enumeration;

public enum ScopeStatus {
    DRAFT,           // Initial state when scope is created
    IN_PROGRESS,     // Front office is working on the scope
    UNDER_REVIEW,    // Front office has submitted for review
    APPROVED,        // Back office has approved the scope
    REJECTED,        // Back office has rejected the scope
    COMPLETED        // Scope has been completed
}


package com.justresults.hirepay.business.services;

import com.justresults.hirepay.dto.*;

import java.util.List;

public interface ScopeService {
    
    // Create a new scope assignment
    ScopeResponse createScope(CreateScopeRequest request, Long assignedById);
    
    // Get scope by ID
    ScopeResponse getScopeById(Long scopeId);
    
    // Update scope details
    ScopeResponse updateScope(Long scopeId, UpdateScopeRequest request);
    
    // Review scope (approve/reject)
    ScopeResponse reviewScope(Long scopeId, ReviewScopeRequest request, Long reviewerId);
    
        // Get all scopes for back office dashboard
    ScopeDashboardResponse getBackOfficeDashboard(Long backOfficeUserId);
    
    // Get scopes assigned to a user (front office)
    List<ScopeResponse> getMyScopes(Long userId);
    
    // Get scopes assigned by a user (back office)
    List<ScopeResponse> getScopesAssignedByMe(Long backOfficeUserId);
    
    // Get scopes that need review
    List<ScopeResponse> getScopesNeedingReview();
    
    // Submit scope for review (front office)
    ScopeResponse submitScopeForReview(Long scopeId);
    

}


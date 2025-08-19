package com.justresults.hirepay.business.services;

import com.justresults.hirepay.domain.Scope;
import com.justresults.hirepay.domain.User;
import com.justresults.hirepay.dto.*;
import com.justresults.hirepay.enumeration.ScopeStatus;
import com.justresults.hirepay.repository.ScopeRepository;
import com.justresults.hirepay.repository.UserRepository;
import com.justresults.hirepay.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ScopeServiceImpl implements ScopeService {

    private final ScopeRepository scopeRepository;
    private final UserRepository userRepository;

    @Override
    public ScopeResponse createScope(CreateScopeRequest request, Long assignedById) {
        User assignedTo = userRepository.findById(request.getAssignedToUserId())
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        User assignedBy = userRepository.findById(assignedById)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Scope scope = Scope.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(ScopeStatus.DRAFT)
                .assignedTo(assignedTo)
                .assignedBy(assignedBy)
                .template(request.getTemplate())
                .objectives(request.getObjectives())
                .deliverables(request.getDeliverables())
                .timeline(request.getTimeline())
                .requirements(request.getRequirements())
                .constraints(request.getConstraints())
                .dueDate(request.getDueDate())
                .build();

        Scope savedScope = scopeRepository.save(scope);
        return convertToScopeResponse(savedScope);
    }

    @Override
    @Transactional(readOnly = true)
    public ScopeResponse getScopeById(Long scopeId) {
        Scope scope = scopeRepository.findById(scopeId)
                .orElseThrow(() -> new NotFoundException("Scope not found"));
        return convertToScopeResponse(scope);
    }

    @Override
    public ScopeResponse updateScope(Long scopeId, UpdateScopeRequest request) {
        Scope scope = scopeRepository.findById(scopeId)
                .orElseThrow(() -> new NotFoundException("Scope not found"));

        scope.setTitle(request.getTitle());
        scope.setDescription(request.getDescription());
                    scope.setObjectives(request.getObjectives());
            scope.setDeliverables(request.getDeliverables());
            scope.setTimeline(request.getTimeline());
            scope.setRequirements(request.getRequirements());
        scope.setConstraints(request.getConstraints());
        scope.setDueDate(request.getDueDate());

        Scope savedScope = scopeRepository.save(scope);
        return convertToScopeResponse(savedScope);
    }

    @Override
    public ScopeResponse reviewScope(Long scopeId, ReviewScopeRequest request, Long reviewerId) {
        Scope scope = scopeRepository.findById(scopeId)
                .orElseThrow(() -> new NotFoundException("Scope not found"));
        
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        scope.setStatus(request.isApproved() ? ScopeStatus.APPROVED : ScopeStatus.REJECTED);
        scope.setReviewNotes(request.getReviewNotes());
        scope.setReviewedBy(reviewer);
        scope.setReviewedAt(java.time.OffsetDateTime.now());

        Scope savedScope = scopeRepository.save(scope);
        return convertToScopeResponse(savedScope);
    }

    

    @Override
    @Transactional(readOnly = true)
    public ScopeDashboardResponse getBackOfficeDashboard(Long backOfficeUserId) {
        List<Scope> allScopes = scopeRepository.findAllScopesForBackOffice();
        List<Scope> pendingReviews = scopeRepository.findScopesNeedingReview();
        List<Scope> myAssignedScopes = scopeRepository.findScopesAssignedByBackOffice(backOfficeUserId);

        ScopeStats stats = calculateScopeStats(allScopes);

        return ScopeDashboardResponse.builder()
                .allScopes(allScopes.stream().map(this::convertToScopeResponse).collect(Collectors.toList()))
                .pendingReviews(pendingReviews.stream().map(this::convertToScopeResponse).collect(Collectors.toList()))
                .myAssignedScopes(myAssignedScopes.stream().map(this::convertToScopeResponse).collect(Collectors.toList()))
                .stats(stats)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScopeResponse> getMyScopes(Long userId) {
        List<Scope> scopes = scopeRepository.findByAssignedToIdOrderByCreatedAtDesc(userId);
        return scopes.stream().map(this::convertToScopeResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScopeResponse> getScopesAssignedByMe(Long backOfficeUserId) {
        List<Scope> scopes = scopeRepository.findScopesAssignedByBackOffice(backOfficeUserId);
        return scopes.stream().map(this::convertToScopeResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScopeResponse> getScopesNeedingReview() {
        List<Scope> scopes = scopeRepository.findScopesNeedingReview();
        return scopes.stream().map(this::convertToScopeResponse).collect(Collectors.toList());
    }

    @Override
    public ScopeResponse submitScopeForReview(Long scopeId) {
        Scope scope = scopeRepository.findById(scopeId)
                .orElseThrow(() -> new NotFoundException("Scope not found"));

        scope.setStatus(ScopeStatus.UNDER_REVIEW);
        Scope savedScope = scopeRepository.save(scope);
        return convertToScopeResponse(savedScope);
    }



    // Helper methods
    private ScopeResponse convertToScopeResponse(Scope scope) {
        return ScopeResponse.builder()
                .id(scope.getId())
                .title(scope.getTitle())
                .description(scope.getDescription())
                .status(scope.getStatus())
                .assignedTo(convertToUserInfo(scope.getAssignedTo()))
                .assignedBy(convertToUserInfo(scope.getAssignedBy()))
                .reviewedBy(scope.getReviewedBy() != null ? convertToUserInfo(scope.getReviewedBy()) : null)
                .template(scope.getTemplate())
                .objectives(scope.getObjectives())
                .deliverables(scope.getDeliverables())
                .timeline(scope.getTimeline())
                .requirements(scope.getRequirements())
                .constraints(scope.getConstraints())
                .reviewNotes(scope.getReviewNotes())
                .dueDate(scope.getDueDate())
                .reviewedAt(scope.getReviewedAt())
                .createdAt(scope.getCreatedAt())
                .updatedAt(scope.getUpdatedAt())
                .build();
    }

    private UserInfo convertToUserInfo(User user) {
        return UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .designation(user.getDesignation())
                .build();
    }

    private ScopeStats calculateScopeStats(List<Scope> scopes) {
        long totalScopes = scopes.size();
        long draftScopes = scopes.stream().filter(s -> s.getStatus() == ScopeStatus.DRAFT).count();
        long inProgressScopes = scopes.stream().filter(s -> s.getStatus() == ScopeStatus.IN_PROGRESS).count();
        long underReviewScopes = scopes.stream().filter(s -> s.getStatus() == ScopeStatus.UNDER_REVIEW).count();
        long approvedScopes = scopes.stream().filter(s -> s.getStatus() == ScopeStatus.APPROVED).count();
        long rejectedScopes = scopes.stream().filter(s -> s.getStatus() == ScopeStatus.REJECTED).count();
        long completedScopes = scopes.stream().filter(s -> s.getStatus() == ScopeStatus.COMPLETED).count();

        return ScopeStats.builder()
                .totalScopes(totalScopes)
                .draftScopes(draftScopes)
                .inProgressScopes(inProgressScopes)
                .underReviewScopes(underReviewScopes)
                .approvedScopes(approvedScopes)
                .rejectedScopes(rejectedScopes)
                .completedScopes(completedScopes)
                .build();
    }
}


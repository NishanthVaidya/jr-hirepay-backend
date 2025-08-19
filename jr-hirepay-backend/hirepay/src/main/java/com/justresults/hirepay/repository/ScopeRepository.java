package com.justresults.hirepay.repository;

import com.justresults.hirepay.domain.Scope;
import com.justresults.hirepay.enumeration.ScopeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScopeRepository extends JpaRepository<Scope, Long> {
    
    // Find scopes assigned to a specific user
    List<Scope> findByAssignedToIdOrderByCreatedAtDesc(Long userId);
    
    // Find scopes assigned by a specific user
    List<Scope> findByAssignedByIdOrderByCreatedAtDesc(Long userId);
    
    // Find scopes by status
    List<Scope> findByStatusOrderByCreatedAtDesc(ScopeStatus status);
    
    // Find scopes assigned to a user with specific status
    List<Scope> findByAssignedToIdAndStatusOrderByCreatedAtDesc(Long userId, ScopeStatus status);
    
    // Find scopes assigned by a user with specific status
    List<Scope> findByAssignedByIdAndStatusOrderByCreatedAtDesc(Long userId, ScopeStatus status);
    
    // Find scopes that need review (UNDER_REVIEW or CHANGES_REQUESTED status)
    @Query("SELECT s FROM Scope s WHERE s.status IN ('UNDER_REVIEW', 'CHANGES_REQUESTED') ORDER BY s.createdAt DESC")
    List<Scope> findScopesNeedingReview();
    
    // Find scopes assigned to front office users by back office
    @Query("SELECT s FROM Scope s WHERE s.assignedBy.id = :backOfficeUserId ORDER BY s.createdAt DESC")
    List<Scope> findScopesAssignedByBackOffice(@Param("backOfficeUserId") Long backOfficeUserId);
    
    // Find all scopes for back office dashboard
    @Query("SELECT s FROM Scope s ORDER BY s.createdAt DESC")
    List<Scope> findAllScopesForBackOffice();
}


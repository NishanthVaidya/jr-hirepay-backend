package com.justresults.hirepay.repository;

import com.justresults.hirepay.domain.Procedure;
import com.justresults.hirepay.domain.ProcedureDocument;
import com.justresults.hirepay.enumeration.DocReference;
import com.justresults.hirepay.enumeration.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProcedureDocumentRepository extends JpaRepository<ProcedureDocument, Long> {
    List<ProcedureDocument> findByProcedureOrderByCreatedAtDesc(Procedure procedure);
    
    List<ProcedureDocument> findByProcedureAndDocReferenceOrderByVersionDesc(Procedure procedure, DocReference ref);
    
    Optional<ProcedureDocument> findByProcedureAndDocReferenceAndVersion(Procedure procedure, DocReference docReference, int version);
    
    @Query("SELECT pd FROM ProcedureDocument pd WHERE pd.actorEmail = :actorEmail AND pd.docReference = :docReference ORDER BY pd.createdAt DESC")
    List<ProcedureDocument> findByActorEmailAndDocReferenceOrderByCreatedAtDesc(@Param("actorEmail") String actorEmail, @Param("docReference") DocReference docReference);
    
    @Query("SELECT pd FROM ProcedureDocument pd WHERE pd.procedure.consultantEmail = :consultantEmail AND pd.docReference = :docReference ORDER BY pd.createdAt DESC")
    List<ProcedureDocument> findByProcedureConsultantEmailAndDocReferenceOrderByCreatedAtDesc(@Param("consultantEmail") String consultantEmail, @Param("docReference") DocReference docReference);
    
    @Query("SELECT pd FROM ProcedureDocument pd WHERE pd.docReference = :docReference AND pd.status = :status ORDER BY pd.createdAt DESC")
    List<ProcedureDocument> findByDocReferenceAndStatusOrderByCreatedAtDesc(@Param("docReference") DocReference docReference, @Param("status") DocumentStatus status);
    
    @Query("SELECT pd FROM ProcedureDocument pd WHERE pd.actorEmail = :actorEmail ORDER BY pd.createdAt DESC")
    List<ProcedureDocument> findByActorEmailOrderByCreatedAtDesc(@Param("actorEmail") String actorEmail);
    
    @Query("SELECT pd FROM ProcedureDocument pd WHERE pd.procedure.consultantEmail = :consultantEmail ORDER BY pd.createdAt DESC")
    List<ProcedureDocument> findByProcedureConsultantEmailOrderByCreatedAtDesc(@Param("consultantEmail") String consultantEmail);
    
    @Query("SELECT pd FROM ProcedureDocument pd WHERE pd.status = :status ORDER BY pd.createdAt DESC")
    List<ProcedureDocument> findByStatusOrderByCreatedAtDesc(@Param("status") DocumentStatus status);
}

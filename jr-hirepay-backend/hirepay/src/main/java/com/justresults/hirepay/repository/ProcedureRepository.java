package com.justresults.hirepay.repository;

import com.justresults.hirepay.domain.Procedure;
import com.justresults.hirepay.enumeration.ProductType;
import com.justresults.hirepay.enumeration.ProcedureStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProcedureRepository extends JpaRepository<Procedure, Long> {
    Optional<Procedure> findByUuid(String uuid);
    List<Procedure> findByProductAndStatus(ProductType product, ProcedureStatus status);
}

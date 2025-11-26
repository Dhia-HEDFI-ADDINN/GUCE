package cm.guce.procedure.domain.port;

import cm.guce.common.domain.model.EntityStatus;
import cm.guce.procedure.domain.model.Declaration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository pour la gestion des déclarations.
 */
@Repository
public interface DeclarationRepository extends JpaRepository<Declaration, UUID> {

    Optional<Declaration> findByReference(String reference);

    List<Declaration> findByOperatorId(UUID operatorId);

    Page<Declaration> findByOperatorId(UUID operatorId, Pageable pageable);

    List<Declaration> findByStatus(EntityStatus status);

    Page<Declaration> findByStatus(EntityStatus status, Pageable pageable);

    @Query("SELECT d FROM Declaration d WHERE d.operatorId = :operatorId AND d.status = :status")
    Page<Declaration> findByOperatorIdAndStatus(
            @Param("operatorId") UUID operatorId,
            @Param("status") EntityStatus status,
            Pageable pageable);

    @Query("SELECT d FROM Declaration d WHERE d.procedureCode = :procedureCode")
    Page<Declaration> findByProcedureCode(@Param("procedureCode") String procedureCode, Pageable pageable);

    @Query("SELECT d FROM Declaration d WHERE d.assignedTo = :userId AND d.status = :status")
    Page<Declaration> findByAssignedToAndStatus(
            @Param("userId") String userId,
            @Param("status") EntityStatus status,
            Pageable pageable);

    @Query("SELECT d FROM Declaration d WHERE d.currentStep = :stepCode AND d.status IN :statuses")
    List<Declaration> findByCurrentStepAndStatusIn(
            @Param("stepCode") String stepCode,
            @Param("statuses") List<EntityStatus> statuses);

    @Query("SELECT d FROM Declaration d WHERE " +
            "(LOWER(d.reference) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(d.operatorName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(d.operatorNiu) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Declaration> search(@Param("query") String query, Pageable pageable);

    @Query("SELECT d FROM Declaration d WHERE d.submittedAt >= :startDate AND d.submittedAt <= :endDate")
    List<Declaration> findBySubmittedAtBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(d) FROM Declaration d WHERE d.status = :status AND d.tenantId = :tenantId")
    long countByStatusAndTenant(@Param("status") EntityStatus status, @Param("tenantId") String tenantId);

    @Query("SELECT d.status, COUNT(d) FROM Declaration d WHERE d.tenantId = :tenantId GROUP BY d.status")
    List<Object[]> countByStatusGrouped(@Param("tenantId") String tenantId);

    boolean existsByReference(String reference);

    Optional<Declaration> findByProcessInstanceId(String processInstanceId);
}

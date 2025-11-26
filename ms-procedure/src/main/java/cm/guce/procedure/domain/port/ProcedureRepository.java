package cm.guce.procedure.domain.port;

import cm.guce.procedure.domain.model.Procedure;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository pour la gestion des procédures.
 */
@Repository
public interface ProcedureRepository extends JpaRepository<Procedure, UUID> {

    Optional<Procedure> findByCode(String code);

    List<Procedure> findByIsActiveTrue();

    List<Procedure> findByCategory(Procedure.ProcedureCategory category);

    List<Procedure> findByStatus(Procedure.ProcedureStatus status);

    @Query("SELECT p FROM Procedure p WHERE p.status = 'PUBLISHED' AND p.isActive = true")
    List<Procedure> findPublished();

    @Query("SELECT p FROM Procedure p WHERE p.status = 'PUBLISHED' AND p.isActive = true " +
            "AND p.category = :category")
    List<Procedure> findPublishedByCategory(@Param("category") Procedure.ProcedureCategory category);

    @Query("SELECT p FROM Procedure p WHERE " +
            "(LOWER(p.nameFr) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.nameEn) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.code) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND p.isActive = true")
    Page<Procedure> search(@Param("query") String query, Pageable pageable);

    boolean existsByCode(String code);

    @Query("SELECT p FROM Procedure p LEFT JOIN FETCH p.steps WHERE p.id = :id")
    Optional<Procedure> findByIdWithSteps(@Param("id") UUID id);

    @Query("SELECT p FROM Procedure p LEFT JOIN FETCH p.forms WHERE p.id = :id")
    Optional<Procedure> findByIdWithForms(@Param("id") UUID id);

    @Query("SELECT p FROM Procedure p LEFT JOIN FETCH p.requiredDocuments WHERE p.id = :id")
    Optional<Procedure> findByIdWithDocuments(@Param("id") UUID id);
}

package cm.guce.referential.domain.port;

import cm.guce.referential.domain.model.Currency;
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
 * Repository pour la gestion des devises.
 */
@Repository
public interface CurrencyRepository extends JpaRepository<Currency, UUID> {

    Optional<Currency> findByCode(String code);

    List<Currency> findByIsActiveTrue();

    Optional<Currency> findByIsReferenceTrue();

    @Query("SELECT c FROM Currency c WHERE " +
            "(LOWER(c.nameFr) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.nameEn) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.code) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND c.isActive = true")
    Page<Currency> search(@Param("query") String query, Pageable pageable);

    boolean existsByCode(String code);
}

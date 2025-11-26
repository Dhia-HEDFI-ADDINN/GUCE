package cm.guce.referential.domain.port;

import cm.guce.referential.domain.model.Country;
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
 * Repository pour la gestion des pays.
 */
@Repository
public interface CountryRepository extends JpaRepository<Country, UUID> {

    Optional<Country> findByCodeIso2(String codeIso2);

    Optional<Country> findByCodeIso3(String codeIso3);

    List<Country> findByIsActiveTrue();

    List<Country> findByIsCemacTrue();

    List<Country> findByEconomicZone(Country.EconomicZone zone);

    @Query("SELECT c FROM Country c WHERE c.isActive = true AND c.tenantId = :tenantId")
    List<Country> findActiveByTenant(@Param("tenantId") String tenantId);

    @Query("SELECT c FROM Country c WHERE " +
            "(LOWER(c.nameFr) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.nameEn) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.codeIso2) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.codeIso3) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND c.isActive = true")
    Page<Country> search(@Param("query") String query, Pageable pageable);

    boolean existsByCodeIso2(String codeIso2);

    boolean existsByCodeIso3(String codeIso3);
}

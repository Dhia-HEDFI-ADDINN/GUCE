package cm.guce.tenant.domain.port;

import cm.guce.tenant.domain.model.Tenant;
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
 * Repository pour la gestion des tenants.
 */
@Repository
public interface TenantRepository extends JpaRepository<Tenant, UUID> {

    Optional<Tenant> findByCode(String code);

    Optional<Tenant> findByDomain(String domain);

    boolean existsByCode(String code);

    boolean existsByDomain(String domain);

    List<Tenant> findByStatus(Tenant.TenantStatus status);

    List<Tenant> findByEnvironment(Tenant.TenantEnvironment environment);

    @Query("SELECT t FROM Tenant t WHERE t.status = 'RUNNING'")
    List<Tenant> findAllRunning();

    @Query("SELECT t FROM Tenant t WHERE t.status IN ('RUNNING', 'MAINTENANCE')")
    List<Tenant> findAllActive();

    @Query("SELECT t FROM Tenant t WHERE t.healthStatus = :healthStatus")
    List<Tenant> findByHealthStatus(@Param("healthStatus") Tenant.HealthStatus healthStatus);

    @Query("SELECT t FROM Tenant t WHERE " +
           "LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.code) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.domain) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Tenant> search(@Param("query") String query, Pageable pageable);

    @Query("SELECT COUNT(t) FROM Tenant t WHERE t.status = :status")
    long countByStatus(@Param("status") Tenant.TenantStatus status);

    @Query("SELECT t FROM Tenant t LEFT JOIN FETCH t.modules WHERE t.id = :id")
    Optional<Tenant> findByIdWithModules(@Param("id") UUID id);

    @Query("SELECT t FROM Tenant t LEFT JOIN FETCH t.modules LEFT JOIN FETCH t.initialAdmins WHERE t.id = :id")
    Optional<Tenant> findByIdWithDetails(@Param("id") UUID id);

    @Query("SELECT t FROM Tenant t WHERE t.country = :country")
    List<Tenant> findByCountry(@Param("country") String country);

    @Query("SELECT SUM(t.activeUsers) FROM Tenant t WHERE t.status = 'RUNNING'")
    Long getTotalActiveUsers();

    @Query("SELECT SUM(t.totalTransactions) FROM Tenant t WHERE t.status = 'RUNNING'")
    Long getTotalTransactions();
}

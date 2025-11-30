package cm.guce.procedure.domain.port;

import cm.guce.procedure.domain.model.FimexInscription;
import cm.guce.procedure.domain.model.FimexInscription.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository pour les inscriptions FIMEX.
 */
@Repository
public interface FimexRepository extends JpaRepository<FimexInscription, UUID> {

    Optional<FimexInscription> findByReference(String reference);

    Optional<FimexInscription> findByCertificateNumber(String certificateNumber);

    Page<FimexInscription> findByNiu(String niu, Pageable pageable);

    Page<FimexInscription> findByStatus(FimexStatus status, Pageable pageable);

    Page<FimexInscription> findByStatusIn(List<FimexStatus> statuses, Pageable pageable);

    Page<FimexInscription> findByRequestType(RequestType requestType, Pageable pageable);

    Page<FimexInscription> findByRegion(String region, Pageable pageable);

    Page<FimexInscription> findByLegalForm(LegalForm legalForm, Pageable pageable);

    @Query("SELECT f FROM FimexInscription f WHERE " +
           "(LOWER(f.reference) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.companyName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.niu) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.certificateNumber) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY f.createdAt DESC")
    Page<FimexInscription> search(@Param("query") String query, Pageable pageable);

    @Query("SELECT f FROM FimexInscription f WHERE f.niu = :niu AND f.status = 'SIGNED' " +
           "AND f.certificateExpiryDate >= CURRENT_DATE ORDER BY f.certificateExpiryDate DESC")
    Optional<FimexInscription> findActiveByNiu(@Param("niu") String niu);

    // ========================================
    // STATISTIQUES
    // ========================================

    @Query("SELECT COUNT(f) FROM FimexInscription f WHERE f.status = :status AND f.tenantId = :tenantId")
    long countByStatusAndTenant(@Param("status") FimexStatus status, @Param("tenantId") String tenantId);

    @Query("SELECT COUNT(f) FROM FimexInscription f WHERE f.requestType = :type AND f.tenantId = :tenantId")
    long countByRequestTypeAndTenant(@Param("type") RequestType type, @Param("tenantId") String tenantId);

    @Query("SELECT COUNT(f) FROM FimexInscription f WHERE f.region = :region AND f.tenantId = :tenantId")
    long countByRegionAndTenant(@Param("region") String region, @Param("tenantId") String tenantId);

    @Query("SELECT COUNT(f) FROM FimexInscription f WHERE f.legalForm = :form AND f.tenantId = :tenantId")
    long countByLegalFormAndTenant(@Param("form") LegalForm form, @Param("tenantId") String tenantId);

    @Query("SELECT SUM(f.annualRevenue) FROM FimexInscription f WHERE f.status = 'SIGNED' AND f.tenantId = :tenantId")
    java.math.BigDecimal sumAnnualRevenueByTenant(@Param("tenantId") String tenantId);

    // ========================================
    // REQUÊTES SPÉCIFIQUES
    // ========================================

    List<FimexInscription> findByStatusAndCertificateExpiryDateBefore(FimexStatus status, LocalDate date);

    @Query("SELECT f FROM FimexInscription f WHERE f.status = 'SIGNED' " +
           "AND f.certificateExpiryDate BETWEEN :startDate AND :endDate")
    List<FimexInscription> findExpiringCertificates(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT f FROM FimexInscription f WHERE f.status = 'PROCESSING' " +
           "AND f.processedAt < :date")
    List<FimexInscription> findStaleProcessingInscriptions(@Param("date") java.time.LocalDateTime date);

    // ========================================
    // STATISTIQUES PAR RÉGION ET ACTIVITÉ
    // ========================================

    @Query("SELECT f.region, COUNT(f), SUM(f.annualRevenue) FROM FimexInscription f " +
           "WHERE f.tenantId = :tenantId AND f.status = 'SIGNED' " +
           "GROUP BY f.region ORDER BY COUNT(f) DESC")
    List<Object[]> getStatisticsByRegion(@Param("tenantId") String tenantId);

    @Query("SELECT f.mainActivity, COUNT(f) FROM FimexInscription f " +
           "WHERE f.tenantId = :tenantId AND f.status = 'SIGNED' " +
           "GROUP BY f.mainActivity ORDER BY COUNT(f) DESC")
    List<Object[]> getStatisticsByActivity(@Param("tenantId") String tenantId);

    @Query("SELECT f.legalForm, COUNT(f) FROM FimexInscription f " +
           "WHERE f.tenantId = :tenantId AND f.status = 'SIGNED' " +
           "GROUP BY f.legalForm ORDER BY COUNT(f) DESC")
    List<Object[]> getStatisticsByLegalForm(@Param("tenantId") String tenantId);
}

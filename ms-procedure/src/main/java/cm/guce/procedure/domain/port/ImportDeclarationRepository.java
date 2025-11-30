package cm.guce.procedure.domain.port;

import cm.guce.procedure.domain.model.ImportDeclaration;
import cm.guce.procedure.domain.model.ImportDeclaration.*;
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
 * Repository pour les Déclarations d'Importation.
 */
@Repository
public interface ImportDeclarationRepository extends JpaRepository<ImportDeclaration, UUID> {

    Optional<ImportDeclaration> findByReference(String reference);

    Page<ImportDeclaration> findByImporterNiu(String importerNiu, Pageable pageable);

    Page<ImportDeclaration> findByStatus(ImportDeclarationStatus status, Pageable pageable);

    Page<ImportDeclaration> findByRoutingDestination(RoutingDestination routingDestination, Pageable pageable);

    Page<ImportDeclaration> findByImportType(ImportType importType, Pageable pageable);

    Page<ImportDeclaration> findByTransportMode(TransportMode transportMode, Pageable pageable);

    @Query("SELECT d FROM ImportDeclaration d WHERE " +
           "(LOWER(d.reference) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.importerName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.importerNiu) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.supplierName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY d.createdAt DESC")
    Page<ImportDeclaration> search(@Param("query") String query, Pageable pageable);

    // ========================================
    // STATISTIQUES
    // ========================================

    @Query("SELECT COUNT(d) FROM ImportDeclaration d WHERE d.status = :status AND d.tenantId = :tenantId")
    long countByStatusAndTenant(@Param("status") ImportDeclarationStatus status, @Param("tenantId") String tenantId);

    @Query("SELECT COUNT(d) FROM ImportDeclaration d WHERE d.routingDestination = :routing AND d.tenantId = :tenantId")
    long countByRoutingDestinationAndTenant(@Param("routing") RoutingDestination routing, @Param("tenantId") String tenantId);

    @Query("SELECT COUNT(d) FROM ImportDeclaration d WHERE d.transportMode = :mode AND d.tenantId = :tenantId")
    long countByTransportModeAndTenant(@Param("mode") TransportMode mode, @Param("tenantId") String tenantId);

    @Query("SELECT COUNT(d) FROM ImportDeclaration d WHERE d.importType = :type AND d.tenantId = :tenantId")
    long countByImportTypeAndTenant(@Param("type") ImportType type, @Param("tenantId") String tenantId);

    @Query("SELECT SUM(d.totalFobValueXaf) FROM ImportDeclaration d WHERE d.status = :status AND d.tenantId = :tenantId")
    java.math.BigDecimal sumTotalFobValueByStatusAndTenant(@Param("status") ImportDeclarationStatus status, @Param("tenantId") String tenantId);

    @Query("SELECT SUM(d.totalFees) FROM ImportDeclaration d WHERE d.isPaid = true AND d.tenantId = :tenantId")
    java.math.BigDecimal sumTotalFeesCollectedByTenant(@Param("tenantId") String tenantId);

    // ========================================
    // REQUÊTES SPÉCIFIQUES
    // ========================================

    List<ImportDeclaration> findByStatusAndValidityEndDateBefore(ImportDeclarationStatus status, LocalDate date);

    @Query("SELECT d FROM ImportDeclaration d WHERE d.cadId = :cadId ORDER BY d.createdAt DESC")
    Page<ImportDeclaration> findByCadId(@Param("cadId") UUID cadId, Pageable pageable);

    @Query("SELECT d FROM ImportDeclaration d WHERE d.isMedication = true AND d.status = :status")
    Page<ImportDeclaration> findMedicationDeclarationsByStatus(@Param("status") ImportDeclarationStatus status, Pageable pageable);

    @Query("SELECT d FROM ImportDeclaration d WHERE d.isPaid = false AND d.status IN ('SUBMITTED', 'PENDING_PAYMENT')")
    List<ImportDeclaration> findPendingPaymentDeclarations();

    @Query("SELECT d FROM ImportDeclaration d WHERE d.routingDestination = 'SGS' AND d.status = 'PROCESSING_SGS'")
    Page<ImportDeclaration> findSgsProcessingDeclarations(Pageable pageable);

    @Query("SELECT d FROM ImportDeclaration d WHERE d.routingDestination = 'CUSTOMS' AND d.status = 'PROCESSING_CUSTOMS'")
    Page<ImportDeclaration> findCustomsProcessingDeclarations(Pageable pageable);

    // ========================================
    // STATISTIQUES PAR PAYS
    // ========================================

    @Query("SELECT d.originCountry, COUNT(d), SUM(d.totalFobValueXaf) FROM ImportDeclaration d " +
           "WHERE d.tenantId = :tenantId GROUP BY d.originCountry ORDER BY COUNT(d) DESC")
    List<Object[]> getStatisticsByOriginCountry(@Param("tenantId") String tenantId);

    @Query("SELECT d.supplierCountry, COUNT(d), SUM(d.totalFobValueXaf) FROM ImportDeclaration d " +
           "WHERE d.tenantId = :tenantId GROUP BY d.supplierCountry ORDER BY COUNT(d) DESC")
    List<Object[]> getStatisticsBySupplierCountry(@Param("tenantId") String tenantId);
}

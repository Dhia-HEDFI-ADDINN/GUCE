package cm.guce.document.domain.port;

import cm.guce.document.domain.model.Document;
import cm.guce.document.domain.model.Document.AccessLevel;
import cm.guce.document.domain.model.Document.DocumentStatus;
import cm.guce.document.domain.model.Document.DocumentType;
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
 * Repository for Document entity operations
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {

    /**
     * Find document by reference number
     */
    Optional<Document> findByReferenceNumber(String referenceNumber);

    /**
     * Find all documents for a specific tenant
     */
    Page<Document> findByTenantId(UUID tenantId, Pageable pageable);

    /**
     * Find documents by type and tenant
     */
    Page<Document> findByTenantIdAndDocumentType(UUID tenantId, DocumentType documentType, Pageable pageable);

    /**
     * Find documents by status
     */
    Page<Document> findByTenantIdAndStatus(UUID tenantId, DocumentStatus status, Pageable pageable);

    /**
     * Find documents linked to a specific entity (e.g., declaration, procedure)
     */
    List<Document> findByLinkedEntityTypeAndLinkedEntityId(String linkedEntityType, UUID linkedEntityId);

    /**
     * Find documents by uploader
     */
    Page<Document> findByUploadedBy(UUID uploadedBy, Pageable pageable);

    /**
     * Find documents uploaded within a date range
     */
    @Query("SELECT d FROM Document d WHERE d.tenantId = :tenantId " +
           "AND d.uploadedAt BETWEEN :startDate AND :endDate")
    Page<Document> findByTenantIdAndUploadedAtBetween(
        @Param("tenantId") UUID tenantId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    /**
     * Find documents by access level for a tenant
     */
    Page<Document> findByTenantIdAndAccessLevel(UUID tenantId, AccessLevel accessLevel, Pageable pageable);

    /**
     * Find all versions of a document
     */
    @Query("SELECT d FROM Document d WHERE d.originalDocumentId = :originalDocumentId " +
           "OR d.id = :originalDocumentId ORDER BY d.version DESC")
    List<Document> findAllVersions(@Param("originalDocumentId") UUID originalDocumentId);

    /**
     * Find latest version of a document
     */
    @Query("SELECT d FROM Document d WHERE (d.originalDocumentId = :documentId OR d.id = :documentId) " +
           "AND d.status != 'DELETED' ORDER BY d.version DESC LIMIT 1")
    Optional<Document> findLatestVersion(@Param("documentId") UUID documentId);

    /**
     * Count documents by tenant and status
     */
    long countByTenantIdAndStatus(UUID tenantId, DocumentStatus status);

    /**
     * Count documents by tenant and type
     */
    long countByTenantIdAndDocumentType(UUID tenantId, DocumentType documentType);

    /**
     * Find documents pending validation
     */
    @Query("SELECT d FROM Document d WHERE d.tenantId = :tenantId " +
           "AND d.status = 'PENDING' AND d.validatedAt IS NULL " +
           "ORDER BY d.uploadedAt ASC")
    Page<Document> findPendingValidation(@Param("tenantId") UUID tenantId, Pageable pageable);

    /**
     * Find documents for archival (older than specified date and validated)
     */
    @Query("SELECT d FROM Document d WHERE d.tenantId = :tenantId " +
           "AND d.status = 'VALIDATED' AND d.validatedAt < :beforeDate")
    List<Document> findForArchival(
        @Param("tenantId") UUID tenantId,
        @Param("beforeDate") LocalDateTime beforeDate
    );

    /**
     * Search documents by filename or reference
     */
    @Query("SELECT d FROM Document d WHERE d.tenantId = :tenantId " +
           "AND (LOWER(d.fileName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(d.referenceNumber) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(d.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Document> searchDocuments(
        @Param("tenantId") UUID tenantId,
        @Param("query") String query,
        Pageable pageable
    );

    /**
     * Find documents by checksum (for duplicate detection)
     */
    List<Document> findByTenantIdAndChecksum(UUID tenantId, String checksum);

    /**
     * Calculate total storage used by tenant
     */
    @Query("SELECT COALESCE(SUM(d.fileSize), 0) FROM Document d WHERE d.tenantId = :tenantId " +
           "AND d.status != 'DELETED'")
    long calculateTotalStorageByTenant(@Param("tenantId") UUID tenantId);

    /**
     * Find expired documents (past expiration date)
     */
    @Query("SELECT d FROM Document d WHERE d.expiresAt IS NOT NULL " +
           "AND d.expiresAt < :now AND d.status NOT IN ('ARCHIVED', 'DELETED')")
    List<Document> findExpiredDocuments(@Param("now") LocalDateTime now);
}

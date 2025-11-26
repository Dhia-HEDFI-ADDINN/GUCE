package cm.guce.document.application;

import cm.guce.document.adapter.out.minio.MinioStorageAdapter;
import cm.guce.document.domain.model.Document;
import cm.guce.document.domain.port.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Document Service - handles document operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final MinioStorageAdapter storageAdapter;
    private final Tika tika = new Tika();

    /**
     * Upload a new document
     */
    public Document uploadDocument(MultipartFile file, String tenantId, String entityType,
                                    String entityId, Document.DocumentType documentType,
                                    String description, Map<String, String> metadata,
                                    String uploadedBy) throws Exception {

        String originalFilename = file.getOriginalFilename();
        String contentType = tika.detect(file.getInputStream(), originalFilename);
        String fileExtension = getFileExtension(originalFilename);
        String filename = UUID.randomUUID() + fileExtension;
        String bucketName = "guce-documents-" + tenantId.toLowerCase();
        String storagePath = buildStoragePath(entityType, entityId, filename);

        // Calculate checksum
        String checksum = calculateSha256(file.getInputStream());

        // Upload to MinIO
        storageAdapter.uploadFile(bucketName, storagePath, file.getInputStream(),
            file.getSize(), contentType);

        // Save metadata
        Document document = Document.builder()
            .tenantId(tenantId)
            .filename(filename)
            .originalFilename(originalFilename)
            .contentType(contentType)
            .sizeBytes(file.getSize())
            .checksumSha256(checksum)
            .storagePath(storagePath)
            .bucketName(bucketName)
            .documentType(documentType)
            .status(Document.DocumentStatus.PENDING)
            .entityType(entityType)
            .entityId(entityId)
            .uploadedBy(uploadedBy)
            .uploadedAt(LocalDateTime.now())
            .version(1)
            .description(description)
            .accessLevel(Document.AccessLevel.INTERNAL)
            .isArchived(false)
            .metadata(metadata != null ? metadata : Map.of())
            .build();

        Document saved = documentRepository.save(document);
        log.info("Document uploaded: {} ({} bytes) by {} for entity {}/{}",
            originalFilename, file.getSize(), uploadedBy, entityType, entityId);

        return saved;
    }

    /**
     * Download a document
     */
    @Transactional(readOnly = true)
    public InputStream downloadDocument(Long documentId) throws Exception {
        Document document = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));

        return storageAdapter.downloadFile(document.getBucketName(), document.getStoragePath());
    }

    /**
     * Get document metadata
     */
    @Transactional(readOnly = true)
    public Optional<Document> getDocument(Long documentId) {
        return documentRepository.findById(documentId);
    }

    /**
     * Get documents by entity
     */
    @Transactional(readOnly = true)
    public Page<Document> getDocumentsByEntity(String entityType, String entityId, Pageable pageable) {
        return documentRepository.findByEntityTypeAndEntityId(entityType, entityId, pageable);
    }

    /**
     * Get documents by tenant
     */
    @Transactional(readOnly = true)
    public Page<Document> getDocumentsByTenant(String tenantId, Pageable pageable) {
        return documentRepository.findByTenantIdAndIsArchivedFalse(tenantId, pageable);
    }

    /**
     * Search documents
     */
    @Transactional(readOnly = true)
    public Page<Document> searchDocuments(String tenantId, String query,
                                           Document.DocumentType type, Pageable pageable) {
        if (type != null) {
            return documentRepository.findByTenantIdAndDocumentTypeAndOriginalFilenameContaining(
                tenantId, type, query, pageable);
        }
        return documentRepository.findByTenantIdAndOriginalFilenameContaining(tenantId, query, pageable);
    }

    /**
     * Update document status
     */
    public Document updateStatus(Long documentId, Document.DocumentStatus status) {
        Document document = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));

        document.setStatus(status);
        log.info("Document {} status updated to {}", documentId, status);
        return documentRepository.save(document);
    }

    /**
     * Archive a document
     */
    public Document archiveDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));

        document.setIsArchived(true);
        document.setArchivedAt(LocalDateTime.now());
        document.setStatus(Document.DocumentStatus.ARCHIVED);

        log.info("Document {} archived", documentId);
        return documentRepository.save(document);
    }

    /**
     * Delete a document (soft delete + storage removal)
     */
    public void deleteDocument(Long documentId) throws Exception {
        Document document = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));

        // Remove from storage
        storageAdapter.deleteFile(document.getBucketName(), document.getStoragePath());

        // Mark as deleted
        document.setStatus(Document.DocumentStatus.DELETED);
        documentRepository.save(document);

        log.info("Document {} deleted", documentId);
    }

    /**
     * Create a new version of a document
     */
    public Document createNewVersion(Long parentDocumentId, MultipartFile file,
                                      String uploadedBy) throws Exception {
        Document parent = documentRepository.findById(parentDocumentId)
            .orElseThrow(() -> new RuntimeException("Parent document not found: " + parentDocumentId));

        Document newVersion = uploadDocument(
            file,
            parent.getTenantId(),
            parent.getEntityType(),
            parent.getEntityId(),
            parent.getDocumentType(),
            parent.getDescription(),
            parent.getMetadata(),
            uploadedBy
        );

        newVersion.setParentDocumentId(parentDocumentId);
        newVersion.setVersion(parent.getVersion() + 1);

        return documentRepository.save(newVersion);
    }

    /**
     * Generate a presigned URL for download
     */
    public String generateDownloadUrl(Long documentId, int expirationMinutes) throws Exception {
        Document document = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));

        return storageAdapter.generatePresignedUrl(
            document.getBucketName(),
            document.getStoragePath(),
            expirationMinutes
        );
    }

    // ==================== Helper Methods ====================

    private String buildStoragePath(String entityType, String entityId, String filename) {
        return String.format("%s/%s/%s/%s",
            entityType != null ? entityType : "general",
            entityId != null ? entityId : "unlinked",
            LocalDateTime.now().toLocalDate().toString(),
            filename
        );
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private String calculateSha256(InputStream inputStream) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] buffer = new byte[8192];
        int bytesRead;
        while ((bytesRead = inputStream.read(buffer)) != -1) {
            digest.update(buffer, 0, bytesRead);
        }
        inputStream.reset();
        return HexFormat.of().formatHex(digest.digest());
    }
}

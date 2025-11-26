package cm.guce.document.domain.model;

import cm.guce.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Document entity - metadata for stored documents
 */
@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "filename", nullable = false)
    private String filename;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    @Column(name = "checksum_sha256")
    private String checksumSha256;

    @Column(name = "storage_path", nullable = false)
    private String storagePath;

    @Column(name = "bucket_name", nullable = false)
    private String bucketName;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type")
    private DocumentType documentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DocumentStatus status;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private String entityId;

    @Column(name = "uploaded_by", nullable = false)
    private String uploadedBy;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @Column(name = "version")
    private Integer version;

    @Column(name = "parent_document_id")
    private Long parentDocumentId;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "tags")
    private String tags;

    @Column(name = "expiration_date")
    private LocalDateTime expirationDate;

    @Column(name = "is_archived")
    private Boolean isArchived;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    @Column(name = "access_level")
    @Enumerated(EnumType.STRING)
    private AccessLevel accessLevel;

    @ElementCollection
    @CollectionTable(name = "document_metadata", joinColumns = @JoinColumn(name = "document_id"))
    @MapKeyColumn(name = "meta_key")
    @Column(name = "meta_value", length = 2000)
    private Map<String, String> metadata = new HashMap<>();

    public enum DocumentType {
        DECLARATION,
        INVOICE,
        CERTIFICATE,
        LICENSE,
        PERMIT,
        CONTRACT,
        REPORT,
        RECEIPT,
        IDENTITY,
        TRANSPORT,
        CUSTOMS,
        OTHER
    }

    public enum DocumentStatus {
        PENDING,
        VALIDATED,
        REJECTED,
        ARCHIVED,
        DELETED
    }

    public enum AccessLevel {
        PUBLIC,
        INTERNAL,
        RESTRICTED,
        CONFIDENTIAL
    }
}

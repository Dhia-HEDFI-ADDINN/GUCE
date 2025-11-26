package cm.guce.document.adapter.in.web;

import cm.guce.document.application.DocumentService;
import cm.guce.document.domain.model.Document;
import cm.guce.document.domain.model.Document.AccessLevel;
import cm.guce.document.domain.model.Document.DocumentStatus;
import cm.guce.document.domain.model.Document.DocumentType;
import cm.guce.document.domain.port.DocumentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for Document Management (GED)
 */
@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Documents", description = "Document Management (GED) API")
public class DocumentController {

    private final DocumentService documentService;
    private final DocumentRepository documentRepository;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a new document")
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("tenantId") UUID tenantId,
            @RequestParam("documentType") DocumentType documentType,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "accessLevel", defaultValue = "INTERNAL") AccessLevel accessLevel,
            @RequestParam(value = "linkedEntityType", required = false) String linkedEntityType,
            @RequestParam(value = "linkedEntityId", required = false) UUID linkedEntityId,
            @RequestParam(value = "expiresAt", required = false) LocalDateTime expiresAt,
            @AuthenticationPrincipal Jwt jwt) {

        try {
            UUID uploaderId = UUID.fromString(jwt.getSubject());

            Document document = documentService.uploadDocument(
                file.getInputStream(),
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize(),
                tenantId,
                uploaderId,
                documentType,
                description,
                accessLevel,
                linkedEntityType,
                linkedEntityId,
                expiresAt
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(document);
        } catch (Exception e) {
            log.error("Failed to upload document", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{documentId}")
    @Operation(summary = "Get document metadata")
    public ResponseEntity<Document> getDocument(@PathVariable UUID documentId) {
        return documentRepository.findById(documentId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{documentId}/download")
    @Operation(summary = "Download document content")
    public ResponseEntity<Resource> downloadDocument(@PathVariable UUID documentId) {
        try {
            Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

            InputStream inputStream = documentService.downloadDocument(documentId);
            InputStreamResource resource = new InputStreamResource(inputStream);

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(document.getContentType()))
                .contentLength(document.getFileSize())
                .body(resource);
        } catch (Exception e) {
            log.error("Failed to download document: {}", documentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{documentId}/presigned-url")
    @Operation(summary = "Get presigned URL for direct download")
    public ResponseEntity<Map<String, String>> getPresignedUrl(
            @PathVariable UUID documentId,
            @RequestParam(value = "expirationMinutes", defaultValue = "60") int expirationMinutes) {
        try {
            String url = documentService.generatePresignedUrl(documentId, expirationMinutes);
            Map<String, String> response = new HashMap<>();
            response.put("url", url);
            response.put("expiresIn", expirationMinutes + " minutes");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to generate presigned URL for document: {}", documentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/tenant/{tenantId}")
    @Operation(summary = "List documents for a tenant")
    public ResponseEntity<Page<Document>> listDocumentsByTenant(
            @PathVariable UUID tenantId,
            @RequestParam(value = "type", required = false) DocumentType type,
            @RequestParam(value = "status", required = false) DocumentStatus status,
            Pageable pageable) {

        Page<Document> documents;
        if (type != null) {
            documents = documentRepository.findByTenantIdAndDocumentType(tenantId, type, pageable);
        } else if (status != null) {
            documents = documentRepository.findByTenantIdAndStatus(tenantId, status, pageable);
        } else {
            documents = documentRepository.findByTenantId(tenantId, pageable);
        }

        return ResponseEntity.ok(documents);
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    @Operation(summary = "Get documents linked to an entity")
    public ResponseEntity<List<Document>> getDocumentsByEntity(
            @PathVariable String entityType,
            @PathVariable UUID entityId) {

        List<Document> documents = documentRepository.findByLinkedEntityTypeAndLinkedEntityId(entityType, entityId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/search")
    @Operation(summary = "Search documents")
    public ResponseEntity<Page<Document>> searchDocuments(
            @RequestParam UUID tenantId,
            @RequestParam String query,
            Pageable pageable) {

        Page<Document> documents = documentRepository.searchDocuments(tenantId, query, pageable);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{documentId}/versions")
    @Operation(summary = "Get all versions of a document")
    public ResponseEntity<List<Document>> getDocumentVersions(@PathVariable UUID documentId) {
        List<Document> versions = documentRepository.findAllVersions(documentId);
        return ResponseEntity.ok(versions);
    }

    @PostMapping("/{documentId}/version")
    @Operation(summary = "Upload a new version of an existing document")
    public ResponseEntity<Document> uploadNewVersion(
            @PathVariable UUID documentId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal Jwt jwt) {

        try {
            UUID uploaderId = UUID.fromString(jwt.getSubject());

            Document newVersion = documentService.createNewVersion(
                documentId,
                file.getInputStream(),
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize(),
                uploaderId
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(newVersion);
        } catch (Exception e) {
            log.error("Failed to create new version for document: {}", documentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{documentId}/validate")
    @Operation(summary = "Validate a document")
    public ResponseEntity<Document> validateDocument(
            @PathVariable UUID documentId,
            @AuthenticationPrincipal Jwt jwt) {

        return documentRepository.findById(documentId)
            .map(document -> {
                document.setStatus(DocumentStatus.VALIDATED);
                document.setValidatedBy(UUID.fromString(jwt.getSubject()));
                document.setValidatedAt(LocalDateTime.now());
                Document saved = documentRepository.save(document);
                return ResponseEntity.ok(saved);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{documentId}/reject")
    @Operation(summary = "Reject a document")
    public ResponseEntity<Document> rejectDocument(
            @PathVariable UUID documentId,
            @RequestParam String reason,
            @AuthenticationPrincipal Jwt jwt) {

        return documentRepository.findById(documentId)
            .map(document -> {
                document.setStatus(DocumentStatus.REJECTED);
                document.setValidatedBy(UUID.fromString(jwt.getSubject()));
                document.setValidatedAt(LocalDateTime.now());
                document.getMetadata().put("rejectionReason", reason);
                Document saved = documentRepository.save(document);
                return ResponseEntity.ok(saved);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{documentId}/archive")
    @Operation(summary = "Archive a document")
    public ResponseEntity<Document> archiveDocument(@PathVariable UUID documentId) {
        try {
            Document archived = documentService.archiveDocument(documentId);
            return ResponseEntity.ok(archived);
        } catch (Exception e) {
            log.error("Failed to archive document: {}", documentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{documentId}")
    @Operation(summary = "Delete a document (soft delete)")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID documentId) {
        try {
            documentService.deleteDocument(documentId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Failed to delete document: {}", documentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/tenant/{tenantId}/stats")
    @Operation(summary = "Get document statistics for a tenant")
    public ResponseEntity<Map<String, Object>> getDocumentStats(@PathVariable UUID tenantId) {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalStorage", documentRepository.calculateTotalStorageByTenant(tenantId));
        stats.put("pendingCount", documentRepository.countByTenantIdAndStatus(tenantId, DocumentStatus.PENDING));
        stats.put("validatedCount", documentRepository.countByTenantIdAndStatus(tenantId, DocumentStatus.VALIDATED));
        stats.put("archivedCount", documentRepository.countByTenantIdAndStatus(tenantId, DocumentStatus.ARCHIVED));

        // Count by document type
        Map<String, Long> byType = new HashMap<>();
        for (DocumentType type : DocumentType.values()) {
            byType.put(type.name(), documentRepository.countByTenantIdAndDocumentType(tenantId, type));
        }
        stats.put("countByType", byType);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/tenant/{tenantId}/pending")
    @Operation(summary = "Get documents pending validation")
    public ResponseEntity<Page<Document>> getPendingDocuments(
            @PathVariable UUID tenantId,
            Pageable pageable) {

        Page<Document> documents = documentRepository.findPendingValidation(tenantId, pageable);
        return ResponseEntity.ok(documents);
    }
}

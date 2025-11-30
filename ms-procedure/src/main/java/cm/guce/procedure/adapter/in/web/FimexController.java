package cm.guce.procedure.adapter.in.web;

import cm.guce.common.application.dto.ApiResponse;
import cm.guce.procedure.application.dto.FimexDto;
import cm.guce.procedure.application.service.FimexService;
import cm.guce.procedure.domain.model.FimexInscription.FimexStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Contrôleur REST pour les inscriptions FIMEX.
 * Gère le cycle de vie des demandes d'inscription et de renouvellement
 * au Fichier des Importateurs/Exportateurs.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/fimex")
@RequiredArgsConstructor
@Tag(name = "FIMEX", description = "API de gestion des inscriptions FIMEX (Fichier des Importateurs/Exportateurs)")
public class FimexController {

    private final FimexService service;

    // ========================================
    // LECTURE
    // ========================================

    @GetMapping("/{id}")
    @Operation(summary = "Récupère une inscription FIMEX par son ID")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT', 'GOV_AGENT', 'GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<FimexDto.Response>> getById(
            @Parameter(description = "ID de l'inscription") @PathVariable UUID id) {
        log.debug("REST request to get FIMEX inscription: {}", id);
        FimexDto.Response response = service.findById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/reference/{reference}")
    @Operation(summary = "Récupère une inscription FIMEX par sa référence")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT', 'GOV_AGENT', 'GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<FimexDto.Response>> getByReference(
            @Parameter(description = "Référence de l'inscription") @PathVariable String reference) {
        log.debug("REST request to get FIMEX inscription by reference: {}", reference);
        FimexDto.Response response = service.findByReference(reference);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/niu/{niu}")
    @Operation(summary = "Récupère les inscriptions FIMEX d'un opérateur")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT', 'OE_ADMIN')")
    public ResponseEntity<ApiResponse<Page<FimexDto.Summary>>> getByNiu(
            @Parameter(description = "NIU de l'opérateur") @PathVariable String niu,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.debug("REST request to get FIMEX inscriptions for NIU: {}", niu);
        Page<FimexDto.Summary> page = service.findByNiu(niu, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Récupère les inscriptions FIMEX par statut")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_AGENT', 'GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<Page<FimexDto.Summary>>> getByStatus(
            @Parameter(description = "Statut de l'inscription") @PathVariable FimexStatus status,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.debug("REST request to get FIMEX inscriptions by status: {}", status);
        Page<FimexDto.Summary> page = service.findByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/pending-processing")
    @Operation(summary = "Récupère les inscriptions en attente de traitement")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_AGENT', 'GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<Page<FimexDto.Summary>>> getPendingProcessing(
            @PageableDefault(sort = "submittedAt", direction = Sort.Direction.ASC) Pageable pageable) {
        log.debug("REST request to get pending FIMEX inscriptions");
        Page<FimexDto.Summary> page = service.findPendingProcessing(pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/search")
    @Operation(summary = "Recherche d'inscriptions FIMEX")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT', 'GOV_AGENT', 'GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<Page<FimexDto.Summary>>> search(
            @Parameter(description = "Terme de recherche") @RequestParam String query,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.debug("REST request to search FIMEX inscriptions: {}", query);
        Page<FimexDto.Summary> page = service.search(query, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/verify/{certificateNumber}")
    @Operation(summary = "Vérifie la validité d'un certificat FIMEX")
    public ResponseEntity<ApiResponse<FimexDto.CertificateInfo>> verifyCertificate(
            @Parameter(description = "Numéro du certificat") @PathVariable String certificateNumber) {
        log.debug("REST request to verify FIMEX certificate: {}", certificateNumber);
        FimexDto.CertificateInfo info = service.verifyCertificate(certificateNumber);
        return ResponseEntity.ok(ApiResponse.success(info));
    }

    // ========================================
    // CRÉATION ET MISE À JOUR
    // ========================================

    @PostMapping
    @Operation(summary = "Crée une nouvelle demande d'inscription FIMEX")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT')")
    public ResponseEntity<ApiResponse<FimexDto.Response>> create(
            @Valid @RequestBody FimexDto.CreateRequest request) {
        log.info("REST request to create FIMEX inscription for NIU: {}", request.getNiu());
        FimexDto.Response response = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response,
                "Demande d'inscription FIMEX créée avec succès. Référence: " + response.getReference()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Met à jour une inscription FIMEX (brouillon)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT')")
    public ResponseEntity<ApiResponse<FimexDto.Response>> update(
            @Parameter(description = "ID de l'inscription") @PathVariable UUID id,
            @Valid @RequestBody FimexDto.UpdateRequest request) {
        log.info("REST request to update FIMEX inscription: {}", id);
        FimexDto.Response response = service.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Inscription mise à jour avec succès"));
    }

    // ========================================
    // WORKFLOW
    // ========================================

    @PostMapping("/{id}/submit")
    @Operation(summary = "Soumet une demande d'inscription FIMEX")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT')")
    public ResponseEntity<ApiResponse<FimexDto.Response>> submit(
            @Parameter(description = "ID de l'inscription") @PathVariable UUID id) {
        log.info("REST request to submit FIMEX inscription: {}", id);
        FimexDto.Response response = service.submit(id);
        return ResponseEntity.ok(ApiResponse.success(response,
                "Demande d'inscription soumise avec succès"));
    }

    @PostMapping("/{id}/payment/cncc")
    @Operation(summary = "Enregistre le paiement CNCC (10 000 FCFA)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT', 'INTERMEDIARY')")
    public ResponseEntity<ApiResponse<FimexDto.Response>> recordCnccPayment(
            @Parameter(description = "ID de l'inscription") @PathVariable UUID id,
            @Parameter(description = "Référence du paiement") @RequestParam String paymentReference) {
        log.info("REST request to record CNCC payment for FIMEX inscription: {}", id);
        FimexDto.Response response = service.recordCnccPayment(id, paymentReference);
        return ResponseEntity.ok(ApiResponse.success(response, "Paiement CNCC enregistré (10 000 FCFA)"));
    }

    @PostMapping("/{id}/payment/mincom")
    @Operation(summary = "Enregistre le paiement MINCOMMERCE (15 000 FCFA)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT', 'INTERMEDIARY')")
    public ResponseEntity<ApiResponse<FimexDto.Response>> recordMincomPayment(
            @Parameter(description = "ID de l'inscription") @PathVariable UUID id,
            @Parameter(description = "Référence du paiement") @RequestParam String paymentReference) {
        log.info("REST request to record MINCOMMERCE payment for FIMEX inscription: {}", id);
        FimexDto.Response response = service.recordMincomPayment(id, paymentReference);
        return ResponseEntity.ok(ApiResponse.success(response, "Paiement MINCOMMERCE enregistré (15 000 FCFA)"));
    }

    @PostMapping("/{id}/start-processing")
    @Operation(summary = "Démarre le traitement d'une inscription FIMEX")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_AGENT')")
    public ResponseEntity<ApiResponse<FimexDto.Response>> startProcessing(
            @Parameter(description = "ID de l'inscription") @PathVariable UUID id) {
        log.info("REST request to start processing FIMEX inscription: {}", id);
        FimexDto.Response response = service.startProcessing(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Traitement démarré"));
    }

    @PostMapping("/{id}/request-complement")
    @Operation(summary = "Demande un complément d'information")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_AGENT')")
    public ResponseEntity<ApiResponse<FimexDto.Response>> requestComplement(
            @Parameter(description = "ID de l'inscription") @PathVariable UUID id,
            @Valid @RequestBody FimexDto.ComplementRequest request) {
        log.info("REST request to request complement for FIMEX inscription: {}", id);
        FimexDto.Response response = service.requestComplement(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Demande de complément envoyée"));
    }

    @PostMapping("/{id}/provide-complement")
    @Operation(summary = "Fournit le complément d'information demandé")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT')")
    public ResponseEntity<ApiResponse<FimexDto.Response>> provideComplement(
            @Parameter(description = "ID de l'inscription") @PathVariable UUID id) {
        log.info("REST request to provide complement for FIMEX inscription: {}", id);
        FimexDto.Response response = service.provideComplement(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Complément fourni"));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approuve une demande FIMEX")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_AGENT')")
    public ResponseEntity<ApiResponse<FimexDto.Response>> approve(
            @Parameter(description = "ID de l'inscription") @PathVariable UUID id) {
        log.info("REST request to approve FIMEX inscription: {}", id);
        FimexDto.Response response = service.approve(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Demande approuvée"));
    }

    @PostMapping("/{id}/sign")
    @Operation(summary = "Signe le certificat FIMEX")
    @PreAuthorize("hasRole('GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<FimexDto.Response>> signCertificate(
            @Parameter(description = "ID de l'inscription") @PathVariable UUID id,
            @Valid @RequestBody(required = false) FimexDto.SignatureRequest request) {
        log.info("REST request to sign certificate for FIMEX inscription: {}", id);
        FimexDto.Response response = service.signCertificate(id,
                request != null ? request : new FimexDto.SignatureRequest());
        return ResponseEntity.ok(ApiResponse.success(response,
                "Certificat signé avec succès. Numéro: " + response.getCertificateNumber()));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Rejette une demande FIMEX")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_AGENT', 'GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<FimexDto.Response>> reject(
            @Parameter(description = "ID de l'inscription") @PathVariable UUID id,
            @Valid @RequestBody FimexDto.RejectionRequest request) {
        log.info("REST request to reject FIMEX inscription: {}", id);
        FimexDto.Response response = service.reject(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Demande rejetée"));
    }

    // ========================================
    // STATISTIQUES
    // ========================================

    @GetMapping("/statistics")
    @Operation(summary = "Récupère les statistiques des inscriptions FIMEX")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<FimexDto.Statistics>> getStatistics() {
        log.debug("REST request to get FIMEX statistics");
        FimexDto.Statistics stats = service.getStatistics();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}

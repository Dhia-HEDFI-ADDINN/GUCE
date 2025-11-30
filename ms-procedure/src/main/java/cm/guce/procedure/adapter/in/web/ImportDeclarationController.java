package cm.guce.procedure.adapter.in.web;

import cm.guce.common.application.dto.ApiResponse;
import cm.guce.procedure.application.dto.ImportDeclarationDto;
import cm.guce.procedure.application.service.ImportDeclarationService;
import cm.guce.procedure.domain.model.ImportDeclaration.ImportDeclarationStatus;
import cm.guce.procedure.domain.model.ImportDeclaration.RoutingDestination;
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

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Contrôleur REST pour les Déclarations d'Importation.
 * Expose les endpoints pour la gestion complète du cycle de vie des DI.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/import-declarations")
@RequiredArgsConstructor
@Tag(name = "Import Declarations", description = "API de gestion des Déclarations d'Importation (DI)")
public class ImportDeclarationController {

    private final ImportDeclarationService service;

    // ========================================
    // LECTURE
    // ========================================

    @GetMapping("/{id}")
    @Operation(summary = "Récupère une DI par son ID")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT', 'GOV_AGENT', 'GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<ImportDeclarationDto.Response>> getById(
            @Parameter(description = "ID de la DI") @PathVariable UUID id) {
        log.debug("REST request to get ImportDeclaration: {}", id);
        ImportDeclarationDto.Response response = service.findById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/reference/{reference}")
    @Operation(summary = "Récupère une DI par sa référence")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT', 'GOV_AGENT', 'GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<ImportDeclarationDto.Response>> getByReference(
            @Parameter(description = "Référence de la DI") @PathVariable String reference) {
        log.debug("REST request to get ImportDeclaration by reference: {}", reference);
        ImportDeclarationDto.Response response = service.findByReference(reference);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/importer/{niu}")
    @Operation(summary = "Récupère les DI d'un importateur")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT', 'OE_ADMIN')")
    public ResponseEntity<ApiResponse<Page<ImportDeclarationDto.Summary>>> getByImporter(
            @Parameter(description = "NIU de l'importateur") @PathVariable String niu,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.debug("REST request to get ImportDeclarations for importer: {}", niu);
        Page<ImportDeclarationDto.Summary> page = service.findByImporter(niu, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Récupère les DI par statut")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_AGENT', 'GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<Page<ImportDeclarationDto.Summary>>> getByStatus(
            @Parameter(description = "Statut de la DI") @PathVariable ImportDeclarationStatus status,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.debug("REST request to get ImportDeclarations by status: {}", status);
        Page<ImportDeclarationDto.Summary> page = service.findByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/sgs")
    @Operation(summary = "Récupère les DI routées vers SGS")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_AGENT', 'GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<Page<ImportDeclarationDto.Summary>>> getSgsDeclarations(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.debug("REST request to get SGS ImportDeclarations");
        Page<ImportDeclarationDto.Summary> page = service.findSgsDeclarations(pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/customs")
    @Operation(summary = "Récupère les DI routées vers la Douane")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_AGENT', 'GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<Page<ImportDeclarationDto.Summary>>> getCustomsDeclarations(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.debug("REST request to get Customs ImportDeclarations");
        Page<ImportDeclarationDto.Summary> page = service.findCustomsDeclarations(pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/search")
    @Operation(summary = "Recherche de DI")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT', 'GOV_AGENT', 'GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<Page<ImportDeclarationDto.Summary>>> search(
            @Parameter(description = "Terme de recherche") @RequestParam String query,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.debug("REST request to search ImportDeclarations: {}", query);
        Page<ImportDeclarationDto.Summary> page = service.search(query, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    // ========================================
    // CRÉATION ET MISE À JOUR
    // ========================================

    @PostMapping
    @Operation(summary = "Crée une nouvelle DI (brouillon)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT')")
    public ResponseEntity<ApiResponse<ImportDeclarationDto.Response>> create(
            @Valid @RequestBody ImportDeclarationDto.CreateRequest request) {
        log.info("REST request to create ImportDeclaration for importer: {}", request.getImporterNiu());
        ImportDeclarationDto.Response response = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response,
                "Déclaration d'importation créée avec succès. Référence: " + response.getReference()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Met à jour une DI (brouillon uniquement)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT')")
    public ResponseEntity<ApiResponse<ImportDeclarationDto.Response>> update(
            @Parameter(description = "ID de la DI") @PathVariable UUID id,
            @Valid @RequestBody ImportDeclarationDto.UpdateRequest request) {
        log.info("REST request to update ImportDeclaration: {}", id);
        ImportDeclarationDto.Response response = service.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Déclaration d'importation mise à jour avec succès"));
    }

    // ========================================
    // WORKFLOW
    // ========================================

    @PostMapping("/{id}/submit")
    @Operation(summary = "Soumet une DI pour traitement")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT')")
    public ResponseEntity<ApiResponse<ImportDeclarationDto.Response>> submit(
            @Parameter(description = "ID de la DI") @PathVariable UUID id) {
        log.info("REST request to submit ImportDeclaration: {}", id);
        ImportDeclarationDto.Response response = service.submit(id);
        return ResponseEntity.ok(ApiResponse.success(response,
                "Déclaration d'importation soumise avec succès. Routage: " + response.getRoutingDestination()));
    }

    @PostMapping("/{id}/payment")
    @Operation(summary = "Enregistre le paiement d'une DI")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT', 'INTERMEDIARY')")
    public ResponseEntity<ApiResponse<ImportDeclarationDto.Response>> recordPayment(
            @Parameter(description = "ID de la DI") @PathVariable UUID id,
            @Parameter(description = "Référence du paiement") @RequestParam String paymentReference) {
        log.info("REST request to record payment for ImportDeclaration: {}", id);
        ImportDeclarationDto.Response response = service.recordPayment(id, paymentReference);
        return ResponseEntity.ok(ApiResponse.success(response, "Paiement enregistré avec succès"));
    }

    @PostMapping("/{id}/validate")
    @Operation(summary = "Valide une DI (SGS ou Douane)")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_AGENT', 'GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<ImportDeclarationDto.Response>> validate(
            @Parameter(description = "ID de la DI") @PathVariable UUID id) {
        log.info("REST request to validate ImportDeclaration: {}", id);
        ImportDeclarationDto.Response response = service.validate(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Déclaration d'importation validée avec succès"));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Rejette une DI")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_AGENT', 'GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<ImportDeclarationDto.Response>> reject(
            @Parameter(description = "ID de la DI") @PathVariable UUID id,
            @Parameter(description = "Motif du rejet") @RequestParam String reason) {
        log.info("REST request to reject ImportDeclaration: {}", id);
        ImportDeclarationDto.Response response = service.reject(id, reason);
        return ResponseEntity.ok(ApiResponse.success(response, "Déclaration d'importation rejetée"));
    }

    // ========================================
    // VISA TECHNIQUE (MÉDICAMENTS)
    // ========================================

    @PostMapping("/{id}/visa-technique")
    @Operation(summary = "Signe le visa technique MINSANTE (médicaments)")
    @PreAuthorize("hasRole('GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<ImportDeclarationDto.Response>> signVisaTechnique(
            @Parameter(description = "ID de la DI") @PathVariable UUID id,
            @Valid @RequestBody ImportDeclarationDto.VisaTechniqueRequest request) {
        log.info("REST request to sign visa technique for ImportDeclaration: {}", id);
        ImportDeclarationDto.Response response = service.signVisaTechnique(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Visa technique signé avec succès"));
    }

    // ========================================
    // PROROGATION ET AMENDEMENT
    // ========================================

    @PostMapping("/{id}/prorogatation")
    @Operation(summary = "Proroge une DI expirée (+3 mois)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT')")
    public ResponseEntity<ApiResponse<ImportDeclarationDto.Response>> prorogateDI(
            @Parameter(description = "ID de la DI") @PathVariable UUID id,
            @Valid @RequestBody ImportDeclarationDto.ProrogationRequest request) {
        log.info("REST request to prorogatate ImportDeclaration: {}", id);
        ImportDeclarationDto.Response response = service.prorogateDI(id, request);
        return ResponseEntity.ok(ApiResponse.success(response,
                "Déclaration d'importation prorogée jusqu'au " + response.getProrogationEndDate()));
    }

    @PostMapping("/{id}/amendment")
    @Operation(summary = "Crée un amendement d'une DI validée")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT')")
    public ResponseEntity<ApiResponse<ImportDeclarationDto.Response>> createAmendment(
            @Parameter(description = "ID de la DI") @PathVariable UUID id,
            @Valid @RequestBody ImportDeclarationDto.AmendmentRequest request) {
        log.info("REST request to create amendment for ImportDeclaration: {}", id);
        ImportDeclarationDto.Response response = service.createAmendment(id, request);
        return ResponseEntity.ok(ApiResponse.success(response,
                "Amendement #" + response.getAmendmentCount() + " créé avec succès"));
    }

    // ========================================
    // COTATION
    // ========================================

    @PostMapping("/{id}/assign-cad")
    @Operation(summary = "Cote un dossier à un CAD")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_ADMIN')")
    public ResponseEntity<ApiResponse<ImportDeclarationDto.Response>> assignToCad(
            @Parameter(description = "ID de la DI") @PathVariable UUID id,
            @Parameter(description = "ID du CAD") @RequestParam UUID cadId,
            @Parameter(description = "NIU du CAD") @RequestParam String cadNiu,
            @Parameter(description = "Nom du CAD") @RequestParam String cadName) {
        log.info("REST request to assign ImportDeclaration {} to CAD: {}", id, cadNiu);
        ImportDeclarationDto.Response response = service.assignToCad(id, cadId, cadNiu, cadName);
        return ResponseEntity.ok(ApiResponse.success(response, "Dossier coté au CAD " + cadName));
    }

    // ========================================
    // CALCULS ET SIMULATIONS
    // ========================================

    @GetMapping("/simulate-routing")
    @Operation(summary = "Simule le routage et les frais sans créer de DI")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT', 'OE_VIEWER')")
    public ResponseEntity<ApiResponse<ImportDeclarationDto.RoutingResult>> simulateRouting(
            @Parameter(description = "Valeur FOB en XAF") @RequestParam BigDecimal totalFobValueXaf,
            @Parameter(description = "Contient véhicules d'occasion") @RequestParam(defaultValue = "false") boolean hasUsedVehicles,
            @Parameter(description = "Contient poussins") @RequestParam(defaultValue = "false") boolean hasPoultry,
            @Parameter(description = "Contient oeufs") @RequestParam(defaultValue = "false") boolean hasEggs,
            @Parameter(description = "Exempté PVI") @RequestParam(defaultValue = "false") boolean isPviExempt) {
        log.debug("REST request to simulate routing for FOB value: {}", totalFobValueXaf);
        ImportDeclarationDto.RoutingResult result = service.simulateRouting(
                totalFobValueXaf, hasUsedVehicles, hasPoultry, hasEggs, isPviExempt);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/calculate-fees")
    @Operation(summary = "Calcule les frais détaillés")
    @PreAuthorize("hasAnyRole('ADMIN', 'OE_DECLARANT', 'OE_VIEWER')")
    public ResponseEntity<ApiResponse<ImportDeclarationDto.FeeCalculation>> calculateFees(
            @Parameter(description = "Valeur FOB en XAF") @RequestParam BigDecimal totalFobValueXaf,
            @Parameter(description = "Destination (SGS ou CUSTOMS)") @RequestParam RoutingDestination destination,
            @Parameter(description = "Exempté PVI") @RequestParam(defaultValue = "false") boolean isPviExempt) {
        log.debug("REST request to calculate fees for FOB value: {}", totalFobValueXaf);
        ImportDeclarationDto.FeeCalculation result = service.calculateFees(totalFobValueXaf, destination, isPviExempt);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // ========================================
    // STATISTIQUES
    // ========================================

    @GetMapping("/statistics")
    @Operation(summary = "Récupère les statistiques des DI")
    @PreAuthorize("hasAnyRole('ADMIN', 'GOV_SUPERVISOR')")
    public ResponseEntity<ApiResponse<ImportDeclarationDto.Statistics>> getStatistics() {
        log.debug("REST request to get ImportDeclaration statistics");
        ImportDeclarationDto.Statistics stats = service.getStatistics();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}

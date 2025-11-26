package cm.guce.procedure.adapter.in.web;

import cm.guce.common.application.dto.ApiResponse;
import cm.guce.common.domain.model.EntityStatus;
import cm.guce.procedure.application.dto.DeclarationDto;
import cm.guce.procedure.application.service.DeclarationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller REST pour la gestion des déclarations.
 */
@RestController
@RequestMapping("/api/v1/declarations")
@RequiredArgsConstructor
@Tag(name = "Déclarations", description = "API de gestion des déclarations et demandes")
public class DeclarationController {

    private final DeclarationService declarationService;

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une déclaration",
            description = "Récupère les détails complets d'une déclaration")
    public ApiResponse<DeclarationDto.Response> findById(
            @Parameter(description = "ID de la déclaration") @PathVariable UUID id) {
        return ApiResponse.success(declarationService.findById(id));
    }

    @GetMapping("/reference/{reference}")
    @Operation(summary = "Recherche par référence",
            description = "Récupère une déclaration par sa référence")
    public ApiResponse<DeclarationDto.Response> findByReference(
            @Parameter(description = "Référence de la déclaration") @PathVariable String reference) {
        return ApiResponse.success(declarationService.findByReference(reference));
    }

    @GetMapping("/operator/{operatorId}")
    @Operation(summary = "Déclarations d'un opérateur",
            description = "Récupère les déclarations d'un opérateur économique")
    public ApiResponse<List<DeclarationDto.Summary>> findByOperator(
            @Parameter(description = "ID de l'opérateur") @PathVariable UUID operatorId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<DeclarationDto.Summary> page = declarationService.findByOperator(operatorId, pageable);
        return ApiResponse.success(
                page.getContent(),
                ApiResponse.PaginationInfo.of(page.getNumber(), page.getSize(), page.getTotalElements())
        );
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('AGENT_DOUANE', 'CHEF_BUREAU_DOUANE', 'ADMIN_FONCTIONNEL')")
    @Operation(summary = "Déclarations par statut",
            description = "Récupère les déclarations par statut (agents uniquement)")
    public ApiResponse<List<DeclarationDto.Summary>> findByStatus(
            @Parameter(description = "Statut") @PathVariable EntityStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<DeclarationDto.Summary> page = declarationService.findByStatus(status, pageable);
        return ApiResponse.success(
                page.getContent(),
                ApiResponse.PaginationInfo.of(page.getNumber(), page.getSize(), page.getTotalElements())
        );
    }

    @GetMapping("/search")
    @Operation(summary = "Recherche de déclarations",
            description = "Recherche de déclarations par référence ou opérateur")
    public ApiResponse<List<DeclarationDto.Summary>> search(
            @Parameter(description = "Terme de recherche") @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<DeclarationDto.Summary> page = declarationService.search(q, pageable);
        return ApiResponse.success(
                page.getContent(),
                ApiResponse.PaginationInfo.of(page.getNumber(), page.getSize(), page.getTotalElements())
        );
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('AGENT_GUCE', 'SUPERVISEUR_GUCE', 'ADMIN_FONCTIONNEL')")
    @Operation(summary = "Statistiques",
            description = "Récupère les statistiques des déclarations")
    public ApiResponse<DeclarationDto.Statistics> getStatistics() {
        return ApiResponse.success(declarationService.getStatistics());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('OPERATEUR_ECONOMIQUE', 'DECLARANT', 'COMMISSIONNAIRE_AGREE')")
    @Operation(summary = "Créer une déclaration",
            description = "Crée une nouvelle déclaration (brouillon)")
    public ApiResponse<DeclarationDto.Response> create(
            @Valid @RequestBody DeclarationDto.CreateRequest request) {
        return ApiResponse.success(declarationService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OPERATEUR_ECONOMIQUE', 'DECLARANT', 'COMMISSIONNAIRE_AGREE')")
    @Operation(summary = "Modifier une déclaration",
            description = "Met à jour une déclaration (brouillon uniquement)")
    public ApiResponse<DeclarationDto.Response> update(
            @Parameter(description = "ID de la déclaration") @PathVariable UUID id,
            @Valid @RequestBody DeclarationDto.UpdateRequest request) {
        return ApiResponse.success(declarationService.update(id, request));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('OPERATEUR_ECONOMIQUE', 'DECLARANT', 'COMMISSIONNAIRE_AGREE')")
    @Operation(summary = "Soumettre une déclaration",
            description = "Soumet une déclaration pour traitement")
    public ApiResponse<DeclarationDto.Response> submit(
            @Parameter(description = "ID de la déclaration") @PathVariable UUID id) {
        return ApiResponse.success(declarationService.submit(id));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('AGENT_DOUANE', 'CHEF_BUREAU_DOUANE', 'INSPECTEUR_DOUANE')")
    @Operation(summary = "Approuver une tâche",
            description = "Approuve une tâche de la déclaration")
    public ApiResponse<DeclarationDto.Response> approve(
            @Parameter(description = "ID de la déclaration") @PathVariable UUID id,
            @Valid @RequestBody DeclarationDto.TaskAction action) {
        return ApiResponse.success(declarationService.approveTask(id, action));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('AGENT_DOUANE', 'CHEF_BUREAU_DOUANE', 'INSPECTEUR_DOUANE')")
    @Operation(summary = "Rejeter une déclaration",
            description = "Rejette une déclaration avec un motif")
    public ApiResponse<DeclarationDto.Response> reject(
            @Parameter(description = "ID de la déclaration") @PathVariable UUID id,
            @Parameter(description = "Motif de rejet") @RequestParam String reason) {
        return ApiResponse.success(declarationService.reject(id, reason));
    }
}

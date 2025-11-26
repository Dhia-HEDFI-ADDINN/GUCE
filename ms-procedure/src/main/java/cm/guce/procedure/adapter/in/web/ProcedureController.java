package cm.guce.procedure.adapter.in.web;

import cm.guce.common.application.dto.ApiResponse;
import cm.guce.procedure.application.dto.ProcedureDto;
import cm.guce.procedure.application.service.ProcedureService;
import cm.guce.procedure.domain.model.Procedure;
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
 * Controller REST pour la gestion des procédures.
 */
@RestController
@RequestMapping("/api/v1/procedures")
@RequiredArgsConstructor
@Tag(name = "Procédures", description = "API de gestion des procédures du commerce extérieur")
public class ProcedureController {

    private final ProcedureService procedureService;

    @GetMapping
    @Operation(summary = "Liste des procédures publiées",
            description = "Récupère la liste des procédures publiées et actives")
    public ApiResponse<List<ProcedureDto.Summary>> findPublished() {
        return ApiResponse.success(procedureService.findPublished());
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Procédures par catégorie",
            description = "Récupère les procédures publiées d'une catégorie")
    public ApiResponse<List<ProcedureDto.Summary>> findByCategory(
            @Parameter(description = "Catégorie (IMPORT, EXPORT, TRANSIT, etc.)")
            @PathVariable Procedure.ProcedureCategory category) {
        return ApiResponse.success(procedureService.findPublishedByCategory(category));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une procédure",
            description = "Récupère les détails complets d'une procédure")
    public ApiResponse<ProcedureDto.Response> findById(
            @Parameter(description = "ID de la procédure") @PathVariable UUID id) {
        return ApiResponse.success(procedureService.findById(id));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Recherche par code",
            description = "Récupère une procédure par son code")
    public ApiResponse<ProcedureDto.Response> findByCode(
            @Parameter(description = "Code de la procédure") @PathVariable String code) {
        return ApiResponse.success(procedureService.findByCode(code));
    }

    @GetMapping("/search")
    @Operation(summary = "Recherche de procédures",
            description = "Recherche de procédures par nom ou code")
    public ApiResponse<List<ProcedureDto.Summary>> search(
            @Parameter(description = "Terme de recherche") @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ProcedureDto.Summary> page = procedureService.search(q, pageable);
        return ApiResponse.success(
                page.getContent(),
                ApiResponse.PaginationInfo.of(page.getNumber(), page.getSize(), page.getTotalElements())
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN_FONCTIONNEL') or hasRole('ADMIN_TECHNIQUE')")
    @Operation(summary = "Créer une procédure",
            description = "Crée une nouvelle procédure (administrateurs uniquement)")
    public ApiResponse<ProcedureDto.Response> create(
            @Valid @RequestBody ProcedureDto.CreateRequest request) {
        return ApiResponse.success(procedureService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN_FONCTIONNEL') or hasRole('ADMIN_TECHNIQUE')")
    @Operation(summary = "Modifier une procédure",
            description = "Met à jour une procédure (brouillon uniquement)")
    public ApiResponse<ProcedureDto.Response> update(
            @Parameter(description = "ID de la procédure") @PathVariable UUID id,
            @Valid @RequestBody ProcedureDto.UpdateRequest request) {
        return ApiResponse.success(procedureService.update(id, request));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN_FONCTIONNEL') or hasRole('ADMIN_TECHNIQUE')")
    @Operation(summary = "Publier une procédure",
            description = "Publie une procédure pour la rendre disponible aux opérateurs")
    public ApiResponse<ProcedureDto.Response> publish(
            @Parameter(description = "ID de la procédure") @PathVariable UUID id) {
        return ApiResponse.success(procedureService.publish(id));
    }

    @PostMapping("/{id}/new-version")
    @PreAuthorize("hasRole('ADMIN_FONCTIONNEL') or hasRole('ADMIN_TECHNIQUE')")
    @Operation(summary = "Créer une nouvelle version",
            description = "Crée une nouvelle version d'une procédure publiée")
    public ApiResponse<ProcedureDto.Response> createNewVersion(
            @Parameter(description = "ID de la procédure") @PathVariable UUID id) {
        return ApiResponse.success(procedureService.createNewVersion(id));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN_TECHNIQUE')")
    @Operation(summary = "Archiver une procédure",
            description = "Archive une procédure (ne peut plus être utilisée)")
    public void archive(
            @Parameter(description = "ID de la procédure") @PathVariable UUID id) {
        procedureService.archive(id);
    }
}

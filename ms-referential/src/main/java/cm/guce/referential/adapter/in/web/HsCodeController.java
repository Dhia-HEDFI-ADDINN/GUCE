package cm.guce.referential.adapter.in.web;

import cm.guce.common.application.dto.ApiResponse;
import cm.guce.referential.application.dto.HsCodeDto;
import cm.guce.referential.application.service.HsCodeService;
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
 * Controller REST pour la gestion des codes du Système Harmonisé.
 */
@RestController
@RequestMapping("/api/v1/referential/hs-codes")
@RequiredArgsConstructor
@Tag(name = "Codes SH", description = "API de gestion des codes du Système Harmonisé (OMD)")
public class HsCodeController {

    private final HsCodeService hsCodeService;

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un code SH", description = "Récupère les détails d'un code SH par son ID")
    public ApiResponse<HsCodeDto.Response> findById(
            @Parameter(description = "ID du code SH") @PathVariable UUID id) {
        return ApiResponse.success(hsCodeService.findById(id));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Recherche par code", description = "Récupère un code SH par son code")
    public ApiResponse<HsCodeDto.Response> findByCode(
            @Parameter(description = "Code SH (ex: 0901, 090111)") @PathVariable String code) {
        return ApiResponse.success(hsCodeService.findByCode(code));
    }

    @GetMapping("/chapters")
    @Operation(summary = "Liste des chapitres", description = "Récupère la liste des chapitres (niveau 2)")
    public ApiResponse<List<HsCodeDto.Summary>> findChapters() {
        return ApiResponse.success(hsCodeService.findChapters());
    }

    @GetMapping("/{parentId}/children")
    @Operation(summary = "Enfants d'un code", description = "Récupère les sous-codes d'un code SH")
    public ApiResponse<List<HsCodeDto.Summary>> findChildren(
            @Parameter(description = "ID du code parent") @PathVariable UUID parentId) {
        return ApiResponse.success(hsCodeService.findChildren(parentId));
    }

    @GetMapping("/prefix/{prefix}")
    @Operation(summary = "Recherche par préfixe", description = "Récupère les codes SH commençant par un préfixe")
    public ApiResponse<List<HsCodeDto.Summary>> findByPrefix(
            @Parameter(description = "Préfixe du code (ex: 09, 0901)") @PathVariable String prefix) {
        return ApiResponse.success(hsCodeService.findByPrefix(prefix));
    }

    @GetMapping("/search")
    @Operation(summary = "Recherche de codes SH", description = "Recherche de codes SH par code ou description")
    public ApiResponse<List<HsCodeDto.Response>> search(
            @Parameter(description = "Terme de recherche") @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<HsCodeDto.Response> page = hsCodeService.search(q, pageable);
        return ApiResponse.success(
                page.getContent(),
                ApiResponse.PaginationInfo.of(page.getNumber(), page.getSize(), page.getTotalElements())
        );
    }

    @GetMapping("/tariff/{code}")
    @Operation(summary = "Informations tarifaires", description = "Récupère les informations tarifaires d'un code SH")
    public ApiResponse<HsCodeDto.TariffInfo> getTariffInfo(
            @Parameter(description = "Code SH") @PathVariable String code) {
        return ApiResponse.success(hsCodeService.getTariffInfo(code));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN_FONCTIONNEL') or hasRole('ADMIN_TECHNIQUE')")
    @Operation(summary = "Créer un code SH", description = "Crée un nouveau code SH dans le référentiel")
    public ApiResponse<HsCodeDto.Response> create(
            @Valid @RequestBody HsCodeDto.CreateRequest request) {
        return ApiResponse.success(hsCodeService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN_FONCTIONNEL') or hasRole('ADMIN_TECHNIQUE')")
    @Operation(summary = "Modifier un code SH", description = "Met à jour les informations d'un code SH")
    public ApiResponse<HsCodeDto.Response> update(
            @Parameter(description = "ID du code SH") @PathVariable UUID id,
            @Valid @RequestBody HsCodeDto.UpdateRequest request) {
        return ApiResponse.success(hsCodeService.update(id, request));
    }
}

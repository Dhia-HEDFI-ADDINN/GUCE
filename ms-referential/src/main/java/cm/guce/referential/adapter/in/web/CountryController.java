package cm.guce.referential.adapter.in.web;

import cm.guce.common.application.dto.ApiResponse;
import cm.guce.referential.application.dto.CountryDto;
import cm.guce.referential.application.service.CountryService;
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
 * Controller REST pour la gestion des pays.
 */
@RestController
@RequestMapping("/api/v1/referential/countries")
@RequiredArgsConstructor
@Tag(name = "Pays", description = "API de gestion des pays (ISO 3166)")
public class CountryController {

    private final CountryService countryService;

    @GetMapping
    @Operation(summary = "Liste des pays actifs", description = "Récupère la liste de tous les pays actifs")
    public ApiResponse<List<CountryDto.Response>> findAllActive() {
        return ApiResponse.success(countryService.findAllActive());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un pays", description = "Récupère les détails d'un pays par son ID")
    public ApiResponse<CountryDto.Response> findById(
            @Parameter(description = "ID du pays") @PathVariable UUID id) {
        return ApiResponse.success(countryService.findById(id));
    }

    @GetMapping("/iso2/{code}")
    @Operation(summary = "Recherche par code ISO2", description = "Récupère un pays par son code ISO2")
    public ApiResponse<CountryDto.Response> findByCodeIso2(
            @Parameter(description = "Code ISO2 (ex: CM, TD, CF)") @PathVariable String code) {
        return ApiResponse.success(countryService.findByCodeIso2(code));
    }

    @GetMapping("/cemac")
    @Operation(summary = "Pays CEMAC", description = "Récupère la liste des pays de la zone CEMAC")
    public ApiResponse<List<CountryDto.Summary>> findCemacCountries() {
        return ApiResponse.success(countryService.findCemacCountries());
    }

    @GetMapping("/search")
    @Operation(summary = "Recherche de pays", description = "Recherche de pays par nom ou code")
    public ApiResponse<List<CountryDto.Response>> search(
            @Parameter(description = "Terme de recherche") @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<CountryDto.Response> page = countryService.search(q, pageable);
        return ApiResponse.success(
                page.getContent(),
                ApiResponse.PaginationInfo.of(page.getNumber(), page.getSize(), page.getTotalElements())
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN_FONCTIONNEL') or hasRole('ADMIN_TECHNIQUE')")
    @Operation(summary = "Créer un pays", description = "Crée un nouveau pays dans le référentiel")
    public ApiResponse<CountryDto.Response> create(
            @Valid @RequestBody CountryDto.CreateRequest request) {
        return ApiResponse.success(countryService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN_FONCTIONNEL') or hasRole('ADMIN_TECHNIQUE')")
    @Operation(summary = "Modifier un pays", description = "Met à jour les informations d'un pays")
    public ApiResponse<CountryDto.Response> update(
            @Parameter(description = "ID du pays") @PathVariable UUID id,
            @Valid @RequestBody CountryDto.UpdateRequest request) {
        return ApiResponse.success(countryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN_TECHNIQUE')")
    @Operation(summary = "Supprimer un pays", description = "Supprime (désactive) un pays du référentiel")
    public void delete(
            @Parameter(description = "ID du pays") @PathVariable UUID id) {
        countryService.delete(id);
    }
}

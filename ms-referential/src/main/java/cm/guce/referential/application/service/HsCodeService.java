package cm.guce.referential.application.service;

import cm.guce.common.domain.exception.ResourceNotFoundException;
import cm.guce.common.domain.exception.ValidationException;
import cm.guce.common.security.SecurityUtils;
import cm.guce.referential.application.dto.HsCodeDto;
import cm.guce.referential.application.mapper.HsCodeMapper;
import cm.guce.referential.domain.model.HsCode;
import cm.guce.referential.domain.port.HsCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service de gestion des codes du Système Harmonisé.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HsCodeService {

    private final HsCodeRepository hsCodeRepository;
    private final HsCodeMapper hsCodeMapper;

    /**
     * Récupère un code SH par son ID.
     */
    @Cacheable(value = "hscodes", key = "#id")
    public HsCodeDto.Response findById(UUID id) {
        log.debug("Fetching HS code by id: {}", id);
        HsCode hsCode = hsCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Code SH", id));
        return hsCodeMapper.toResponse(hsCode);
    }

    /**
     * Récupère un code SH par son code.
     */
    @Cacheable(value = "hscodes", key = "'code-' + #code")
    public HsCodeDto.Response findByCode(String code) {
        log.debug("Fetching HS code: {}", code);
        HsCode hsCode = hsCodeRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Code SH", code));
        return hsCodeMapper.toResponse(hsCode);
    }

    /**
     * Récupère les chapitres (niveau 2).
     */
    @Cacheable(value = "hscodes", key = "'chapters'")
    public List<HsCodeDto.Summary> findChapters() {
        log.debug("Fetching HS chapters");
        return hsCodeMapper.toSummaryList(hsCodeRepository.findByParentIsNull());
    }

    /**
     * Récupère les enfants d'un code SH.
     */
    @Cacheable(value = "hscodes", key = "'children-' + #parentId")
    public List<HsCodeDto.Summary> findChildren(UUID parentId) {
        log.debug("Fetching children of HS code: {}", parentId);
        return hsCodeMapper.toSummaryList(hsCodeRepository.findByParentId(parentId));
    }

    /**
     * Récupère les codes SH commençant par un préfixe.
     */
    public List<HsCodeDto.Summary> findByPrefix(String prefix) {
        log.debug("Fetching HS codes starting with: {}", prefix);
        return hsCodeMapper.toSummaryList(hsCodeRepository.findByCodeStartingWith(prefix));
    }

    /**
     * Recherche de codes SH.
     */
    public Page<HsCodeDto.Response> search(String query, Pageable pageable) {
        log.debug("Searching HS codes with query: {}", query);
        return hsCodeRepository.search(query, pageable)
                .map(hsCodeMapper::toResponse);
    }

    /**
     * Récupère les informations tarifaires d'un code SH.
     */
    @Cacheable(value = "hscodes", key = "'tariff-' + #code")
    public HsCodeDto.TariffInfo getTariffInfo(String code) {
        log.debug("Getting tariff info for: {}", code);
        HsCode hsCode = hsCodeRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Code SH", code));

        HsCodeDto.TariffInfo tariffInfo = new HsCodeDto.TariffInfo();
        tariffInfo.setCode(hsCode.getCode());
        tariffInfo.setDescription(hsCode.getDescriptionFr());
        tariffInfo.setDutyRate(hsCode.getDutyRate() != null ? hsCode.getDutyRate() : BigDecimal.ZERO);
        tariffInfo.setVatRate(hsCode.getVatRate() != null ? hsCode.getVatRate() : BigDecimal.ZERO);
        tariffInfo.setExciseRate(hsCode.getExciseRate() != null ? hsCode.getExciseRate() : BigDecimal.ZERO);

        // Calcul du taux total
        BigDecimal totalRate = tariffInfo.getDutyRate()
                .add(tariffInfo.getVatRate())
                .add(tariffInfo.getExciseRate());
        tariffInfo.setTotalRate(totalRate);

        // Documents requis
        List<String> requiredDocuments = new ArrayList<>();
        if (Boolean.TRUE.equals(hsCode.getRequiresLicense())) {
            requiredDocuments.add("Licence d'importation/exportation");
        }
        if (Boolean.TRUE.equals(hsCode.getRequiresPhytosanitary())) {
            requiredDocuments.add("Certificat phytosanitaire");
        }
        if (Boolean.TRUE.equals(hsCode.getRequiresVeterinary())) {
            requiredDocuments.add("Certificat vétérinaire");
        }
        tariffInfo.setRequiredDocuments(requiredDocuments);

        // Restrictions
        List<String> restrictions = new ArrayList<>();
        if (Boolean.TRUE.equals(hsCode.getIsProhibited())) {
            restrictions.add("PRODUIT PROHIBÉ - Importation/Exportation interdite");
        }
        if (Boolean.TRUE.equals(hsCode.getIsRestricted())) {
            restrictions.add("PRODUIT RESTREINT - Autorisation spéciale requise");
        }
        tariffInfo.setRestrictions(restrictions);

        return tariffInfo;
    }

    /**
     * Crée un nouveau code SH.
     */
    @Transactional
    @CacheEvict(value = "hscodes", allEntries = true)
    public HsCodeDto.Response create(HsCodeDto.CreateRequest request) {
        log.info("Creating HS code: {}", request.getCode());

        validateCreate(request);

        HsCode hsCode = hsCodeMapper.toEntity(request);
        hsCode.setTenantId(SecurityUtils.getCurrentTenantId().orElse("default"));

        // Extraction des niveaux hiérarchiques
        String code = request.getCode();
        if (code.length() >= 2) hsCode.setChapter(code.substring(0, 2));
        if (code.length() >= 4) hsCode.setHeading(code.substring(0, 4));
        if (code.length() >= 6) hsCode.setSubheading(code.substring(0, 6));
        if (code.length() > 6) hsCode.setTariffLine(code);

        // Liaison au parent
        if (request.getParentId() != null) {
            HsCode parent = hsCodeRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Code SH parent", request.getParentId()));
            hsCode.setParent(parent);
        }

        hsCode = hsCodeRepository.save(hsCode);
        log.info("HS code created with id: {}", hsCode.getId());

        return hsCodeMapper.toResponse(hsCode);
    }

    /**
     * Met à jour un code SH.
     */
    @Transactional
    @CacheEvict(value = "hscodes", allEntries = true)
    public HsCodeDto.Response update(UUID id, HsCodeDto.UpdateRequest request) {
        log.info("Updating HS code: {}", id);

        HsCode hsCode = hsCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Code SH", id));

        hsCodeMapper.updateEntity(request, hsCode);
        hsCode = hsCodeRepository.save(hsCode);

        log.info("HS code updated: {}", hsCode.getId());
        return hsCodeMapper.toResponse(hsCode);
    }

    private void validateCreate(HsCodeDto.CreateRequest request) {
        ValidationException validationException = new ValidationException("Erreur de validation");

        if (hsCodeRepository.existsByCode(request.getCode())) {
            validationException.addFieldError("code", "Ce code SH existe déjà");
        }

        if (validationException.hasErrors()) {
            throw validationException;
        }
    }
}

package cm.guce.referential.application.service;

import cm.guce.common.domain.exception.ResourceNotFoundException;
import cm.guce.common.domain.exception.ValidationException;
import cm.guce.common.security.SecurityUtils;
import cm.guce.referential.application.dto.CountryDto;
import cm.guce.referential.application.mapper.CountryMapper;
import cm.guce.referential.domain.model.Country;
import cm.guce.referential.domain.port.CountryRepository;
import cm.guce.referential.domain.port.CurrencyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service de gestion des pays.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CountryService {

    private final CountryRepository countryRepository;
    private final CurrencyRepository currencyRepository;
    private final CountryMapper countryMapper;

    /**
     * Récupère tous les pays actifs.
     */
    @Cacheable(value = "countries", key = "'all-active'")
    public List<CountryDto.Response> findAllActive() {
        log.debug("Fetching all active countries");
        return countryMapper.toResponseList(countryRepository.findByIsActiveTrue());
    }

    /**
     * Récupère un pays par son ID.
     */
    @Cacheable(value = "countries", key = "#id")
    public CountryDto.Response findById(UUID id) {
        log.debug("Fetching country by id: {}", id);
        Country country = countryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pays", id));
        return countryMapper.toResponse(country);
    }

    /**
     * Récupère un pays par son code ISO2.
     */
    @Cacheable(value = "countries", key = "'iso2-' + #codeIso2")
    public CountryDto.Response findByCodeIso2(String codeIso2) {
        log.debug("Fetching country by ISO2 code: {}", codeIso2);
        Country country = countryRepository.findByCodeIso2(codeIso2.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Pays", codeIso2));
        return countryMapper.toResponse(country);
    }

    /**
     * Récupère les pays de la zone CEMAC.
     */
    @Cacheable(value = "countries", key = "'cemac'")
    public List<CountryDto.Summary> findCemacCountries() {
        log.debug("Fetching CEMAC countries");
        return countryMapper.toSummaryList(countryRepository.findByIsCemacTrue());
    }

    /**
     * Recherche de pays.
     */
    public Page<CountryDto.Response> search(String query, Pageable pageable) {
        log.debug("Searching countries with query: {}", query);
        return countryRepository.search(query, pageable)
                .map(countryMapper::toResponse);
    }

    /**
     * Crée un nouveau pays.
     */
    @Transactional
    @CacheEvict(value = "countries", allEntries = true)
    public CountryDto.Response create(CountryDto.CreateRequest request) {
        log.info("Creating new country: {}", request.getCodeIso3());

        validateCreate(request);

        Country country = countryMapper.toEntity(request);
        country.setTenantId(SecurityUtils.getCurrentTenantId().orElse("default"));

        if (request.getDefaultCurrencyId() != null) {
            country.setDefaultCurrency(currencyRepository.findById(request.getDefaultCurrencyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Devise", request.getDefaultCurrencyId())));
        }

        country = countryRepository.save(country);
        log.info("Country created with id: {}", country.getId());

        return countryMapper.toResponse(country);
    }

    /**
     * Met à jour un pays.
     */
    @Transactional
    @CacheEvict(value = "countries", allEntries = true)
    public CountryDto.Response update(UUID id, CountryDto.UpdateRequest request) {
        log.info("Updating country: {}", id);

        Country country = countryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pays", id));

        countryMapper.updateEntity(request, country);

        if (request.getDefaultCurrencyId() != null) {
            country.setDefaultCurrency(currencyRepository.findById(request.getDefaultCurrencyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Devise", request.getDefaultCurrencyId())));
        }

        country = countryRepository.save(country);
        log.info("Country updated: {}", country.getId());

        return countryMapper.toResponse(country);
    }

    /**
     * Supprime (soft delete) un pays.
     */
    @Transactional
    @CacheEvict(value = "countries", allEntries = true)
    public void delete(UUID id) {
        log.info("Deleting country: {}", id);

        Country country = countryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pays", id));

        country.softDelete(SecurityUtils.getCurrentUserId().orElse("SYSTEM"));
        countryRepository.save(country);

        log.info("Country soft deleted: {}", id);
    }

    private void validateCreate(CountryDto.CreateRequest request) {
        ValidationException validationException = new ValidationException("Erreur de validation");

        if (countryRepository.existsByCodeIso2(request.getCodeIso2().toUpperCase())) {
            validationException.addFieldError("codeIso2", "Ce code ISO2 existe déjà");
        }

        if (countryRepository.existsByCodeIso3(request.getCodeIso3().toUpperCase())) {
            validationException.addFieldError("codeIso3", "Ce code ISO3 existe déjà");
        }

        if (validationException.hasErrors()) {
            throw validationException;
        }
    }
}

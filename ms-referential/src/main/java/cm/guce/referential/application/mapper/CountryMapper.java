package cm.guce.referential.application.mapper;

import cm.guce.referential.application.dto.CountryDto;
import cm.guce.referential.domain.model.Country;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper MapStruct pour les pays.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CountryMapper {

    @Mapping(target = "defaultCurrencyId", source = "defaultCurrency.id")
    @Mapping(target = "defaultCurrencyCode", source = "defaultCurrency.code")
    CountryDto.Response toResponse(Country country);

    List<CountryDto.Response> toResponseList(List<Country> countries);

    CountryDto.Summary toSummary(Country country);

    List<CountryDto.Summary> toSummaryList(List<Country> countries);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "defaultCurrency", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    Country toEntity(CountryDto.CreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "codeIso2", ignore = true)
    @Mapping(target = "codeIso3", ignore = true)
    @Mapping(target = "codeNumeric", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "defaultCurrency", ignore = true)
    void updateEntity(CountryDto.UpdateRequest request, @MappingTarget Country country);
}

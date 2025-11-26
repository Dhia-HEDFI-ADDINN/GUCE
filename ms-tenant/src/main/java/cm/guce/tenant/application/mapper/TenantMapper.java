package cm.guce.tenant.application.mapper;

import cm.guce.tenant.application.dto.TenantDto;
import cm.guce.tenant.domain.model.Tenant;
import cm.guce.tenant.domain.model.TenantAdmin;
import cm.guce.tenant.domain.model.TenantInfrastructure;
import cm.guce.tenant.domain.model.TenantModule;
import org.mapstruct.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper pour les conversions Tenant Entity <-> DTO.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TenantMapper {

    // Entity -> Response
    @Mapping(target = "infrastructure", source = "infrastructure")
    @Mapping(target = "modules", source = "modules")
    @Mapping(target = "health.status", source = "healthStatus")
    @Mapping(target = "health.uptimePercentage", source = "uptimePercentage")
    @Mapping(target = "health.lastCheck", source = "lastHealthCheck")
    TenantDto.Response toResponse(Tenant tenant);

    // Entity -> Summary
    TenantDto.Summary toSummary(Tenant tenant);

    List<TenantDto.Summary> toSummaryList(List<Tenant> tenants);

    // Infrastructure mapping
    TenantDto.InfrastructureResponse toInfrastructureResponse(TenantInfrastructure infrastructure);

    // Module mapping
    @Mapping(target = "features", source = "features")
    TenantDto.ModuleResponse toModuleResponse(TenantModule module);

    List<TenantDto.ModuleResponse> toModuleResponseList(List<TenantModule> modules);

    // CreateRequest -> Entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "modules", ignore = true)
    @Mapping(target = "initialAdmins", ignore = true)
    @Mapping(target = "infrastructure", ignore = true)
    @Mapping(target = "environment", source = "technical.environment")
    @Mapping(target = "highAvailability", source = "technical.highAvailability")
    @Mapping(target = "autoScalingEnabled", source = "technical.autoScaling")
    @Mapping(target = "minReplicas", source = "technical.minReplicas")
    @Mapping(target = "maxReplicas", source = "technical.maxReplicas")
    @Mapping(target = "backupEnabled", source = "technical.backupEnabled")
    @Mapping(target = "backupFrequency", source = "technical.backupFrequency")
    @Mapping(target = "backupRetentionDays", source = "technical.backupRetentionDays")
    Tenant toEntity(TenantDto.CreateRequest request);

    // Update entity from request
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(TenantDto.UpdateRequest request, @MappingTarget Tenant tenant);

    // Infrastructure config -> Infrastructure entity
    @Mapping(target = "cloudProvider", source = "provider")
    TenantInfrastructure toInfrastructure(TenantDto.InfrastructureConfig config);

    // Admin request -> TenantAdmin entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenant", ignore = true)
    @Mapping(target = "keycloakUserId", ignore = true)
    @Mapping(target = "isCreated", constant = "false")
    TenantAdmin toAdminEntity(TenantDto.AdminRequest request);

    List<TenantAdmin> toAdminEntityList(List<TenantDto.AdminRequest> requests);

    // Helper method for modules conversion
    default List<TenantModule> mapModules(TenantDto.ModulesConfig config) {
        if (config == null) return List.of();

        return java.util.stream.Stream.of(
            createModule(TenantModule.E_FORCE, "e-Force", "Portail Operateurs Economiques", config.getEForce()),
            createModule(TenantModule.E_GOV, "e-Gov", "Interface Gouvernement", config.getEGov()),
            createModule(TenantModule.E_BUSINESS, "e-Business", "Portail Intermediaires", config.getEBusiness()),
            createModule(TenantModule.E_PAYMENT, "e-Payment", "Paiement en Ligne", config.getEPayment()),
            createModule(TenantModule.PROCEDURE_BUILDER, "Procedure Builder", "Constructeur de Procedures", config.getProcedureBuilder()),
            createModule(TenantModule.ADMIN_LOCAL, "Admin Local", "Administration Locale", config.getAdmin())
        ).filter(m -> m.getEnabled()).collect(Collectors.toList());
    }

    default TenantModule createModule(String name, String displayName, String description, TenantDto.ModuleConfig config) {
        TenantModule module = new TenantModule();
        module.setName(name);
        module.setDisplayName(displayName);
        module.setDescription(description);
        module.setEnabled(config != null && Boolean.TRUE.equals(config.getEnabled()));
        if (config != null && config.getFeatures() != null) {
            module.setFeatures(config.getFeatures());
        }
        return module;
    }
}

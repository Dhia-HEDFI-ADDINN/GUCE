package cm.guce.procedure.application.mapper;

import cm.guce.procedure.application.dto.ProcedureDto;
import cm.guce.procedure.domain.model.*;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper MapStruct pour les procédures.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProcedureMapper {

    @Mapping(target = "steps", source = "steps")
    @Mapping(target = "forms", source = "forms")
    @Mapping(target = "requiredDocuments", source = "requiredDocuments")
    ProcedureDto.Response toResponse(Procedure procedure);

    @Mapping(target = "stepsCount", expression = "java(procedure.getSteps() != null ? procedure.getSteps().size() : 0)")
    ProcedureDto.Summary toSummary(Procedure procedure);

    List<ProcedureDto.Summary> toSummaryList(List<Procedure> procedures);

    @Mapping(target = "stepType", expression = "java(step.getStepType().name())")
    ProcedureDto.StepSummary toStepSummary(ProcedureStep step);

    @Mapping(target = "formType", expression = "java(form.getFormType().name())")
    @Mapping(target = "fieldsCount", expression = "java(form.getFields() != null ? form.getFields().size() : 0)")
    ProcedureDto.FormSummary toFormSummary(FormDefinition form);

    ProcedureDto.DocumentSummary toDocumentSummary(ProcedureDocument document);

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
    @Mapping(target = "bpmnProcessId", ignore = true)
    @Mapping(target = "bpmnDefinition", ignore = true)
    @Mapping(target = "dmnDecisionId", ignore = true)
    @Mapping(target = "versionNumber", ignore = true)
    @Mapping(target = "publishedVersion", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "steps", ignore = true)
    @Mapping(target = "forms", ignore = true)
    @Mapping(target = "requiredDocuments", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    Procedure toEntity(ProcedureDto.CreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "procedureType", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "versionNumber", ignore = true)
    @Mapping(target = "publishedVersion", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "steps", ignore = true)
    @Mapping(target = "forms", ignore = true)
    @Mapping(target = "requiredDocuments", ignore = true)
    void updateEntity(ProcedureDto.UpdateRequest request, @MappingTarget Procedure procedure);

    /**
     * Clone une procédure pour créer une nouvelle version.
     */
    default Procedure cloneProcedure(Procedure original) {
        Procedure clone = new Procedure();
        clone.setCode(original.getCode());
        clone.setNameFr(original.getNameFr());
        clone.setNameEn(original.getNameEn());
        clone.setDescriptionFr(original.getDescriptionFr());
        clone.setDescriptionEn(original.getDescriptionEn());
        clone.setCategory(original.getCategory());
        clone.setProcedureType(original.getProcedureType());
        clone.setBpmnProcessId(original.getBpmnProcessId());
        clone.setBpmnDefinition(original.getBpmnDefinition());
        clone.setDmnDecisionId(original.getDmnDecisionId());
        clone.setIcon(original.getIcon());
        clone.setColor(original.getColor());
        clone.setExpectedDurationHours(original.getExpectedDurationHours());
        clone.setMaxDurationHours(original.getMaxDurationHours());
        clone.setRequiresPayment(original.getRequiresPayment());
        clone.setRequiresSignature(original.getRequiresSignature());
        clone.setIsActive(true);
        clone.setTenantId(original.getTenantId());
        return clone;
    }
}

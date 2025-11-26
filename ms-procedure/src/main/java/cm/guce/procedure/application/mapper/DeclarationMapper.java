package cm.guce.procedure.application.mapper;

import cm.guce.procedure.application.dto.DeclarationDto;
import cm.guce.procedure.domain.model.Declaration;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

/**
 * Mapper MapStruct pour les déclarations.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class DeclarationMapper {

    @Autowired
    protected ObjectMapper objectMapper;

    @Mapping(target = "procedureName", source = "procedure.nameFr")
    @Mapping(target = "statusLabel", expression = "java(declaration.getStatus().getLabel())")
    @Mapping(target = "data", expression = "java(jsonToMap(declaration.getDataJson()))")
    public abstract DeclarationDto.Response toResponse(Declaration declaration);

    @Mapping(target = "procedureName", source = "procedure.nameFr")
    @Mapping(target = "statusLabel", expression = "java(declaration.getStatus().getLabel())")
    public abstract DeclarationDto.Summary toSummary(Declaration declaration);

    public abstract List<DeclarationDto.Summary> toSummaryList(List<Declaration> declarations);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "reference", ignore = true)
    @Mapping(target = "procedure", ignore = true)
    @Mapping(target = "procedureCode", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "currentStep", ignore = true)
    @Mapping(target = "currentStepName", ignore = true)
    @Mapping(target = "processInstanceId", ignore = true)
    @Mapping(target = "submittedAt", ignore = true)
    @Mapping(target = "completedAt", ignore = true)
    @Mapping(target = "expectedCompletionDate", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "paidAmount", ignore = true)
    @Mapping(target = "isPaid", ignore = true)
    @Mapping(target = "paymentReference", ignore = true)
    @Mapping(target = "assignedTo", ignore = true)
    @Mapping(target = "assignedAt", ignore = true)
    @Mapping(target = "priority", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "currencyCode", constant = "XAF")
    @Mapping(target = "dataJson", expression = "java(mapToJson(request.getData()))")
    public abstract Declaration toEntity(DeclarationDto.CreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "reference", ignore = true)
    @Mapping(target = "procedure", ignore = true)
    @Mapping(target = "procedureCode", ignore = true)
    @Mapping(target = "operatorId", ignore = true)
    @Mapping(target = "operatorName", ignore = true)
    @Mapping(target = "operatorNiu", ignore = true)
    @Mapping(target = "declarantId", ignore = true)
    @Mapping(target = "declarantName", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "currentStep", ignore = true)
    @Mapping(target = "currentStepName", ignore = true)
    @Mapping(target = "processInstanceId", ignore = true)
    @Mapping(target = "submittedAt", ignore = true)
    @Mapping(target = "completedAt", ignore = true)
    @Mapping(target = "expectedCompletionDate", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "paidAmount", ignore = true)
    @Mapping(target = "isPaid", ignore = true)
    @Mapping(target = "paymentReference", ignore = true)
    @Mapping(target = "assignedTo", ignore = true)
    @Mapping(target = "assignedAt", ignore = true)
    @Mapping(target = "priority", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "currencyCode", ignore = true)
    @Mapping(target = "dataJson", expression = "java(mapToJson(request.getData()))")
    public abstract void updateEntity(DeclarationDto.UpdateRequest request, @MappingTarget Declaration declaration);

    protected Map<String, Object> jsonToMap(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    protected String mapToJson(Map<String, Object> map) {
        if (map == null || map.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}

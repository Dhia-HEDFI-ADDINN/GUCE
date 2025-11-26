package cm.guce.referential.application.mapper;

import cm.guce.referential.application.dto.HsCodeDto;
import cm.guce.referential.domain.model.HsCode;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper MapStruct pour les codes SH.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface HsCodeMapper {

    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "parentCode", source = "parent.code")
    @Mapping(target = "level", expression = "java(hsCode.getLevel())")
    @Mapping(target = "children", source = "children")
    HsCodeDto.Response toResponse(HsCode hsCode);

    List<HsCodeDto.Response> toResponseList(List<HsCode> hsCodes);

    @Mapping(target = "level", expression = "java(hsCode.getLevel())")
    @Mapping(target = "hasChildren", expression = "java(!hsCode.getChildren().isEmpty())")
    HsCodeDto.Summary toSummary(HsCode hsCode);

    List<HsCodeDto.Summary> toSummaryList(List<HsCode> hsCodes);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "chapter", ignore = true)
    @Mapping(target = "heading", ignore = true)
    @Mapping(target = "subheading", ignore = true)
    @Mapping(target = "tariffLine", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    HsCode toEntity(HsCodeDto.CreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "chapter", ignore = true)
    @Mapping(target = "heading", ignore = true)
    @Mapping(target = "subheading", ignore = true)
    @Mapping(target = "tariffLine", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "children", ignore = true)
    void updateEntity(HsCodeDto.UpdateRequest request, @MappingTarget HsCode hsCode);
}

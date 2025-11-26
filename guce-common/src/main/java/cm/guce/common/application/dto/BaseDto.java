package cm.guce.common.application.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de base avec champs d'audit.
 */
@Data
public abstract class BaseDto {

    private UUID id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    private Long version;
    private String tenantId;
}

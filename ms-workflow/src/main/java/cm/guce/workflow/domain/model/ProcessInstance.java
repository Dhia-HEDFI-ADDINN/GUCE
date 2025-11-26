package cm.guce.workflow.domain.model;

import cm.guce.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Process Instance entity - represents a running or completed workflow instance
 */
@Entity
@Table(name = "process_instances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessInstance extends BaseEntity {

    @Column(name = "zeebe_key", unique = true)
    private Long zeebeKey;

    @Column(name = "process_definition_key")
    private Long processDefinitionKey;

    @Column(name = "bpmn_process_id", nullable = false)
    private String bpmnProcessId;

    @Column(name = "version")
    private Integer version;

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(name = "business_key")
    private String businessKey;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private String entityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProcessStatus status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "started_by")
    private String startedBy;

    @Column(name = "current_element")
    private String currentElement;

    @ElementCollection
    @CollectionTable(name = "process_instance_variables", joinColumns = @JoinColumn(name = "process_instance_id"))
    @MapKeyColumn(name = "variable_name")
    @Column(name = "variable_value", length = 4000)
    private Map<String, String> variables = new HashMap<>();

    public enum ProcessStatus {
        ACTIVE,
        COMPLETED,
        CANCELED,
        INCIDENT
    }
}

package cm.guce.workflow.domain.model;

import cm.guce.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * User Task entity - represents a human task in a workflow
 */
@Entity
@Table(name = "user_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTask extends BaseEntity {

    @Column(name = "zeebe_job_key", unique = true)
    private Long zeebeJobKey;

    @Column(name = "process_instance_key")
    private Long processInstanceKey;

    @Column(name = "element_id", nullable = false)
    private String elementId;

    @Column(name = "element_name")
    private String elementName;

    @Column(name = "bpmn_process_id")
    private String bpmnProcessId;

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(name = "business_key")
    private String businessKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TaskStatus status;

    @Column(name = "assignee")
    private String assignee;

    @Column(name = "candidate_groups")
    private String candidateGroups;

    @Column(name = "candidate_users")
    private String candidateUsers;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "follow_up_date")
    private LocalDateTime followUpDate;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "form_key")
    private String formKey;

    @Column(name = "claimed_at")
    private LocalDateTime claimedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "completed_by")
    private String completedBy;

    @ElementCollection
    @CollectionTable(name = "user_task_variables", joinColumns = @JoinColumn(name = "user_task_id"))
    @MapKeyColumn(name = "variable_name")
    @Column(name = "variable_value", length = 4000)
    private Map<String, String> variables = new HashMap<>();

    public enum TaskStatus {
        CREATED,
        ASSIGNED,
        CLAIMED,
        COMPLETED,
        CANCELED
    }
}

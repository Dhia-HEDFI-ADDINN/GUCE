package cm.guce.procedure.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Entité Étape de Procédure - Définition d'une étape dans un workflow.
 *
 * Chaque étape correspond à une User Task ou Service Task dans le processus BPMN.
 */
@Entity
@Table(name = "procedure_step", indexes = {
        @Index(name = "idx_procedure_step_procedure", columnList = "procedure_id"),
        @Index(name = "idx_procedure_step_code", columnList = "code")
})
@Getter
@Setter
@NoArgsConstructor
public class ProcedureStep extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procedure_id", nullable = false)
    private Procedure procedure;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Column(name = "name_fr", nullable = false)
    private String nameFr;

    @Column(name = "name_en")
    private String nameEn;

    @Column(name = "description_fr", columnDefinition = "TEXT")
    private String descriptionFr;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Enumerated(EnumType.STRING)
    @Column(name = "step_type", nullable = false)
    private StepType stepType;

    @Column(name = "bpmn_task_id")
    private String bpmnTaskId;

    @Column(name = "candidate_groups")
    private String candidateGroups;

    @Column(name = "candidate_users")
    private String candidateUsers;

    @Column(name = "assignee_expression")
    private String assigneeExpression;

    @Column(name = "due_duration_hours")
    private Integer dueDurationHours;

    @Column(name = "escalation_duration_hours")
    private Integer escalationDurationHours;

    @Column(name = "is_optional")
    private Boolean isOptional = false;

    @Column(name = "is_parallel")
    private Boolean isParallel = false;

    @Column(name = "requires_all_approvals")
    private Boolean requiresAllApprovals = true;

    @Column(name = "min_approvals")
    private Integer minApprovals = 1;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id")
    private FormDefinition form;

    @ElementCollection
    @CollectionTable(name = "procedure_step_actions", joinColumns = @JoinColumn(name = "step_id"))
    @Column(name = "action")
    private List<String> allowedActions = new ArrayList<>();

    @Column(name = "next_step_on_approve")
    private String nextStepOnApprove;

    @Column(name = "next_step_on_reject")
    private String nextStepOnReject;

    @Column(name = "service_task_delegate")
    private String serviceTaskDelegate;

    @Column(name = "notification_template")
    private String notificationTemplate;

    public enum StepType {
        USER_TASK,          // Tâche utilisateur (traitement manuel)
        SERVICE_TASK,       // Tâche automatique (appel API, calcul)
        SCRIPT_TASK,        // Tâche script (exécution de règles)
        SEND_TASK,          // Envoi de message/notification
        RECEIVE_TASK,       // Attente de message externe
        BUSINESS_RULE_TASK, // Exécution de règles métier (DMN)
        CALL_ACTIVITY,      // Appel d'un sous-processus
        GATEWAY             // Point de décision (XOR, AND)
    }

    /**
     * Retourne la liste des groupes candidats.
     */
    public List<String> getCandidateGroupsList() {
        if (candidateGroups == null || candidateGroups.isBlank()) {
            return List.of();
        }
        return List.of(candidateGroups.split(","));
    }
}

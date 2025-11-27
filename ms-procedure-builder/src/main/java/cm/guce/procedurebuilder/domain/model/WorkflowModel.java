package cm.guce.procedurebuilder.domain.model;

import lombok.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Abstract Syntax Tree (AST) model representing a parsed BPMN workflow.
 * This model is used for code generation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowModel {

    private String processId;
    private String processName;
    private String version;

    @Builder.Default
    private List<StartEventModel> startEvents = new ArrayList<>();

    @Builder.Default
    private List<EndEventModel> endEvents = new ArrayList<>();

    @Builder.Default
    private List<UserTaskModel> userTasks = new ArrayList<>();

    @Builder.Default
    private List<ServiceTaskModel> serviceTasks = new ArrayList<>();

    @Builder.Default
    private List<GatewayModel> gateways = new ArrayList<>();

    @Builder.Default
    private List<TimerEventModel> timerEvents = new ArrayList<>();

    @Builder.Default
    private List<MessageEventModel> messageEvents = new ArrayList<>();

    @Builder.Default
    private List<CallActivityModel> callActivities = new ArrayList<>();

    @Builder.Default
    private List<SequenceFlowModel> sequenceFlows = new ArrayList<>();

    @Builder.Default
    private Map<String, VariableDefinition> variables = new HashMap<>();

    /**
     * Start Event model
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StartEventModel {
        private String id;
        private String name;
        private StartEventType type;
        private String messageRef;
        private String timerDefinition;

        public enum StartEventType {
            NONE, MESSAGE, TIMER, SIGNAL
        }
    }

    /**
     * End Event model
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EndEventModel {
        private String id;
        private String name;
        private EndEventType type;
        private String errorCode;

        public enum EndEventType {
            NONE, ERROR, TERMINATE, MESSAGE
        }
    }

    /**
     * User Task model - represents human tasks
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserTaskModel {
        private String id;
        private String name;
        private String taskType;
        private String assignee;
        private String candidateGroups;
        private String candidateUsers;
        private String formKey;
        private String formDefinition;
        private Integer priority;
        private String dueDate;
        private Map<String, Object> inputMappings;
        private Map<String, Object> outputMappings;
        private List<String> incomingFlows;
        private List<String> outgoingFlows;
    }

    /**
     * Service Task model - represents automated tasks
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServiceTaskModel {
        private String id;
        private String name;
        private String taskType;
        private ServiceTaskImplementation implementation;
        private String delegateExpression;
        private String topic;
        private Integer retries;
        private Map<String, Object> inputMappings;
        private Map<String, Object> outputMappings;
        private List<String> incomingFlows;
        private List<String> outgoingFlows;

        public enum ServiceTaskImplementation {
            JOB_WORKER, REST_CALL, KAFKA_PUBLISH, SCRIPT
        }
    }

    /**
     * Gateway model - represents decision points
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GatewayModel {
        private String id;
        private String name;
        private GatewayType type;
        private String defaultFlow;
        private List<String> incomingFlows;
        private List<String> outgoingFlows;

        public enum GatewayType {
            EXCLUSIVE, PARALLEL, INCLUSIVE, EVENT_BASED
        }
    }

    /**
     * Timer Event model
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimerEventModel {
        private String id;
        private String name;
        private TimerType timerType;
        private String timerDefinition;
        private boolean interrupting;

        public enum TimerType {
            DATE, DURATION, CYCLE
        }
    }

    /**
     * Message Event model
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MessageEventModel {
        private String id;
        private String name;
        private String messageName;
        private String correlationKey;
        private boolean interrupting;
    }

    /**
     * Call Activity model - represents subprocess calls
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CallActivityModel {
        private String id;
        private String name;
        private String calledElement;
        private CallType callType;
        private Map<String, Object> inputMappings;
        private Map<String, Object> outputMappings;

        public enum CallType {
            BPMN_PROCESS, REST_SERVICE, KAFKA_REQUEST
        }
    }

    /**
     * Sequence Flow model - represents connections between elements
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SequenceFlowModel {
        private String id;
        private String name;
        private String sourceRef;
        private String targetRef;
        private String conditionExpression;
    }

    /**
     * Variable definition for process variables
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VariableDefinition {
        private String name;
        private String type;
        private boolean required;
        private Object defaultValue;
        private String description;
    }
}

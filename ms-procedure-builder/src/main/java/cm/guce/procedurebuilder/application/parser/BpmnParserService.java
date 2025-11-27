package cm.guce.procedurebuilder.application.parser;

import cm.guce.procedurebuilder.domain.model.WorkflowModel;
import cm.guce.procedurebuilder.domain.model.WorkflowModel.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.bpmn.instance.*;
import org.camunda.bpm.model.bpmn.instance.Process;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for parsing BPMN XML and creating WorkflowModel AST
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BpmnParserService {

    /**
     * Parse BPMN XML string and create WorkflowModel
     */
    public WorkflowModel parse(String bpmnXml) {
        log.debug("Parsing BPMN XML...");

        BpmnModelInstance model = Bpmn.readModelFromStream(
            new ByteArrayInputStream(bpmnXml.getBytes(StandardCharsets.UTF_8))
        );

        // Get the main process
        Collection<Process> processes = model.getModelElementsByType(Process.class);
        if (processes.isEmpty()) {
            throw new BpmnParseException("No process found in BPMN");
        }

        Process process = processes.iterator().next();

        return WorkflowModel.builder()
            .processId(process.getId())
            .processName(process.getName())
            .startEvents(parseStartEvents(model))
            .endEvents(parseEndEvents(model))
            .userTasks(parseUserTasks(model))
            .serviceTasks(parseServiceTasks(model))
            .gateways(parseGateways(model))
            .timerEvents(parseTimerEvents(model))
            .messageEvents(parseMessageEvents(model))
            .callActivities(parseCallActivities(model))
            .sequenceFlows(parseSequenceFlows(model))
            .variables(extractVariables(model))
            .build();
    }

    /**
     * Validate BPMN structure
     */
    public ValidationResult validate(String bpmnXml) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        try {
            BpmnModelInstance model = Bpmn.readModelFromStream(
                new ByteArrayInputStream(bpmnXml.getBytes(StandardCharsets.UTF_8))
            );

            // Check for process
            Collection<Process> processes = model.getModelElementsByType(Process.class);
            if (processes.isEmpty()) {
                errors.add("No process definition found");
            }

            // Check for start event
            Collection<StartEvent> startEvents = model.getModelElementsByType(StartEvent.class);
            if (startEvents.isEmpty()) {
                errors.add("No start event found");
            } else if (startEvents.size() > 1) {
                warnings.add("Multiple start events found");
            }

            // Check for end event
            Collection<EndEvent> endEvents = model.getModelElementsByType(EndEvent.class);
            if (endEvents.isEmpty()) {
                errors.add("No end event found");
            }

            // Check for unconnected elements
            Collection<FlowNode> flowNodes = model.getModelElementsByType(FlowNode.class);
            for (FlowNode node : flowNodes) {
                if (!(node instanceof StartEvent) && node.getIncoming().isEmpty()) {
                    warnings.add("Element '" + node.getId() + "' has no incoming flows");
                }
                if (!(node instanceof EndEvent) && node.getOutgoing().isEmpty()) {
                    warnings.add("Element '" + node.getId() + "' has no outgoing flows");
                }
            }

            // Check user tasks have task type
            Collection<UserTask> userTasks = model.getModelElementsByType(UserTask.class);
            for (UserTask task : userTasks) {
                String taskType = getExtensionProperty(task, "taskType");
                if (taskType == null || taskType.isEmpty()) {
                    warnings.add("User task '" + task.getId() + "' has no taskType defined");
                }
            }

            // Check service tasks have implementation
            Collection<ServiceTask> serviceTasks = model.getModelElementsByType(ServiceTask.class);
            for (ServiceTask task : serviceTasks) {
                String taskType = getExtensionProperty(task, "taskType");
                if (taskType == null || taskType.isEmpty()) {
                    warnings.add("Service task '" + task.getId() + "' has no taskType defined");
                }
            }

            // Check exclusive gateways have conditions
            Collection<ExclusiveGateway> gateways = model.getModelElementsByType(ExclusiveGateway.class);
            for (ExclusiveGateway gateway : gateways) {
                if (gateway.getOutgoing().size() > 1) {
                    boolean hasDefault = gateway.getDefault() != null;
                    int conditionCount = 0;
                    for (SequenceFlow flow : gateway.getOutgoing()) {
                        if (flow.getConditionExpression() != null) {
                            conditionCount++;
                        }
                    }
                    if (!hasDefault && conditionCount < gateway.getOutgoing().size()) {
                        warnings.add("Gateway '" + gateway.getId() + "' has paths without conditions and no default");
                    }
                }
            }

        } catch (Exception e) {
            errors.add("BPMN parsing error: " + e.getMessage());
        }

        return ValidationResult.builder()
            .valid(errors.isEmpty())
            .errors(errors)
            .warnings(warnings)
            .build();
    }

    private List<StartEventModel> parseStartEvents(BpmnModelInstance model) {
        return model.getModelElementsByType(StartEvent.class).stream()
            .map(event -> {
                StartEventModel.StartEventType type = StartEventModel.StartEventType.NONE;
                String messageRef = null;
                String timerDef = null;

                if (!event.getEventDefinitions().isEmpty()) {
                    EventDefinition def = event.getEventDefinitions().iterator().next();
                    if (def instanceof MessageEventDefinition msgDef) {
                        type = StartEventModel.StartEventType.MESSAGE;
                        messageRef = msgDef.getMessage() != null ? msgDef.getMessage().getName() : null;
                    } else if (def instanceof TimerEventDefinition timerDef2) {
                        type = StartEventModel.StartEventType.TIMER;
                        timerDef = extractTimerDefinition(timerDef2);
                    } else if (def instanceof SignalEventDefinition) {
                        type = StartEventModel.StartEventType.SIGNAL;
                    }
                }

                return StartEventModel.builder()
                    .id(event.getId())
                    .name(event.getName())
                    .type(type)
                    .messageRef(messageRef)
                    .timerDefinition(timerDef)
                    .build();
            })
            .collect(Collectors.toList());
    }

    private List<EndEventModel> parseEndEvents(BpmnModelInstance model) {
        return model.getModelElementsByType(EndEvent.class).stream()
            .map(event -> {
                EndEventModel.EndEventType type = EndEventModel.EndEventType.NONE;
                String errorCode = null;

                if (!event.getEventDefinitions().isEmpty()) {
                    EventDefinition def = event.getEventDefinitions().iterator().next();
                    if (def instanceof ErrorEventDefinition errorDef) {
                        type = EndEventModel.EndEventType.ERROR;
                        errorCode = errorDef.getError() != null ? errorDef.getError().getErrorCode() : null;
                    } else if (def instanceof TerminateEventDefinition) {
                        type = EndEventModel.EndEventType.TERMINATE;
                    } else if (def instanceof MessageEventDefinition) {
                        type = EndEventModel.EndEventType.MESSAGE;
                    }
                }

                return EndEventModel.builder()
                    .id(event.getId())
                    .name(event.getName())
                    .type(type)
                    .errorCode(errorCode)
                    .build();
            })
            .collect(Collectors.toList());
    }

    private List<UserTaskModel> parseUserTasks(BpmnModelInstance model) {
        return model.getModelElementsByType(UserTask.class).stream()
            .map(task -> UserTaskModel.builder()
                .id(task.getId())
                .name(task.getName())
                .taskType(getExtensionProperty(task, "taskType"))
                .assignee(task.getCamundaAssignee())
                .candidateGroups(task.getCamundaCandidateGroups())
                .candidateUsers(task.getCamundaCandidateUsers())
                .formKey(task.getCamundaFormKey())
                .formDefinition(getExtensionProperty(task, "formDefinition"))
                .priority(task.getCamundaPriority() != null ? Integer.parseInt(task.getCamundaPriority()) : null)
                .dueDate(task.getCamundaDueDate())
                .inputMappings(extractInputMappings(task))
                .outputMappings(extractOutputMappings(task))
                .incomingFlows(task.getIncoming().stream().map(SequenceFlow::getId).collect(Collectors.toList()))
                .outgoingFlows(task.getOutgoing().stream().map(SequenceFlow::getId).collect(Collectors.toList()))
                .build())
            .collect(Collectors.toList());
    }

    private List<ServiceTaskModel> parseServiceTasks(BpmnModelInstance model) {
        return model.getModelElementsByType(ServiceTask.class).stream()
            .map(task -> {
                ServiceTaskModel.ServiceTaskImplementation impl = ServiceTaskModel.ServiceTaskImplementation.JOB_WORKER;
                String implType = getExtensionProperty(task, "implementation");
                if (implType != null) {
                    try {
                        impl = ServiceTaskModel.ServiceTaskImplementation.valueOf(implType.toUpperCase());
                    } catch (IllegalArgumentException ignored) {}
                }

                return ServiceTaskModel.builder()
                    .id(task.getId())
                    .name(task.getName())
                    .taskType(getExtensionProperty(task, "taskType"))
                    .implementation(impl)
                    .delegateExpression(task.getCamundaDelegateExpression())
                    .topic(task.getCamundaTopic())
                    .retries(parseRetries(getExtensionProperty(task, "retries")))
                    .inputMappings(extractInputMappings(task))
                    .outputMappings(extractOutputMappings(task))
                    .incomingFlows(task.getIncoming().stream().map(SequenceFlow::getId).collect(Collectors.toList()))
                    .outgoingFlows(task.getOutgoing().stream().map(SequenceFlow::getId).collect(Collectors.toList()))
                    .build();
            })
            .collect(Collectors.toList());
    }

    private List<GatewayModel> parseGateways(BpmnModelInstance model) {
        List<GatewayModel> gateways = new ArrayList<>();

        // Exclusive Gateways
        model.getModelElementsByType(ExclusiveGateway.class).forEach(gw ->
            gateways.add(GatewayModel.builder()
                .id(gw.getId())
                .name(gw.getName())
                .type(GatewayModel.GatewayType.EXCLUSIVE)
                .defaultFlow(gw.getDefault() != null ? gw.getDefault().getId() : null)
                .incomingFlows(gw.getIncoming().stream().map(SequenceFlow::getId).collect(Collectors.toList()))
                .outgoingFlows(gw.getOutgoing().stream().map(SequenceFlow::getId).collect(Collectors.toList()))
                .build())
        );

        // Parallel Gateways
        model.getModelElementsByType(ParallelGateway.class).forEach(gw ->
            gateways.add(GatewayModel.builder()
                .id(gw.getId())
                .name(gw.getName())
                .type(GatewayModel.GatewayType.PARALLEL)
                .incomingFlows(gw.getIncoming().stream().map(SequenceFlow::getId).collect(Collectors.toList()))
                .outgoingFlows(gw.getOutgoing().stream().map(SequenceFlow::getId).collect(Collectors.toList()))
                .build())
        );

        // Inclusive Gateways
        model.getModelElementsByType(InclusiveGateway.class).forEach(gw ->
            gateways.add(GatewayModel.builder()
                .id(gw.getId())
                .name(gw.getName())
                .type(GatewayModel.GatewayType.INCLUSIVE)
                .defaultFlow(gw.getDefault() != null ? gw.getDefault().getId() : null)
                .incomingFlows(gw.getIncoming().stream().map(SequenceFlow::getId).collect(Collectors.toList()))
                .outgoingFlows(gw.getOutgoing().stream().map(SequenceFlow::getId).collect(Collectors.toList()))
                .build())
        );

        // Event-Based Gateways
        model.getModelElementsByType(EventBasedGateway.class).forEach(gw ->
            gateways.add(GatewayModel.builder()
                .id(gw.getId())
                .name(gw.getName())
                .type(GatewayModel.GatewayType.EVENT_BASED)
                .incomingFlows(gw.getIncoming().stream().map(SequenceFlow::getId).collect(Collectors.toList()))
                .outgoingFlows(gw.getOutgoing().stream().map(SequenceFlow::getId).collect(Collectors.toList()))
                .build())
        );

        return gateways;
    }

    private List<TimerEventModel> parseTimerEvents(BpmnModelInstance model) {
        List<TimerEventModel> timerEvents = new ArrayList<>();

        // Intermediate Timer Events
        model.getModelElementsByType(IntermediateCatchEvent.class).forEach(event -> {
            event.getEventDefinitions().stream()
                .filter(def -> def instanceof TimerEventDefinition)
                .map(def -> (TimerEventDefinition) def)
                .findFirst()
                .ifPresent(timerDef ->
                    timerEvents.add(createTimerEventModel(event.getId(), event.getName(), timerDef, false))
                );
        });

        // Boundary Timer Events
        model.getModelElementsByType(BoundaryEvent.class).forEach(event -> {
            event.getEventDefinitions().stream()
                .filter(def -> def instanceof TimerEventDefinition)
                .map(def -> (TimerEventDefinition) def)
                .findFirst()
                .ifPresent(timerDef ->
                    timerEvents.add(createTimerEventModel(event.getId(), event.getName(), timerDef, !event.cancelActivity()))
                );
        });

        return timerEvents;
    }

    private TimerEventModel createTimerEventModel(String id, String name, TimerEventDefinition timerDef, boolean interrupting) {
        TimerEventModel.TimerType type = TimerEventModel.TimerType.DURATION;
        String definition = null;

        if (timerDef.getTimeDate() != null) {
            type = TimerEventModel.TimerType.DATE;
            definition = timerDef.getTimeDate().getTextContent();
        } else if (timerDef.getTimeDuration() != null) {
            type = TimerEventModel.TimerType.DURATION;
            definition = timerDef.getTimeDuration().getTextContent();
        } else if (timerDef.getTimeCycle() != null) {
            type = TimerEventModel.TimerType.CYCLE;
            definition = timerDef.getTimeCycle().getTextContent();
        }

        return TimerEventModel.builder()
            .id(id)
            .name(name)
            .timerType(type)
            .timerDefinition(definition)
            .interrupting(interrupting)
            .build();
    }

    private List<MessageEventModel> parseMessageEvents(BpmnModelInstance model) {
        List<MessageEventModel> messageEvents = new ArrayList<>();

        // Intermediate Message Events
        model.getModelElementsByType(IntermediateCatchEvent.class).forEach(event -> {
            event.getEventDefinitions().stream()
                .filter(def -> def instanceof MessageEventDefinition)
                .map(def -> (MessageEventDefinition) def)
                .findFirst()
                .ifPresent(msgDef ->
                    messageEvents.add(MessageEventModel.builder()
                        .id(event.getId())
                        .name(event.getName())
                        .messageName(msgDef.getMessage() != null ? msgDef.getMessage().getName() : null)
                        .correlationKey(getExtensionProperty(event, "correlationKey"))
                        .interrupting(false)
                        .build())
                );
        });

        return messageEvents;
    }

    private List<CallActivityModel> parseCallActivities(BpmnModelInstance model) {
        return model.getModelElementsByType(CallActivity.class).stream()
            .map(activity -> {
                CallActivityModel.CallType callType = CallActivityModel.CallType.BPMN_PROCESS;
                String callTypeStr = getExtensionProperty(activity, "callType");
                if (callTypeStr != null) {
                    try {
                        callType = CallActivityModel.CallType.valueOf(callTypeStr.toUpperCase());
                    } catch (IllegalArgumentException ignored) {}
                }

                return CallActivityModel.builder()
                    .id(activity.getId())
                    .name(activity.getName())
                    .calledElement(activity.getCalledElement())
                    .callType(callType)
                    .inputMappings(extractInputMappings(activity))
                    .outputMappings(extractOutputMappings(activity))
                    .build();
            })
            .collect(Collectors.toList());
    }

    private List<SequenceFlowModel> parseSequenceFlows(BpmnModelInstance model) {
        return model.getModelElementsByType(SequenceFlow.class).stream()
            .map(flow -> SequenceFlowModel.builder()
                .id(flow.getId())
                .name(flow.getName())
                .sourceRef(flow.getSource().getId())
                .targetRef(flow.getTarget().getId())
                .conditionExpression(flow.getConditionExpression() != null
                    ? flow.getConditionExpression().getTextContent() : null)
                .build())
            .collect(Collectors.toList());
    }

    private Map<String, VariableDefinition> extractVariables(BpmnModelInstance model) {
        Map<String, VariableDefinition> variables = new HashMap<>();
        // Extract variables from extension elements if defined
        // This is a simplified implementation
        return variables;
    }

    private String getExtensionProperty(ModelElementInstance element, String propertyName) {
        // Extract Camunda extension properties
        // This is a simplified implementation
        return null;
    }

    private Map<String, Object> extractInputMappings(ModelElementInstance element) {
        return new HashMap<>();
    }

    private Map<String, Object> extractOutputMappings(ModelElementInstance element) {
        return new HashMap<>();
    }

    private String extractTimerDefinition(TimerEventDefinition timerDef) {
        if (timerDef.getTimeDate() != null) {
            return timerDef.getTimeDate().getTextContent();
        } else if (timerDef.getTimeDuration() != null) {
            return timerDef.getTimeDuration().getTextContent();
        } else if (timerDef.getTimeCycle() != null) {
            return timerDef.getTimeCycle().getTextContent();
        }
        return null;
    }

    private Integer parseRetries(String retries) {
        if (retries == null) return 3;
        try {
            return Integer.parseInt(retries);
        } catch (NumberFormatException e) {
            return 3;
        }
    }

    /**
     * Validation result
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ValidationResult {
        private boolean valid;
        private List<String> errors;
        private List<String> warnings;
    }

    /**
     * BPMN Parse exception
     */
    public static class BpmnParseException extends RuntimeException {
        public BpmnParseException(String message) {
            super(message);
        }
    }
}

package cm.guce.common.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Publieur d'événements vers Kafka.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EventPublisher {

    private final KafkaTemplate<String, DomainEvent> kafkaTemplate;

    /**
     * Publie un événement sur le topic Kafka correspondant.
     */
    public void publish(DomainEvent event) {
        String topic = buildTopicName(event);
        log.info("Publishing event {} to topic {}", event.getEventId(), topic);

        kafkaTemplate.send(topic, event.getAggregateId(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish event {}: {}", event.getEventId(), ex.getMessage());
                    } else {
                        log.debug("Event {} published successfully", event.getEventId());
                    }
                });
    }

    /**
     * Publie un événement sur un topic spécifique.
     */
    public void publish(String topic, DomainEvent event) {
        log.info("Publishing event {} to specific topic {}", event.getEventId(), topic);

        kafkaTemplate.send(topic, event.getAggregateId(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish event {}: {}", event.getEventId(), ex.getMessage());
                    } else {
                        log.debug("Event {} published successfully", event.getEventId());
                    }
                });
    }

    private String buildTopicName(DomainEvent event) {
        // Convention: guce.{aggregate-type}.{event-type}
        return String.format("guce.%s.%s",
                event.getAggregateType().toLowerCase(),
                event.getEventType().toLowerCase().replace("event", ""));
    }
}

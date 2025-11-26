package cm.guce.common.event;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Événement de domaine de base.
 * Tous les événements GUCE doivent hériter de cette classe.
 */
@Getter
@Setter
public abstract class DomainEvent {

    private String eventId;
    private String eventType;
    private LocalDateTime timestamp;
    private String tenantId;
    private String userId;
    private String correlationId;
    private int version;

    protected DomainEvent() {
        this.eventId = UUID.randomUUID().toString();
        this.timestamp = LocalDateTime.now();
        this.eventType = this.getClass().getSimpleName();
        this.version = 1;
    }

    public abstract String getAggregateId();
    public abstract String getAggregateType();
}

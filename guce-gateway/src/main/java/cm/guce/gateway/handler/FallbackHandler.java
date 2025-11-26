package cm.guce.gateway.handler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.HandlerFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Fallback handler for circuit breaker scenarios
 * Provides graceful degradation when backend services are unavailable
 */
@Component
@Slf4j
public class FallbackHandler {

    public Mono<ServerResponse> tenantFallback(ServerRequest request) {
        return createFallbackResponse(
            "Tenant Service",
            "Le service de gestion des tenants est temporairement indisponible",
            HttpStatus.SERVICE_UNAVAILABLE
        );
    }

    public Mono<ServerResponse> generatorFallback(ServerRequest request) {
        return createFallbackResponse(
            "Generator Service",
            "Le service de generation est temporairement indisponible. Les generations en cours seront reprises automatiquement.",
            HttpStatus.SERVICE_UNAVAILABLE
        );
    }

    public Mono<ServerResponse> procedureFallback(ServerRequest request) {
        return createFallbackResponse(
            "Procedure Service",
            "Le service des procedures est temporairement indisponible",
            HttpStatus.SERVICE_UNAVAILABLE
        );
    }

    public Mono<ServerResponse> referentialFallback(ServerRequest request) {
        return createFallbackResponse(
            "Referential Service",
            "Le service des referentiels est temporairement indisponible",
            HttpStatus.SERVICE_UNAVAILABLE
        );
    }

    public Mono<ServerResponse> documentFallback(ServerRequest request) {
        return createFallbackResponse(
            "Document Service",
            "Le service de gestion documentaire est temporairement indisponible",
            HttpStatus.SERVICE_UNAVAILABLE
        );
    }

    public Mono<ServerResponse> workflowFallback(ServerRequest request) {
        return createFallbackResponse(
            "Workflow Service",
            "Le service de workflow est temporairement indisponible. Les processus en cours seront repris.",
            HttpStatus.SERVICE_UNAVAILABLE
        );
    }

    public Mono<ServerResponse> paymentFallback(ServerRequest request) {
        return createFallbackResponse(
            "Payment Service",
            "Le service de paiement est temporairement indisponible. Veuillez reessayer dans quelques instants.",
            HttpStatus.SERVICE_UNAVAILABLE
        );
    }

    public Mono<ServerResponse> notificationFallback(ServerRequest request) {
        return createFallbackResponse(
            "Notification Service",
            "Le service de notifications est temporairement indisponible",
            HttpStatus.SERVICE_UNAVAILABLE
        );
    }

    public Mono<ServerResponse> genericFallback(ServerRequest request) {
        return createFallbackResponse(
            "Service",
            "Le service demande est temporairement indisponible",
            HttpStatus.SERVICE_UNAVAILABLE
        );
    }

    private Mono<ServerResponse> createFallbackResponse(String serviceName, String message, HttpStatus status) {
        log.warn("Fallback triggered for {}: {}", serviceName, message);

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", "SERVICE_UNAVAILABLE");
        response.put("service", serviceName);
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("retryAfter", 30); // Seconds

        return ServerResponse
            .status(status)
            .contentType(MediaType.APPLICATION_JSON)
            .header("Retry-After", "30")
            .bodyValue(response);
    }
}

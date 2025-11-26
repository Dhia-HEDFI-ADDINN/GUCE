package cm.guce.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Global logging filter for all gateway requests
 * Adds request ID for tracing and logs request/response details
 */
@Component
@Slf4j
public class LoggingFilter implements GlobalFilter, Ordered {

    private static final String REQUEST_ID_HEADER = "X-Request-Id";
    private static final String START_TIME_KEY = "requestStartTime";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // Generate or use existing request ID
        String requestId = request.getHeaders().getFirst(REQUEST_ID_HEADER);
        if (requestId == null || requestId.isEmpty()) {
            requestId = UUID.randomUUID().toString();
        }

        // Add request ID to response headers
        final String finalRequestId = requestId;
        ServerHttpRequest mutatedRequest = request.mutate()
            .header(REQUEST_ID_HEADER, finalRequestId)
            .build();

        // Store start time
        exchange.getAttributes().put(START_TIME_KEY, System.currentTimeMillis());

        // Log request
        log.info("[{}] Request: {} {} from {} - User-Agent: {}",
            finalRequestId,
            request.getMethod(),
            request.getURI().getPath(),
            request.getRemoteAddress() != null ? request.getRemoteAddress().getAddress().getHostAddress() : "unknown",
            request.getHeaders().getFirst("User-Agent")
        );

        return chain.filter(exchange.mutate().request(mutatedRequest).build())
            .then(Mono.fromRunnable(() -> {
                ServerHttpResponse response = exchange.getResponse();
                Long startTime = exchange.getAttribute(START_TIME_KEY);
                long duration = startTime != null ? System.currentTimeMillis() - startTime : 0;

                // Add request ID to response
                response.getHeaders().add(REQUEST_ID_HEADER, finalRequestId);

                // Log response
                log.info("[{}] Response: {} - {} ms",
                    finalRequestId,
                    response.getStatusCode(),
                    duration
                );

                // Log slow requests
                if (duration > 3000) {
                    log.warn("[{}] Slow request detected: {} {} took {} ms",
                        finalRequestId,
                        request.getMethod(),
                        request.getURI().getPath(),
                        duration
                    );
                }
            }));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}

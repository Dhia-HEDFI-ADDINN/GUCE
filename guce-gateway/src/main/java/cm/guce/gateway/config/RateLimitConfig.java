package cm.guce.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

import java.security.Principal;

/**
 * Rate limiting configuration for API Gateway
 * Uses Redis for distributed rate limiting across gateway instances
 */
@Configuration
public class RateLimitConfig {

    /**
     * Rate limiter based on user identity from JWT
     */
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> exchange.getPrincipal()
            .map(Principal::getName)
            .defaultIfEmpty("anonymous");
    }

    /**
     * Rate limiter based on IP address
     */
    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> Mono.just(
            exchange.getRequest().getRemoteAddress() != null
                ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                : "unknown"
        );
    }

    /**
     * Rate limiter based on tenant ID (from header or JWT claim)
     */
    @Bean
    public KeyResolver tenantKeyResolver() {
        return exchange -> {
            String tenantId = exchange.getRequest().getHeaders().getFirst("X-Tenant-Id");
            if (tenantId != null) {
                return Mono.just(tenantId);
            }
            return exchange.getPrincipal()
                .map(principal -> {
                    // Extract tenant from JWT claims if available
                    return principal.getName();
                })
                .defaultIfEmpty("default-tenant");
        };
    }

    /**
     * Default rate limiter: 100 requests per second, burst of 200
     */
    @Bean
    public RedisRateLimiter defaultRateLimiter() {
        return new RedisRateLimiter(100, 200, 1);
    }

    /**
     * Strict rate limiter for sensitive operations: 10 requests per second
     */
    @Bean
    public RedisRateLimiter strictRateLimiter() {
        return new RedisRateLimiter(10, 20, 1);
    }

    /**
     * High throughput rate limiter for read operations: 500 requests per second
     */
    @Bean
    public RedisRateLimiter highThroughputRateLimiter() {
        return new RedisRateLimiter(500, 1000, 1);
    }
}

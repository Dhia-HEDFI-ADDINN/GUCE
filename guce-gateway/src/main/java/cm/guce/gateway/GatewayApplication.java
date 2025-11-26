package cm.guce.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * GUCE API Gateway Application
 *
 * Central entry point for all E-GUCE 3G Platform API requests.
 * Provides:
 * - Request routing to microservices
 * - Rate limiting
 * - Circuit breaker patterns
 * - JWT authentication validation
 * - Request/Response logging
 * - CORS handling
 */
@SpringBootApplication
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}

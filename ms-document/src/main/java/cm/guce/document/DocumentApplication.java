package cm.guce.document;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Document Management Microservice Application
 *
 * GED (Gestion Electronique de Documents) for E-GUCE 3G Platform
 * Features:
 * - Document upload/download
 * - Versioning
 * - Metadata management
 * - Full-text search
 * - Access control
 * - MinIO S3-compatible storage
 */
@SpringBootApplication
public class DocumentApplication {

    public static void main(String[] args) {
        SpringApplication.run(DocumentApplication.class, args);
    }
}

package cm.guce.common.application.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Wrapper standard pour toutes les réponses API GUCE.
 * Format conforme aux spécifications du prompt master.
 *
 * @param <T> Type des données retournées
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private ErrorInfo error;
    private PaginationInfo pagination;
    private MetaInfo meta;

    /**
     * Crée une réponse de succès avec données.
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .meta(MetaInfo.now())
                .build();
    }

    /**
     * Crée une réponse de succès avec données paginées.
     */
    public static <T> ApiResponse<T> success(T data, PaginationInfo pagination) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .pagination(pagination)
                .meta(MetaInfo.now())
                .build();
    }

    /**
     * Crée une réponse d'erreur.
     */
    public static <T> ApiResponse<T> error(String code, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(ErrorInfo.builder()
                        .code(code)
                        .message(message)
                        .build())
                .meta(MetaInfo.now())
                .build();
    }

    /**
     * Crée une réponse d'erreur avec détails.
     */
    public static <T> ApiResponse<T> error(ErrorInfo errorInfo) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(errorInfo)
                .meta(MetaInfo.now())
                .build();
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ErrorInfo {
        private String code;
        private String message;
        private java.util.List<FieldError> details;

        @Data
        @Builder
        public static class FieldError {
            private String field;
            private String message;
        }
    }

    @Data
    @Builder
    public static class PaginationInfo {
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;

        public static PaginationInfo of(int page, int size, long totalElements) {
            return PaginationInfo.builder()
                    .page(page)
                    .size(size)
                    .totalElements(totalElements)
                    .totalPages((int) Math.ceil((double) totalElements / size))
                    .build();
        }
    }

    @Data
    @Builder
    public static class MetaInfo {
        private LocalDateTime timestamp;
        private String requestId;

        public static MetaInfo now() {
            return MetaInfo.builder()
                    .timestamp(LocalDateTime.now())
                    .requestId(UUID.randomUUID().toString())
                    .build();
        }
    }
}

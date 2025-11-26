package cm.guce.common.adapter.in.web;

import cm.guce.common.application.dto.ApiResponse;
import cm.guce.common.domain.exception.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Gestionnaire global des exceptions pour les APIs REST.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(ValidationException ex) {
        log.warn("Validation error: {}", ex.getMessage());

        List<ApiResponse.ErrorInfo.FieldError> fieldErrors = ex.getFieldErrors().stream()
                .map(fe -> ApiResponse.ErrorInfo.FieldError.builder()
                        .field(fe.field())
                        .message(fe.message())
                        .build())
                .collect(Collectors.toList());

        ApiResponse.ErrorInfo errorInfo = ApiResponse.ErrorInfo.builder()
                .code(ex.getErrorCode())
                .message(ex.getMessage())
                .details(fieldErrors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(errorInfo));
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessRule(BusinessRuleException ex) {
        log.warn("Business rule violation: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException ex) {
        log.warn("Unauthorized access: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("ACCESS_DENIED", "Accès refusé"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        log.warn("Validation error: {}", ex.getMessage());

        List<ApiResponse.ErrorInfo.FieldError> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> ApiResponse.ErrorInfo.FieldError.builder()
                        .field(error.getField())
                        .message(error.getDefaultMessage())
                        .build())
                .collect(Collectors.toList());

        ApiResponse.ErrorInfo errorInfo = ApiResponse.ErrorInfo.builder()
                .code("VALIDATION_ERROR")
                .message("Données de requête invalides")
                .details(fieldErrors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(errorInfo));
    }

    @ExceptionHandler(GUCEException.class)
    public ResponseEntity<ApiResponse<Void>> handleGUCE(GUCEException ex) {
        log.error("GUCE error: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("INTERNAL_ERROR", "Une erreur interne s'est produite"));
    }
}

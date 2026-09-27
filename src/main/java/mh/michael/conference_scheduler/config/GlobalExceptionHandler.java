package mh.michael.conference_scheduler.config;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.fasterxml.jackson.databind.exc.MismatchedInputException;
import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.dto.ErrorResponse;
import mh.michael.conference_scheduler.dto.ValidationErrorResponse;
import mh.michael.conference_scheduler.exceptions.AuthenticationException;
import mh.michael.conference_scheduler.exceptions.InvalidRefreshTokenException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import static mh.michael.conference_scheduler.constants.Constants.INTERNAL_SERVER_ERROR_MSG;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> handleResponseStatusException(ResponseStatusException ex) {
      return ResponseEntity.status(ex.getStatusCode()).body(errorBody(
        ex.getStatusCode().value(),
        ex.getReason() != null ? ex.getReason() : ex.getStatusCode().toString()));
    }

    private Map<String, Object> errorBody(int status, String message) {
      Map<String, Object> body = new LinkedHashMap<>();
      body.put("timestamp", Instant.now());
      body.put("status", status);
      body.put("error", message);
      return body;
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    public ResponseEntity<?> handleInvalidRefreshTokenException(InvalidRefreshTokenException ex) {
      log.error("Invalid refresh token exception", ex);

      ErrorResponse errorResponse = ErrorResponse.builder()
        .timestamp(new Date())
        .status(HttpStatus.UNAUTHORIZED.value())
        .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
        .message("Invalid refresh token")
        .build();

      return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

  // Handles constraints failures (e.g., null values)
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult().getFieldErrors().forEach(error ->
      errors.put(error.getField(), error.getDefaultMessage())
    );

    ValidationErrorResponse response = ValidationErrorResponse.builder()
      .timestamp(new Date())
      .status(HttpStatus.BAD_REQUEST.value())
      .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
      .validationErrors(errors)
      .build();

    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }

  // Handles invalid ISO 8601 formats (Jackson parsing errors)
  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<?> handleJsonParseException(HttpMessageNotReadableException ex) {
    Map<String, String> errors = new HashMap<>();
    Throwable cause = ex.getCause();

    // Check if the cause is a Jackson mismatch/format exception
    if (cause instanceof MismatchedInputException) {
      MismatchedInputException mie = (MismatchedInputException) cause;

      // Extract the field name path from the exception reference
      String fieldName = mie.getPath().stream()
        .map(com.fasterxml.jackson.databind.JsonMappingException.Reference::getFieldName)
        .filter(java.util.Objects::nonNull)
        .reduce((first, second) -> first + "." + second)
        .orElse("unknownField");

      // Customize message if it's an Instant/Date parsing issue
      if (cause instanceof InvalidFormatException && mie.getTargetType().equals(java.time.Instant.class)) {
        errors.put(fieldName, "Invalid ISO 8601 date format. Please use 'YYYY-MM-DDTHH:mm:ssZ'.");
      } else {
        errors.put(fieldName, "Invalid value or format for this field.");
      }
    } else {
      errors.put("error", "Malformed JSON request body.");
    }

    ValidationErrorResponse response = ValidationErrorResponse.builder()
      .timestamp(new Date())
      .status(HttpStatus.BAD_REQUEST.value())
      .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
      .validationErrors(errors)
      .build();

    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<?> handleAuthenticationException(AuthenticationException ex) {
    log.error("Authentication exception", ex);

    ErrorResponse errorResponse = ErrorResponse.builder()
      .timestamp(new Date())
      .status(HttpStatus.UNAUTHORIZED.value())
      .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
      .message("Access Denied")
      .build();

    return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(AuthorizationDeniedException.class)
  public ResponseEntity<?> handleAuthorizationException(AuthorizationDeniedException ex) {
    log.error("Authorization exception", ex);

    ErrorResponse errorResponse = ErrorResponse.builder()
      .timestamp(new Date())
      .status(HttpStatus.FORBIDDEN.value())
      .error(HttpStatus.FORBIDDEN.getReasonPhrase())
      .message("Access Denied")
      .build();

    return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> handleException(Exception ex) {
      log.error("Unhandled exception", ex);

      ErrorResponse errorResponse = ErrorResponse.builder()
        .timestamp(new Date())
        .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
        .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
        .message(INTERNAL_SERVER_ERROR_MSG)
        .build();

      return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

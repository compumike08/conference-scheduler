package mh.michael.conference_scheduler.annotations;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = IsValidInstantValidator.class)
@Target({ FIELD, PARAMETER })
@Retention(RUNTIME)
public @interface IsValidInstant {

  // Default error message if one isn't specified on the field
  String message() default "Must be a valid ISO 8601 date-time string (e.g., 2026-08-30T21:16:00Z).";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}

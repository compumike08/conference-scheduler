package mh.michael.conference_scheduler.annotations;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = IsInstantInFutureValidator.class)
@Target({ FIELD, PARAMETER })
@Retention(RUNTIME)
public @interface IsInstantInFuture {
  // Default error message if one isn't specified on the field
  String message() default "Must be a date/time in the future";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}

package mh.michael.conference_scheduler.annotations;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UuidValidator.class)
@Documented
public @interface ValidUuid {
  String message() default "Invalid UUID";
  Class<?>[] groups() default {};
  Class<? extends Payload>[] payload() default {};
}

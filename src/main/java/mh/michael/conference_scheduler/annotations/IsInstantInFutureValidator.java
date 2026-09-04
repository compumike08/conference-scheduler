package mh.michael.conference_scheduler.annotations;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.Instant;
import java.time.format.DateTimeParseException;

public class IsInstantInFutureValidator implements ConstraintValidator<IsInstantInFuture, String> {

  @Override
  public boolean isValid(String value, ConstraintValidatorContext context) {
    // If the value is null, let @NotNull handle it if necessary.
    // Returning true here prevents duplicate validation failures.
    if (value == null || value.trim().isEmpty()) {
      return true;
    }

    Instant instant;

    try {
      instant = Instant.parse(value);
    } catch (DateTimeParseException e) {
      // If the value in invalid, let @IsValidInstant handle it if necessary.
      // Returning true here prevents duplicate validation failures.
      return true;
    }

    return instant.isAfter(Instant.now());
  }
}

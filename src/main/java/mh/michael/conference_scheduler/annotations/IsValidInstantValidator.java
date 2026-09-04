package mh.michael.conference_scheduler.annotations;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class IsValidInstantValidator implements ConstraintValidator<IsValidInstant, String> {

  @Override
  public boolean isValid(String value, ConstraintValidatorContext context) {
    // If the value is null, let @NotNull handle it if necessary.
    // Returning true here prevents duplicate validation failures.
    if (value == null || value.trim().isEmpty()) {
      return true;
    }

    try {
      // Attempt to parse using standard ISO 8601 rules
      DateTimeFormatter.ISO_INSTANT.parse(value);
      return true;
    } catch (DateTimeParseException e) {
      return false;
    }
  }
}

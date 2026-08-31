package mh.michael.conference_scheduler.annotations;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class ValueOfEnumValidator implements ConstraintValidator<ValueOfEnum, CharSequence> {
  private List<String> acceptedValues;

  @Override
  public void initialize(ValueOfEnum constraint) {
    acceptedValues = Stream.of(constraint.enumClass().getEnumConstants())
      .map(Enum::name)
      .collect(Collectors.toList());
  }

  @Override
  public boolean isValid(CharSequence value, ConstraintValidatorContext context) {
    if (value == null) {
      return true; // Use @NotNull separately if null is not allowed
    }
    return acceptedValues.contains(value.toString());
  }
}

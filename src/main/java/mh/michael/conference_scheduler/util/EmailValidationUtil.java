package mh.michael.conference_scheduler.util;

import java.util.regex.Pattern;

public class EmailValidationUtil {
  private EmailValidationUtil() {}

  // Regular expression obtained from https://www.baeldung.com/java-email-validation-regex#regular-expression-by-rfc-5322-for-email-validation
  private static final String EMAIL_VALIDATION_REGEX = "^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$";

  public static boolean emailPatternMatches(String emailAddress) {
    return Pattern.compile(EMAIL_VALIDATION_REGEX)
      .matcher(emailAddress)
      .matches();
  }
}

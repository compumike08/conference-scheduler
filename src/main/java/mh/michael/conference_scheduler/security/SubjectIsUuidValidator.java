package mh.michael.conference_scheduler.security;

import org.jspecify.annotations.NullMarked;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

/**
 * Requires the token's "sub" claim to be the user's unique UUID rather than
 * their username or email. A UUID subject stays valid even if the user
 * later changes their username/email, and never leaks a human-readable
 * identifier through the token. Tokens minted under an older
 * "subject = username" scheme are structurally rejected here rather than
 * silently accepted as a valid user identifier.
 */
public class SubjectIsUuidValidator implements OAuth2TokenValidator<Jwt> {

  private static final OAuth2Error INVALID_SUBJECT =
    new OAuth2Error("invalid_token", "The token subject must be the user's UUID", null);

  @Override
  @NullMarked
  public OAuth2TokenValidatorResult validate(Jwt jwt) {
    String subject = jwt.getSubject();
    if (subject == null) {
      return OAuth2TokenValidatorResult.failure(INVALID_SUBJECT);
    }
    try {
      UUID.fromString(subject);
      return OAuth2TokenValidatorResult.success();
    } catch (IllegalArgumentException ex) {
      return OAuth2TokenValidatorResult.failure(INVALID_SUBJECT);
    }
  }
}


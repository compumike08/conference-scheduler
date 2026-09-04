package mh.michael.conference_scheduler.security;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Rejects any token whose "aud" claim doesn't contain the audience this
 * resource server expects. Without this, a token that was legitimately
 * signed by our issuer but minted for a *different* API/client would still
 * be accepted here — audience checking is what scopes a token to us.
 */
public class AudienceValidator implements OAuth2TokenValidator<Jwt> {
  private static final OAuth2Error INVALID_AUDIENCE =
    new OAuth2Error("invalid_token", "The required audience is missing", null);

  private final String requiredAudience;

  public AudienceValidator(String requiredAudience) {
    this.requiredAudience = requiredAudience;
  }

  @Override
  public OAuth2TokenValidatorResult validate(Jwt jwt) {
    if (jwt.getAudience() != null && jwt.getAudience().contains(requiredAudience)) {
      return OAuth2TokenValidatorResult.success();
    }
    return OAuth2TokenValidatorResult.failure(INVALID_AUDIENCE);
  }
}

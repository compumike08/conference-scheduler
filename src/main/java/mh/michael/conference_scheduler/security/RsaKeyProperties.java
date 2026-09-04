package mh.michael.conference_scheduler.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

/**
 * Binds the raw PEM key material coming from the CONFERENCE_SCHDLR_APP_JWT_RSA_PRIVATE_KEY / CONFERENCE_SCHDLR_APP_JWT_RSA_PUBLIC_KEY
 * environment variables (via ${CONFERENCE_SCHDLR_APP_JWT_RSA_PRIVATE_KEY} / ${CONFERENCE_SCHDLR_APP_JWT_RSA_PUBLIC_KEY} placeholders
 * in application.yml). Kept as plain Strings here; parsing into java.jwt.rsa
 * key objects happens in JwtKeyConfig so this class stays a dumb properties holder.
 */
@Validated
@ConfigurationProperties(prefix = "jwt.rsa")
public record RsaKeyProperties(
  @NotBlank(message = "CONFERENCE_SCHDLR_APP_JWT_RSA_PRIVATE_KEY environment variable is not set") String privateKey,
  @NotBlank(message = "CONFERENCE_SCHDLR_APP_JWT_RSA_PUBLIC_KEY environment variable is not set") String publicKey
) {
}

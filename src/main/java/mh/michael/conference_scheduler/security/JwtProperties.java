package mh.michael.conference_scheduler.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(
  String issuer,
  long expirationMinutes
) {
}

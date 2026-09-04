package mh.michael.conference_scheduler.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.AccountStatusUserDetailsChecker;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Turns a signature/issuer/audience/format-valid Jwt into an actual
 * Authentication, by treating the "sub" claim as a user id and looking that
 * user up (see DemoUserDetailsService.findById) rather than trusting the
 * token's claims on their own. This means a token stops working the moment
 * its user is deleted or disabled, even if the token itself hasn't expired
 * yet — the token proves "this UUID was legitimately issued a token", the
 * database lookup proves "and that user still exists and may authenticate".
 *
 * The resulting Authentication's principal is the JwtUserDetails loaded from
 * that lookup (not the Jwt), so @AuthenticationPrincipal JwtUserDetails
 * works throughout the app, and authorities are sourced from the database
 * record rather than the token's own "roles" claim — so a role change takes
 * effect immediately rather than only once the old token expires.
 */
@Component
public class JwtToAppUserAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

  private final DatabaseAuthUserDetailsService userDetailsService;
  private final AccountStatusUserDetailsChecker accountStatusChecker = new AccountStatusUserDetailsChecker();

  public JwtToAppUserAuthenticationConverter(DatabaseAuthUserDetailsService userDetailsService) {
    this.userDetailsService = userDetailsService;
  }

  @Override
  public AbstractAuthenticationToken convert(Jwt jwt) {
    UUID userId = parseSubject(jwt);

    JwtUserDetails appUser = userDetailsService.loadUserByUuid(userId);

    // Re-checks enabled/locked/expired status against current data on every
    // request, not just whatever was true when the token was issued.
    accountStatusChecker.check(appUser);

    UsernamePasswordAuthenticationToken authentication =
      new UsernamePasswordAuthenticationToken(appUser, jwt, appUser.getAuthorities());
    authentication.setDetails(jwt);
    return authentication;
  }

  private UUID parseSubject(Jwt jwt) {
    // SubjectIsUuidValidator already enforces this at decode time, so this
    // should never actually fail in practice - this is just defense in
    // depth in case that validator is ever removed or reconfigured.
    try {
      return UUID.fromString(jwt.getSubject());
    } catch (IllegalArgumentException | NullPointerException ex) {
      throw new InvalidBearerTokenException("Token subject is not a valid UUID");
    }
  }
}


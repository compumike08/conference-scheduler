package mh.michael.conference_scheduler.security;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class TokenService {
  private final JwtEncoder jwtEncoder;
  private final JwtProperties jwtProperties;

  public TokenService(JwtEncoder jwtEncoder, JwtProperties jwtProperties) {
    this.jwtEncoder = jwtEncoder;
    this.jwtProperties = jwtProperties;
  }

  @Getter
  @Value("${jwt.issuer}")
  private String issuer;

  public String getAuthAud() {
    return issuer + "--auth";
  }

  public String getForgotPasswordAud() {
    return issuer + "--forgot-password";
  }

  public String generateToken(JwtUserDetails jwtUserDetails, boolean isAuth) {
    return buildToken(jwtUserDetails.getUserUuid().toString(), isAuth);
  }

  /**
   * Re-issues a fresh token for the subject/roles carried by an existing,
   * already-validated token (i.e. it passed the resource server's signature
   * and expiry checks to even reach this method). Used by the
   * "refresh using a current token" flow rather than a username/password login.
   */
  public String generateToken(Jwt existingToken) {
    return buildToken(existingToken.getSubject(), true);
  }

  private String buildToken(String subject, boolean isAuth) {
    Instant now = Instant.now();

    String aud = isAuth ? getAuthAud() : getForgotPasswordAud();
    List<String> audList = new ArrayList<>();
    audList.add(aud);

    JwtClaimsSet claims = JwtClaimsSet.builder()
      .issuer(jwtProperties.issuer())
      .audience(audList)
      .issuedAt(now)
      .expiresAt(now.plus(jwtProperties.expirationMinutes(), ChronoUnit.MINUTES))
      .subject(subject)
      .build();

    return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
  }
}

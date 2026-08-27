package mh.michael.conference_scheduler.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.impl.DefaultClock;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Set;
import java.util.function.Function;

@Component
@Slf4j
public class JwtTokenUtil {
  private final Clock clock = DefaultClock.INSTANCE;

  @Value("${jwt.signing.key.secret}")
  private String secret;

  @Value("${jwt.token.expiration.in.seconds}")
  private Long expiration;

  @Value("${jwt.token.issuer}")
  private String issuer;

  private String getAuthAud() {
    return issuer + "--auth";
  }

  private String getForgotPasswordAud() {
    return issuer + "--forgot-password";
  }

  public String getSubjectFromToken(String token) {
    return getClaimFromToken(token, Claims::getSubject);
  }

  public Set<String> getAudienceFromToken(String token) {
    return getClaimFromToken(token, Claims::getAudience);
  }

  public Date getIssuedAtDateFromToken(String token) {
    return getClaimFromToken(token, Claims::getIssuedAt);
  }

  public Date getExpirationDateFromToken(String token) {
    return getClaimFromToken(token, Claims::getExpiration);
  }

  public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {

    final Claims claims = getAllClaimsFromToken(token);
    return claimsResolver.apply(claims);
  }

  private Claims getAllClaimsFromToken(String token) {
    byte[] keyBytes = Decoders.BASE64.decode(secret);
    SecretKey key = Keys.hmacShaKeyFor(keyBytes);

    try {
      return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    } catch (ExpiredJwtException | IncorrectClaimException e) {
      log.warn("Expired JWT token or incorrect claims when extracting claims: {}", e.getMessage());
      return e.getClaims();
    }
  }

  private Boolean isTokenExpired(String token) {
    final Date expiration = getExpirationDateFromToken(token);
    return expiration.before(clock.now());
  }

  private Boolean ignoreTokenExpiration(String token) {
    // here you specify tokens, for that the expiration is ignored
    return false;
  }

  public String generateTokenForAuthentication(JwtUserDetails userDetails) {
    return doGenerateToken(userDetails.getUserUuid().toString(), getAuthAud());
  }

  public String generateTokenForForgotPassword(User user) {
    String emailAddress = user.getEmail();
    return doGenerateToken(emailAddress, getForgotPasswordAud());
  }

  private String doGenerateToken(String subject, String audience) {
    final Date createdDate = clock.now();
    final Date expirationDate = calculateExpirationDate(createdDate);

    byte[] keyBytes = Decoders.BASE64.decode(secret);
    SecretKey key = Keys.hmacShaKeyFor(keyBytes);

    return Jwts.builder()
      .subject(subject)
      .audience()
        .add(audience)
        .and()
      .issuer(issuer)
      .issuedAt(createdDate)
      .expiration(expirationDate)
      .signWith(key, Jwts.SIG.HS512)
      .compact();
  }

  public Boolean canTokenBeRefreshed(String token) {
    return (!isTokenExpired(token) || ignoreTokenExpiration(token));
  }

  public String refreshToken(String token) {
    final Date createdDate = clock.now();
    final Date expirationDate = calculateExpirationDate(createdDate);

    final Claims claims = getAllClaimsFromToken(token);

    byte[] keyBytes = Decoders.BASE64.decode(secret);
    SecretKey key = Keys.hmacShaKeyFor(keyBytes);

    return Jwts.builder()
      .claims(claims)
      .issuer(issuer)
      .issuedAt(createdDate)
      .expiration(expirationDate)
      .signWith(key, Jwts.SIG.HS512)
      .compact();
  }

  public Boolean validateTokenForAuthentication(String token, JwtUserDetails userDetails) {
    byte[] keyBytes = Decoders.BASE64.decode(secret);
    SecretKey key = Keys.hmacShaKeyFor(keyBytes);

    try {
      Jwts.parser().verifyWith(key)
        .requireSubject(userDetails.getUserUuid().toString())
        .requireIssuer(issuer).requireAudience(getAuthAud()).build().parseSignedClaims(token);
    } catch (RuntimeException e) {
      log.error("validateTokenForAuthentication error: ", e);
      return false;
    }

    return true;
  }

  public Boolean validateTokenForForgotPassword(String token, User user) {
    byte[] keyBytes = Decoders.BASE64.decode(secret);
    SecretKey key = Keys.hmacShaKeyFor(keyBytes);

    try {
      Jwts.parser().verifyWith(key)
        .requireSubject(user.getEmail())
        .requireIssuer(issuer).requireAudience(getForgotPasswordAud()).build().parseSignedClaims(token);
    } catch (RuntimeException e) {
      log.error("validateTokenForForgotPassword error: ", e);
      return false;
    }

    return true;
  }

  private Date calculateExpirationDate(Date createdDate) {
    return new Date(createdDate.getTime() + expiration * 1000);
  }
}

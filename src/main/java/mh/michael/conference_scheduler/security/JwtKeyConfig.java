package mh.michael.conference_scheduler.security;

import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.UUID;

/**
 * Wires the RSA key pair (sourced from RSA_PRIVATE_KEY / RSA_PUBLIC_KEY env vars)
 * into Spring Security's JwtEncoder (for signing tokens we issue) and JwtDecoder
 * (for verifying/validating tokens on incoming requests).
 */
@Configuration
@EnableConfigurationProperties({RsaKeyProperties.class, JwtProperties.class})
public class JwtKeyConfig {

  private final RsaKeyProperties rsaKeyProperties;

  public JwtKeyConfig(RsaKeyProperties rsaKeyProperties) {
    this.rsaKeyProperties = rsaKeyProperties;
  }

  @Bean
  public RSAPublicKey rsaPublicKey() {
    return PemKeyParser.parsePublicKey(rsaKeyProperties.publicKey());
  }

  @Bean
  public RSAPrivateKey rsaPrivateKey() {
    return PemKeyParser.parsePrivateKey(rsaKeyProperties.privateKey());
  }

  @Bean
  public JwtEncoder jwtEncoder(RSAPublicKey publicKey, RSAPrivateKey privateKey) {
    JWK jwk = new RSAKey.Builder(publicKey)
      .privateKey(privateKey)
      .keyID(UUID.randomUUID().toString())
      .build();
    JWKSource<SecurityContext> jwkSource = new ImmutableJWKSet<>(new JWKSet(jwk));
    return new NimbusJwtEncoder(jwkSource);
  }

  @Bean
  public NimbusJwtDecoder jwtDecoder(RSAPublicKey publicKey) {
    return NimbusJwtDecoder.withPublicKey(publicKey).build();
  }
}

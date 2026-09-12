package mh.michael.conference_scheduler.config;

import jakarta.servlet.DispatcherType;
import mh.michael.conference_scheduler.security.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.web.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class JWTWebSecurityConfig {
  private final UserDetailsService databaseAuthUserDetailsService;
  private final TokenService tokenService;
  private final JwtToAppUserAuthenticationConverter jwtToAppUserAuthenticationConverter;
  private final LoggingAccessDeniedHandler loggingAccessDeniedHandler;
  private final LoggingAuthenticationEntryPoint loggingAuthenticationEntryPoint;

  public JWTWebSecurityConfig(
          UserDetailsService databaseAuthUserDetailsService,
          TokenService tokenService,
          JwtToAppUserAuthenticationConverter jwtToAppUserAuthenticationConverter,
          LoggingAccessDeniedHandler loggingAccessDeniedHandler,
          LoggingAuthenticationEntryPoint loggingAuthenticationEntryPoint
  ) {
    this.databaseAuthUserDetailsService = databaseAuthUserDetailsService;
    this.tokenService = tokenService;
    this.jwtToAppUserAuthenticationConverter = jwtToAppUserAuthenticationConverter;
    this.loggingAccessDeniedHandler = loggingAccessDeniedHandler;
    this.loggingAuthenticationEntryPoint = loggingAuthenticationEntryPoint;
  }

  @Autowired
  public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
    auth
      .userDetailsService(databaseAuthUserDetailsService);
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http, NimbusJwtDecoder jwtDecoder) throws Exception {
    // Beyond signature verification, require the token to have been issued by
    // us (issuer) and minted for this API (audience) before it's accepted.
    jwtDecoder.setJwtValidator(jwtTokenValidator());

    http
      // Stateless bearer-token API (no cookies/session to forge), so CSRF
      // protection is disabled outright rather than per-path.
      .csrf(AbstractHttpConfigurer::disable)
      .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(auth -> auth
         .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
         .requestMatchers(
          "/authenticate",
          "/registerUser",
          "/sendForgotPasswordEmail",
          "/resetPassword",
          "/favicon.ico",
          "/static/**"
        ).permitAll()
        .requestMatchers(PathRequest.toH2Console()).permitAll()
        .anyRequest().authenticated())
      .oauth2ResourceServer(oauth2 -> oauth2
        /* Logs every 403 (via @Slf4j) before falling back to the same
           BearerTokenAccessDeniedHandler behavior Spring Security would
           otherwise use by default - client-visible behavior is unchanged. */
        .accessDeniedHandler(loggingAccessDeniedHandler)
        /* Same idea for 401s: logs, then delegates to the default
           BearerTokenAuthenticationEntryPoint behavior. */
        .authenticationEntryPoint(loggingAuthenticationEntryPoint)
        .jwt(jwt -> jwt
          .decoder(jwtDecoder)
          .jwtAuthenticationConverter(jwtToAppUserAuthenticationConverter)))
      // H2 console renders inside an iframe; the default X-Frame-Options: DENY
      // would otherwise block it even though the path itself is permitted above.
      .headers(headers -> headers
        .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin));
    return http.build();
  }

  /**
   * Combines Spring Security's default validators (signature is already checked
   * by the decoder itself; this adds expiry/not-before timestamp checks plus an
   * issuer check against jwt.issuer) with a custom audience check against
   * jwt.audience. A token failing any of these is rejected as invalid, resulting
   * in a 401 regardless of whether its signature was valid.
   */
  private OAuth2TokenValidator<Jwt> jwtTokenValidator() {
    OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(tokenService.getIssuer());
    OAuth2TokenValidator<Jwt> withAudience = new AudienceValidator(tokenService.getAuthAud());
    OAuth2TokenValidator<Jwt> withUuidSubject = new SubjectIsUuidValidator();
    return new DelegatingOAuth2TokenValidator<>(withIssuer, withAudience, withUuidSubject);
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public AuthenticationManager authenticationManager(UserDetailsService userDetailsService,
                                                     PasswordEncoder passwordEncoder) {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
    provider.setPasswordEncoder(passwordEncoder);
    return new ProviderManager(provider);
  }
}

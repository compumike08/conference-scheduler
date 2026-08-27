package mh.michael.conference_scheduler.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;

@Component
@Slf4j
public class JwtTokenAuthorizationOncePerRequestFilter extends OncePerRequestFilter {
  private final DatabaseAuthUserDetailsService databaseAuthUserDetailsService;
  private final JwtTokenUtil jwtTokenUtil;

  @Value("${jwt.http.request.header}")
  private String tokenHeader;

  public JwtTokenAuthorizationOncePerRequestFilter(
    DatabaseAuthUserDetailsService databaseAuthUserDetailsService,
    JwtTokenUtil jwtTokenUtil
  ) {
    this.databaseAuthUserDetailsService = databaseAuthUserDetailsService;
    this.jwtTokenUtil = jwtTokenUtil;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();
    return path.equals("/authenticate") || path.equals("/registerUser") || path.equals("/sendForgotPasswordEmail") || path.equals("/resetPassword");
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
    log.debug("Authentication Request For '{}'", request.getRequestURL());

    final String requestTokenHeader = request.getHeader(this.tokenHeader);

    String uuid = null;
    String jwtToken = null;
    if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
      jwtToken = requestTokenHeader.substring(7);
      try {
        uuid = jwtTokenUtil.getSubjectFromToken(jwtToken);
      } catch (IllegalArgumentException e) {
        log.error("JWT_TOKEN_UNABLE_TO_GET_USER_UUID", e);
      }
    } else {
      log.warn("JWT_TOKEN_DOES_NOT_START_WITH_BEARER_STRING");
    }

    log.debug("JWT_TOKEN_USER_UUID_VALUE '{}'", uuid);
    if (uuid != null && SecurityContextHolder.getContext().getAuthentication() == null) {

      JwtUserDetails jwtUserDetails = this.databaseAuthUserDetailsService
        .loadUserByUuid(UUID.fromString(uuid));

      if (jwtTokenUtil.validateTokenForAuthentication(jwtToken, jwtUserDetails)) {
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(jwtUserDetails, null, jwtUserDetails.getAuthorities());
        usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
      }
    }

    chain.doFilter(request, response);
  }
}

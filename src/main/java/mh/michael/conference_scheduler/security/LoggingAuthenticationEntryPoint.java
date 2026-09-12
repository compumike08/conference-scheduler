package mh.michael.conference_scheduler.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Logs every authentication failure (401: missing, malformed, expired, or
 * otherwise invalid bearer token - i.e. no usable identity at all) before
 * delegating to BearerTokenAuthenticationEntryPoint, the same entry point
 * oauth2ResourceServer() would otherwise install by default. This only adds
 * a log line; the response sent to the client (status code, WWW-Authenticate
 * header with its error/error_description) is unchanged.
 * <p>
 * Not for 403s: a request that authenticates fine but lacks the required
 * role/authority is an AccessDeniedException, handled separately by
 * LoggingAccessDeniedHandler.
 */
@Slf4j
@Component
public class LoggingAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final AuthenticationEntryPoint delegate = new BearerTokenAuthenticationEntryPoint();

    @Override
    @NullMarked
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        log.warn("Authentication failed (401): method={}, path={}, reason={}",
                request.getMethod(), request.getRequestURI(), authException.getMessage());

        delegate.commence(request, response, authException);
    }
}

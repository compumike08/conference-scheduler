package mh.michael.conference_scheduler.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Logs every authorization failure (403: authenticated, but not permitted -
 * e.g. a failed @PreAuthorize check or an authorizeHttpRequests role rule)
 * before delegating to BearerTokenAccessDeniedHandler, the same handler
 * oauth2ResourceServer() would otherwise install by default. This only adds
 * a log line; the response sent to the client (status code, WWW-Authenticate
 * header) is unchanged.
 * <p>
 * Not for 401s: an unauthenticated/invalid-token request never reaches an
 * AccessDeniedHandler at all - that's an AuthenticationException, handled by
 * a separate AuthenticationEntryPoint (BearerTokenAuthenticationEntryPoint).
 */
@Slf4j
@Component
public class LoggingAccessDeniedHandler implements AccessDeniedHandler {

    private final AccessDeniedHandler delegate = new BearerTokenAccessDeniedHandler();

    @Override
    @NullMarked
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        JwtUserDetails principal = (authentication != null && authentication.getPrincipal() != null) ?
                (JwtUserDetails) authentication.getPrincipal() : null;

        if (principal != null) {
            log.warn("Authorization denied (403): userUuid={}, method={}, path={}, reason={}",
                    principal.getUserUuid(), request.getMethod(), request.getRequestURI(), accessDeniedException.getMessage());
        } else {
            log.warn("Authorization denied (403): user=anonymous, method={}, path={}, reason={}",
                    request.getMethod(), request.getRequestURI(), accessDeniedException.getMessage());
        }

        delegate.handle(request, response, accessDeniedException);
    }
}

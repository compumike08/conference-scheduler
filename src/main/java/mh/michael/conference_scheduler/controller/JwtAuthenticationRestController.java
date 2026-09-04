package mh.michael.conference_scheduler.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.dto.NewUserRequestDTO;
import mh.michael.conference_scheduler.dto.UserWithoutMemberDTO;
import mh.michael.conference_scheduler.exceptions.AuthenticationException;
import mh.michael.conference_scheduler.security.*;
import mh.michael.conference_scheduler.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@CrossOrigin(origins={ "http://localhost:3000", "http://localhost:8080" })
@Slf4j
public class JwtAuthenticationRestController {
  private final AuthenticationManager authenticationManager;
  private final UserService userService;
  private final TokenService tokenService;

  public JwtAuthenticationRestController(
    AuthenticationManager authenticationManager,
    UserService userService,
    TokenService tokenService
  ) {
    this.authenticationManager = authenticationManager;
    this.userService = userService;
    this.tokenService = tokenService;
  }

  @PostMapping(value = "/authenticate")
  public ResponseEntity<?> createAuthenticationToken(@Valid @RequestBody JwtTokenRequest authenticationRequest) throws AuthenticationException {
    log.debug("JwtAuthenticationRestController::createAuthenticationToken");
    Authentication authentication;

    try {
      authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(), authenticationRequest.getPassword()));
    } catch (
      AuthenticationCredentialsNotFoundException |
      UsernameNotFoundException |
      BadCredentialsException e
    ) {
      log.warn("AuthenticationException: ", e);
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication Failed");
    }

    SecurityContextHolder.getContext().setAuthentication(authentication);

    JwtUserDetails userDetails = (JwtUserDetails) authentication.getPrincipal();
    assert userDetails != null;
    final String token = tokenService.generateToken(userDetails, true);
    return ResponseEntity.ok(new JwtTokenResponse(token));
  }

  /**
   * Issues a brand-new token for the caller without requiring username/password again.
   * Authentication here is the existing bearer token itself: the request must already
   * carry a valid, unexpired JWT (it's not in the permitAll list, so Spring Security's
   * resource-server filter validates it before this method is even invoked). The new
   * token carries the same subject/roles but a fresh issued-at/expiry.
   */
  @PostMapping("/refresh")
  public ResponseEntity<?> refresh(@AuthenticationPrincipal Jwt currentToken) {
    String token = tokenService.generateToken(currentToken);
    return ResponseEntity.ok(new JwtTokenResponse(token));
  }

  @PostMapping(value = "/registerUser")
  public UserWithoutMemberDTO registerNewUser(@Valid @RequestBody NewUserRequestDTO newUserRequestDTO) {
    log.debug("JwtAuthenticationRestController::registerNewUser");
    return userService.createNewUser(newUserRequestDTO);
  }

  @ExceptionHandler({ AuthenticationException.class })
  public ResponseEntity<?> handleAuthenticationException(AuthenticationException e) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
  }
}

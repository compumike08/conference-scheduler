package mh.michael.conference_scheduler.controller;

import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.dto.NewUserRequestDTO;
import mh.michael.conference_scheduler.dto.UserDTO;
import mh.michael.conference_scheduler.exceptions.AuthenticationException;
import mh.michael.conference_scheduler.security.JwtTokenRequest;
import mh.michael.conference_scheduler.security.JwtTokenResponse;
import mh.michael.conference_scheduler.security.JwtTokenUtil;
import mh.michael.conference_scheduler.security.JwtUserDetails;
import mh.michael.conference_scheduler.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import javax.servlet.http.HttpServletRequest;

@RestController
@CrossOrigin(origins={ "http://localhost:3000", "http://localhost:8080" })
@Slf4j
public class JwtAuthenticationRestController {
  @Value("${jwt.http.request.header}")
  private String tokenHeader;

  private final JwtTokenUtil jwtTokenUtil;
  private final AuthenticationManager authenticationManager;
  private final UserService userService;

  public JwtAuthenticationRestController(
    JwtTokenUtil jwtTokenUtil,
    AuthenticationManager authenticationManager,
    UserService userService
  ) {
    this.jwtTokenUtil = jwtTokenUtil;
    this.authenticationManager = authenticationManager;
    this.userService = userService;
  }

  @PostMapping(value = "/authenticate")
  public ResponseEntity<?> createAuthenticationToken(@RequestBody JwtTokenRequest authenticationRequest) throws AuthenticationException {
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

    final JwtUserDetails userDetails = (JwtUserDetails) authentication.getPrincipal();
    final String token = jwtTokenUtil.generateTokenForAuthentication(userDetails);
    return ResponseEntity.ok(new JwtTokenResponse(token));
  }

  @PostMapping(value = "/refresh")
  public ResponseEntity<?> refreshAndGetAuthenticationToken(HttpServletRequest request) {
    log.debug("JwtAuthenticationRestController::refreshAndGetAuthenticationToken");
    String authToken = request.getHeader(tokenHeader);
    final String token = authToken.substring(7);

    if (jwtTokenUtil.canTokenBeRefreshed(token)) {
      String refreshedToken = jwtTokenUtil.refreshToken(token);
      return ResponseEntity.ok(new JwtTokenResponse(refreshedToken));
    } else {
      return ResponseEntity.badRequest().body(null);
    }
  }

  @PostMapping(value = "/registerUser")
  public UserDTO registerNewUser(@RequestBody NewUserRequestDTO newUserRequestDTO) {
    log.debug("JwtAuthenticationRestController::registerNewUser");
    return userService.createNewUser(newUserRequestDTO);
  }

  @ExceptionHandler({ AuthenticationException.class })
  public ResponseEntity<String> handleAuthenticationException(AuthenticationException e) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
  }
}

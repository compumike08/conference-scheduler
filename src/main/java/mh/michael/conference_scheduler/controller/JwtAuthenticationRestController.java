package mh.michael.conference_scheduler.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.dto.NewUserRequestDTO;
import mh.michael.conference_scheduler.dto.RefreshTokenRequestDTO;
import mh.michael.conference_scheduler.dto.TokenPairResponseDTO;
import mh.michael.conference_scheduler.dto.UserWithoutMemberDTO;
import mh.michael.conference_scheduler.exceptions.AuthenticationException;
import mh.michael.conference_scheduler.exceptions.InvalidRefreshTokenException;
import mh.michael.conference_scheduler.security.*;
import mh.michael.conference_scheduler.service.RefreshTokenService;
import mh.michael.conference_scheduler.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins={ "http://localhost:5173", "http://localhost:8080" })
@Slf4j
public class JwtAuthenticationRestController {
  private final AuthenticationManager authenticationManager;
  private final UserService userService;
  private final TokenService tokenService;
  private final RefreshTokenService refreshTokenService;
  private final DatabaseAuthUserDetailsService databaseAuthUserDetailsService;
  private final AccountStatusUserDetailsChecker accountStatusChecker = new AccountStatusUserDetailsChecker();

  public JwtAuthenticationRestController(
    AuthenticationManager authenticationManager,
    UserService userService,
    TokenService tokenService, RefreshTokenService refreshTokenService, DatabaseAuthUserDetailsService databaseAuthUserDetailsService
  ) {
    this.authenticationManager = authenticationManager;
    this.userService = userService;
    this.tokenService = tokenService;
    this.refreshTokenService = refreshTokenService;
    this.databaseAuthUserDetailsService = databaseAuthUserDetailsService;
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
    final String refreshToken = refreshTokenService.issue(userDetails.getUserUuid());
    return ResponseEntity.ok(new TokenPairResponseDTO(token, refreshToken));
  }

    /**
     * Exchanges a long-lived refresh token for a brand-new access token +
     * refresh token pair, without requiring username/password again. Unlike
     * the old /refresh endpoint, this does NOT require a still-valid access
     * token - it's public (see JWTWebSecurityConfig's permitAll list), because
     * the whole point of a refresh token is to get a new access token once the
     * old one has already expired. RefreshTokenService.exchange(...) validates
     * the token (unknown/expired/already-used all throw
     * InvalidRefreshTokenException) and rotates it - the presented token is
     * single-use.
     */
    @PostMapping("/refreshToken")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequestDTO request) {
        RefreshTokenService.Exchange exchange = refreshTokenService.exchange(request.getRefreshToken());

        JwtUserDetails userDetails;
        try {
            userDetails = databaseAuthUserDetailsService.loadUserByUuid(exchange.getUserId());
        } catch (UsernameNotFoundException e) {
            throw new InvalidRefreshTokenException("User no longer exists");
        }

        // Same check JwtToAppUserAuthenticationConverter applies to a bearer
        // token's principal - a disabled/locked/expired account shouldn't be
        // able to obtain a fresh access token via refresh either.
        accountStatusChecker.check(userDetails);

        final String token = tokenService.generateToken(userDetails, true);
        return ResponseEntity.ok(new TokenPairResponseDTO(token, exchange.getRefreshToken()));
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

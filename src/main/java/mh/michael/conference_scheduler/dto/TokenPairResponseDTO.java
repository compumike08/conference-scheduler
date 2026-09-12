package mh.michael.conference_scheduler.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response for endpoints that issue both a short-lived access token and a
 * long-lived refresh token together (login, and exchanging a refresh token
 * for a new pair). Endpoints that only ever issue a single token (e.g.
 * forgot-password) keep using JwtTokenResponse.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenPairResponseDTO {
    private String token;
    private String refreshToken;
}

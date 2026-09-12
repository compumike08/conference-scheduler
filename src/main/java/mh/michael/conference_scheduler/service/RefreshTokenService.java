package mh.michael.conference_scheduler.service;

import lombok.*;
import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.exceptions.InvalidRefreshTokenException;
import mh.michael.conference_scheduler.model.RefreshToken;
import mh.michael.conference_scheduler.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Duration refreshTokenTtl;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            @Value("${jwt.refresh-token.expiration-hours:1}") long expirationHours
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenTtl = Duration.ofHours(expirationHours);
    }

    /**
     * Issues a brand-new refresh token for a user - call this on login. The
     * raw value is returned exactly once; only its hash is ever persisted.
     */
    public String issue(UUID userId) {
        String rawToken = generateRawToken();
        RefreshToken token = RefreshToken.builder()
                .tokenHash(hash(rawToken))
                .userId(userId)
                .expiresAt(Instant.now().plus(refreshTokenTtl))
                .build();
        refreshTokenRepository.save(token);
        return rawToken;
    }

    /**
     * Validates a presented refresh token and, on success, rotates it: the
     * presented token is marked revoked/used and a new one takes its place.
     * Throws InvalidRefreshTokenException for anything unusable - unknown,
     * expired, or already-used. Reuse of an already-used token additionally
     * revokes every other active refresh token for that user, since it's a
     * signal the token may have been stolen and used by someone else first.
     */
    public Exchange exchange(String rawToken) {
        RefreshToken existing = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new InvalidRefreshTokenException("Unknown refresh token"));

        if (existing.getIsRevoked()) {
            log.warn("Refresh token reuse detected for user={} - revoking all active refresh tokens",
                    existing.getUserId());
            revokeAllForUser(existing.getUserId());
            throw new InvalidRefreshTokenException("Refresh token has already been used");
        }

        if (existing.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidRefreshTokenException("Refresh token has expired");
        }

        String newRawToken = generateRawToken();
        RefreshToken replacement = RefreshToken.builder()
                .tokenHash(hash(newRawToken))
                .userId(existing.getUserId())
                .expiresAt(Instant.now().plus(refreshTokenTtl))
                .build();
        refreshTokenRepository.save(replacement);

        existing.setIsRevoked(true);
        existing.setRevokedAt(Instant.now());
        existing.setReplacedByTokenId(replacement.getId());
        refreshTokenRepository.save(existing);

        return Exchange.builder()
                .userId(existing.getUserId())
                .refreshToken(newRawToken)
                .build();
    }

    /** Revokes a single refresh token - e.g. logout from one device. */
    public void revoke(String rawToken) {
        refreshTokenRepository.findByTokenHash(hash(rawToken)).ifPresent(token -> {
            token.setIsRevoked(true);
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
        });
    }

    /** Revokes every active refresh token for a user - e.g. "log out everywhere" or a security response. */
    public void revokeAllForUser(UUID userId) {
        List<RefreshToken> active = refreshTokenRepository.findAllByUserIdAndIsRevokedFalse(userId);
        active.forEach(token -> {
          token.setIsRevoked(true);
          token.setRevokedAt(Instant.now());
        });
        refreshTokenRepository.saveAll(active);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[48]; // 384 bits of entropy
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Exchange {
        private UUID userId;
        private String refreshToken;
    }
}

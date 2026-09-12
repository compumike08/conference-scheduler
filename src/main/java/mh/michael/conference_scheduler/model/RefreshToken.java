package mh.michael.conference_scheduler.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * A traditional, long-lived, server-side refresh token record. The raw token
 * value is never stored - only its SHA-256 hash (tokenHash) - so a database
 * leak alone doesn't hand out usable tokens, mirroring how passwords are
 * stored. Tokens are single-use: exchanging one (see RefreshTokenService)
 * marks it revoked and records the id of its replacement, which lets reuse
 * of an already-rotated token be detected as likely theft rather than just
 * silently rejected.
 */
@Entity
@Table(name = "refresh_tokens")
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA requires one; use the builder everywhere else
@Getter
@Setter
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean isRevoked = false;

    @Column(nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

  /** When this token was revoked. Null until revoke() is called. */
    private Instant revokedAt;

    /** Id of the token this one was rotated into, once used. Null until then. */
    private UUID replacedByTokenId;

    /** Marks this token revoked/used, recording when - use this instead of setRevoked(true) directly, so revokedAt is never left out of sync. */
    public void revoke() {
      this.isRevoked = true;
      this.revokedAt = Instant.now();
    }
}

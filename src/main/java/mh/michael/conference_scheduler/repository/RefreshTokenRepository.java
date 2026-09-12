package mh.michael.conference_scheduler.repository;

import mh.michael.conference_scheduler.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findAllByUserIdAndIsRevokedFalse(UUID userId);

  /**
   * Bulk-deletes, in a single DELETE statement: (a) every token whose
   * expiry has passed, unconditionally, and (b) every revoked token whose
   * revokedAt is older than revokedCutoff. The grace period on (b) exists
   * so a just-rotated/just-revoked row survives long enough for
   * RefreshTokenService.exchange to still detect it if a stolen copy of it
   * gets replayed - deleting revoked rows immediately would silently turn
   * that into an "unknown token" instead of a detected reuse.
   */
  @Modifying
  @Query("DELETE FROM RefreshToken r WHERE r.expiresAt < :now "
    + "OR (r.isRevoked = true AND r.revokedAt < :revokedCutoff)")
  int deleteExpiredAndOldRevoked(@Param("now") Instant now, @Param("revokedCutoff") Instant revokedCutoff);
}

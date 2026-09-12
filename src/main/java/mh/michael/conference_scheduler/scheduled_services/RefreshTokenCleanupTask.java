package mh.michael.conference_scheduler.scheduled_services;

import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

/**
 * Periodically purges expired refresh tokens from the database. This is pure
 * housekeeping, not a security control - an expired token is already
 * unusable the moment it expires (RefreshTokenService.exchange rejects it on
 * the expiresAt check regardless of whether the row still exists). Without
 * this, the refresh_tokens table would otherwise grow forever, since every
 * login and every rotation adds a row that nothing else ever removes.
 */
@Slf4j
@Component
public class RefreshTokenCleanupTask {

  private final RefreshTokenRepository refreshTokenRepository;
  private final Duration revokedRetention;

  public RefreshTokenCleanupTask(
    RefreshTokenRepository refreshTokenRepository,
    @Value("${jwt.refresh-token.revoked-retention-days:1}") long revokedRetentionDays
  ) {
    this.refreshTokenRepository = refreshTokenRepository;
    this.revokedRetention = Duration.ofDays(revokedRetentionDays);
  }

  /**
   * Default: hourly. Override with
   * jwt.refresh-token.cleanup-cron (standard 6-field Spring cron syntax:
   * second minute hour day-of-month month day-of-week).
   */
  @Scheduled(cron = "${jwt.refresh-token.cleanup-cron:0 0 * * * *}")
  @Transactional
  public void deleteExpiredTokens() {
    log.info("Deleting expired refresh tokens scheduled task running");
    Instant now = Instant.now();
    Instant revokedCutoff = now.minus(revokedRetention);

    int deleted = refreshTokenRepository.deleteExpiredAndOldRevoked(now, revokedCutoff);
    if (deleted > 0) {
      log.info("Deleted {} expired/old-revoked refresh token(s)", deleted);
    }
  }
}
